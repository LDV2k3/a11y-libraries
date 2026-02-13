import {
    Directive,
    Input,
    Output,
    ElementRef,
    OnChanges,
    OnDestroy,
    Renderer2,
    EventEmitter,
    ChangeDetectorRef,
    SimpleChanges,
    Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    ColorScheme,
    ColorSchemeProperties,
    ColorSchemeService,
    ColorSchemeStylesConfig,
} from '@a11y-ngx/color-scheme';
import { TabCycleDirective, TabCycleFirstFocus } from '@a11y-ngx/tab-cycle';
import { DOMHelperService } from '@a11y-ngx/dom-helper';
import {
    OverlayBase,
    OverlayBaseCalculatedPosition,
    OverlayBaseAlignmentsAllowed,
    OverlayBaseSafeSpace,
    OverlayBasePosition,
    OverlayBasePositionStrategy,
    OverlayBasePositionsAllowed,
    OverlayBasePositionInput,
    OverlayBaseMaxSize,
} from '@a11y-ngx/overlay-base';

import { OverlayService } from './overlay.service';
import { OverlayArrowService } from './overlay-arrow.service';

import { OverlayArrowComponent } from './overlay-arrow.component';

import { OVERLAY_DEFAULTS, OverlayRootConfig, OverlayCustomConfig } from './overlay.type';
import {
    OVERLAY_SELECTOR,
    OVERLAY_SELECTOR_BASE,
    OVERLAY_SELECTOR_DIRECTIVE,
    OVERLAY_SELECTOR_EXPORT,
    OVERLAY_CSS_PROPERTIES_DIRECTIVE,
    OverlayDirectiveConfig,
    OverlayAllowClose,
    OverlayCSSProperty,
} from './overlay.type.private';

@Directive({
    selector: OVERLAY_SELECTOR_DIRECTIVE,
    exportAs: OVERLAY_SELECTOR_EXPORT,
    host: {
        '[style]': 'cssCustomVariables',
        '[style.display]': `!directiveConfig.show ? 'none' : 'flex'`,
        '[style.position]': `firstCalc ? 'fixed' : positionStrategy`,
        '[style.width]': 'styleWidth',
        '[style.--max-width]': 'styleMaxWidth',
        '[style.--max-height]': 'styleMaxHeight',
        '[style.--ao-max-width]': 'inputMaxWidth && isMaxWidthAuto ? null : inputMaxWidth',
        '[style.--ao-max-height]': 'inputMaxHeight ? inputMaxHeight : null',
        //'[style.--ao-max-height]': 'inputMaxHeight ?? null', // Use this once migrated to Angular 17
        '[attr.visible]': `isVisible ? '' : null`,
        '[attr.fade]': `isVisible && isOpaque ? '' : null`,
    },
})
export class OverlayDirective extends OverlayBase implements OnChanges, OnDestroy {
    @Input('config') inputConfig: OverlayCustomConfig | string | undefined = undefined;
    @Input('trigger') inputTrigger: HTMLElement | undefined = undefined;
    @Input('boundary') inputBoundary: string | HTMLElement | undefined = undefined;
    @Input('position') inputPosition: OverlayBasePositionInput | undefined = undefined;
    @Input('positionStrategy') inputPositionStrategy: OverlayBasePositionStrategy | undefined = undefined;
    @Input('positionsAllowed') inputPositionsAllowed: OverlayBasePositionsAllowed | undefined = undefined;
    @Input('alignmentsAllowed') inputAlignmentsAllowed: OverlayBaseAlignmentsAllowed | undefined = undefined;
    @Input('fluidAlignment') inputFluidAlignment: boolean | undefined = undefined;
    @Input('fluidSize') inputFluidSize: boolean | undefined = undefined;
    @Input('safeSpace') inputSafeSpace: OverlayBaseSafeSpace | undefined = undefined;
    @Input('arrowSize') inputArrowSize: number | undefined = undefined;
    @Input('offsetSize') inputOffsetSize: number | undefined = undefined;
    @Input('fadeMs') inputFadeMs: number | undefined = undefined;
    @Input('fadeDelayMs') inputFadeDelayMs: number | undefined = undefined;
    @Input('zIndex') inputZIndex: number | undefined = undefined;
    @Input('padding') inputPadding: string | undefined = undefined;
    @Input('shadow') inputShadow: string | undefined = undefined;
    @Input('shadowColor') inputShadowColor: string | undefined = undefined;
    @Input('backgroundColor') inputBackgroundColor: string | undefined = undefined;
    @Input('textColor') inputTextColor: string | undefined = undefined;
    @Input('borderSize') inputBorderSize: string | undefined = undefined;
    @Input('borderColor') inputBorderColor: string | undefined = undefined;
    @Input('borderRadius') inputBorderRadius: number | undefined = undefined;

    @Input('maxWidth') inputMaxWidth: string = 'auto';
    @Input('maxHeight') inputMaxHeight: string | undefined = undefined;

    @Input('allowScrollListener') inputAllowScrollListener: boolean | undefined = undefined;
    @Input('allowClose') inputAllowClose: boolean | OverlayAllowClose | undefined = undefined;
    @Input('allowTabCycle') inputAllowTabCycle: boolean | undefined = undefined;
    @Input('firstFocusOn') inputFirstFocusOn: TabCycleFirstFocus = undefined;

    @Input('forceScheme') inputForceScheme: ColorScheme | undefined = undefined;

    @Input(OVERLAY_SELECTOR_EXPORT) private set inputIsDirective(isDirective: string) {
        this.isDirective = typeof isDirective === 'string';
    }

    protected get cssCustomVariables(): CSSStyleDeclaration {
        const alignJustifyFlex: string = this.isTop || this.isLeft ? 'flex-end' : 'flex-start';
        return {
            flexDirection: 'column',
            alignItems: alignJustifyFlex,
            justifyContent: alignJustifyFlex,
            ...this.customStyles,
        } as CSSStyleDeclaration;
    }

    protected styleWidth: string | null = null;
    protected styleMaxWidth: string | null = null;
    protected styleMaxHeight: string | null = null;

    @Output() readonly overlayOpen: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly overlayClose: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly overlayToggle: EventEmitter<string> = new EventEmitter<string>();

    protected readonly directiveConfig: Partial<
        OverlayCustomConfig & OverlayDirectiveConfig & ColorSchemeStylesConfig
    > = {};

    /**
     * @description
     * The listeners for the instance.
     */
    private readonly listenTo: { [listener: string]: (() => void) | undefined } = {
        closeEscape: undefined,
        closeClickOutside: undefined,
        tabCycle: undefined,
    };

    readonly destroy$: Subject<void> = new Subject<void>();

    /**
     * @description
     * To listen to the data when the directive updates the host's position.
     */
    readonly overlayUpdated$: Subject<OverlayBaseCalculatedPosition> = new Subject<OverlayBaseCalculatedPosition>();

    /**
     * @description
     * Timeout ID to cancel the `hide()` in case `show()` re-triggers.
     */
    private timeoutID!: ReturnType<typeof setTimeout>;

    /**
     * @description
     * To handle things on 1st calculations.
     */
    protected firstCalc: boolean = true;

    /**
     * @description
     * To manage the Tab Cycle.
     */
    private tabCycleDirective: TabCycleDirective | undefined = undefined;

    /**
     * @description
     * To manage the Arrow.
     */
    private arrowComponent: OverlayArrowComponent | undefined = undefined;

    /**
     * @description
     * The Overlay should be reachable within the DOM (not 'visually visible').
     */
    private set overlayShow(show: boolean) {
        this.directiveConfig.show = show;
        this.detectChanges();
    }

    /**
     * @description
     * The Overlay should fade in (`true`) or out (`false`).
     */
    private set overlayFade(fade: boolean) {
        this.directiveConfig.fade = fade;
        this.detectChanges();
    }

    /**
     * @description
     * If the `maxWidth` input is set to 'auto' (`true`) or customized by the user (`false`).
     */
    protected get isMaxWidthAuto(): boolean {
        return this.inputMaxWidth === 'auto';
    }

    /**
     * @description
     * To save the custom styles of the instance.
     */
    private customStyles: CSSStyleDeclaration | undefined = undefined;

    /**
     * @description
     * The custom selector.
     */
    private customSelector: string | undefined = undefined;

    /**
     * @description
     * For internal use and to set inline styles.
     */
    private isDirective: boolean = false;

    /**
     * @description
     * The Overlay host element.
     */
    get nativeElement(): HTMLElement {
        return this.hostOverlayElement.nativeElement;
    }

    /**
     * @description
     * The Overlay is "visible".
     *
     * It means that the host element is reachable within the DOM.
     *
     * It doesn't mean is "visually visible" (that depends on `isOpaque`).
     */
    get isVisible(): boolean {
        return this.directiveConfig.show ?? false;
    }

    /**
     * @description
     * The Overlay is "visually visible", is opaque.
     *
     * It means that its opacity is at a 100%.
     */
    get isOpaque(): boolean {
        return this.directiveConfig.fade ?? false;
    }

    /**
     * @description
     * If Close on Escape is allowed or not.
     */
    private get allowCloseEscape(): boolean {
        return (
            this.directiveConfig.closeEscape ??
            (this.DOMHelper.getBooleanValue(OVERLAY_DEFAULTS.allowClose as boolean) as boolean)
        );
    }
    private set allowCloseEscape(allowCloseEscape: boolean) {
        this.directiveConfig.closeEscape = allowCloseEscape;
    }

    /**
     * @description
     * If Close on Click Outside is allowed or not.
     */
    private get allowCloseClickOutside(): boolean {
        return (
            this.directiveConfig.closeClickOutside ??
            (this.DOMHelper.getBooleanValue(OVERLAY_DEFAULTS.allowClose as boolean) as boolean)
        );
    }
    private set allowCloseClickOutside(allowCloseClickOutside: boolean) {
        this.directiveConfig.closeClickOutside = allowCloseClickOutside;
    }

    /**
     * @description
     * If Tab Cycle is allowed or not.
     */
    private get allowTabCycle(): boolean {
        return this.directiveConfig.tabCycle ?? OVERLAY_DEFAULTS.allowTabCycle;
    }
    private set allowTabCycle(allowTabCycle: boolean) {
        this.directiveConfig.tabCycle = this.DOMHelper.getBooleanValue(allowTabCycle) ?? undefined;
    }

    /**
     * @description
     * To set the initial focus.
     */
    private get firstFocusOn(): TabCycleFirstFocus {
        return this.directiveConfig.firstFocusOn ?? OVERLAY_DEFAULTS.firstFocusOn;
    }
    private set firstFocusOn(firstFocusOn: TabCycleFirstFocus) {
        this.directiveConfig.firstFocusOn = ['first', 'last', undefined].includes(firstFocusOn)
            ? firstFocusOn
            : undefined;
    }

    /**
     * @description
     * Border size (translated to pixels).
     *
     * @default 1
     */
    get borderSize(): number {
        return this.directiveConfig.borderSize ?? OVERLAY_DEFAULTS.borderSize;
    }
    set borderSize(borderSize: number) {
        const numericBorderSize: number | null = this.DOMHelper.getNumericValue(borderSize);
        this.directiveConfig.borderSize = numericBorderSize !== null ? Math.max(numericBorderSize, 0) : undefined;
    }

    /**
     * @description
     * Arrow size (translated to pixels).
     *
     * @default 7
     */
    get arrowSize(): number {
        return this.directiveConfig.arrowSize ?? OVERLAY_DEFAULTS.arrowSize;
    }
    set arrowSize(arrowSize: number) {
        const numericArrowSize: number | null = this.DOMHelper.getNumericValue(arrowSize);
        this.directiveConfig.arrowSize = numericArrowSize !== null ? Math.max(numericArrowSize, 0) : undefined;
        this.setArrow();
    }

    /**
     * @description
     * Fade in/out timeout (translated to milliseconds).
     *
     * It's the sum between `fadeMs` and `fadeDelayMs`.
     *
     * @default 150
     */
    get fadeMs(): number {
        return (this.directiveConfig.fadeMs ?? OVERLAY_DEFAULTS.fadeMs) + this.fadeDelayMs;
    }
    set fadeMs(fadeMs: number) {
        const numericFadeMs: number | null = this.DOMHelper.getNumericValue(fadeMs);
        this.directiveConfig.fadeMs = numericFadeMs !== null ? Math.max(numericFadeMs, 0) : undefined;
    }

    /**
     * @description
     * Delay the fade in/out timeout (translated to milliseconds).
     *
     * @default 0
     */
    get fadeDelayMs(): number {
        return this.directiveConfig.fadeDelayMs ?? OVERLAY_DEFAULTS.fadeDelayMs;
    }
    set fadeDelayMs(fadeDelayMs: number) {
        const numericFadeDelayMs: number | null = this.DOMHelper.getNumericValue(fadeDelayMs);
        this.directiveConfig.fadeDelayMs = numericFadeDelayMs !== null ? Math.max(numericFadeDelayMs, 0) : undefined;
    }

    /**
     * @description
     * zIndex.
     *
     * @default 9999
     */
    get zIndex(): number {
        return this.directiveConfig.zIndex ?? OVERLAY_DEFAULTS.zIndex;
    }
    set zIndex(zIndex: number) {
        this.directiveConfig.zIndex = this.DOMHelper.getNumericValue(zIndex) ?? undefined;
    }

    get r2(): Renderer2 {
        return this.renderer2;
    }

    constructor(
        public DOMHelper: DOMHelperService,
        private overlayService: OverlayService,
        private hostOverlayElement: ElementRef,
        private overlayArrowService: OverlayArrowService,
        private colorSchemeService: ColorSchemeService,
        private renderer2: Renderer2,
        private cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) private document: Document
    ) {
        super();
        this.overlayShow = false;
        this.overlayFade = false;

        const overlayGlobalConfig: OverlayRootConfig = this.overlayService.globalConfig;

        this.setBaseConfig({ ...overlayGlobalConfig, ...this.overlayConfig });
        this.setOverlayConfig(overlayGlobalConfig);

        this.r2.setAttribute(this.nativeElement, OVERLAY_SELECTOR_BASE, '');
    }

    ngOnChanges(changes: SimpleChanges): void {
        const inputConfig = changes.inputConfig?.currentValue;
        const { custom, module } = this.overlayService.getProcessedConfig(inputConfig);

        const setChangeValue = <T>(name: string, inputName: string) => {
            if (custom && changes[inputName]?.currentValue !== undefined) {
                (custom[name as keyof OverlayCustomConfig] as T) = changes[inputName].currentValue as T;
            }
        };

        setChangeValue<HTMLElement>('trigger', 'inputTrigger');
        setChangeValue<string | HTMLElement>('boundary', 'inputBoundary');
        setChangeValue<OverlayBasePositionInput>('position', 'inputPosition');
        setChangeValue<OverlayBasePositionStrategy>('positionStrategy', 'inputPositionStrategy');
        setChangeValue<OverlayBasePositionsAllowed>('positionsAllowed', 'inputPositionsAllowed');
        setChangeValue<OverlayBaseAlignmentsAllowed>('alignmentsAllowed', 'inputAlignmentsAllowed');
        setChangeValue<boolean>('fluidAlignment', 'inputFluidAlignment');
        setChangeValue<boolean>('fluidSize', 'inputFluidSize');
        setChangeValue<OverlayBaseSafeSpace>('safeSpace', 'inputSafeSpace');
        setChangeValue<number>('offsetSize', 'inputOffsetSize');
        setChangeValue<boolean>('allowScrollListener', 'inputAllowScrollListener');
        setChangeValue<boolean | OverlayAllowClose>('allowClose', 'inputAllowClose');
        setChangeValue<boolean>('allowTabCycle', 'inputAllowTabCycle');
        setChangeValue<TabCycleFirstFocus>('firstFocusOn', 'inputFirstFocusOn');
        setChangeValue<boolean>('forceScheme', 'inputForceScheme');

        Object.keys(OVERLAY_CSS_PROPERTIES_DIRECTIVE).forEach((property: string) => {
            const item: OverlayCSSProperty = OVERLAY_CSS_PROPERTIES_DIRECTIVE[property];
            const itemValue: string | number = changes[item.inputProperty]?.currentValue;

            if (custom && ['string', 'number'].includes(typeof itemValue)) {
                (custom[property as keyof OverlayCustomConfig] as number | string) = item.typeNumber
                    ? (this.DOMHelper.getNumericValue(itemValue) as number)
                    : (itemValue as string);
            }
        });

        const offsetSize: number = this.overlayService.getProcessedOffset({ custom, module });
        const className: string[] = this.overlayService.getProcessedClassNames({ custom, module });
        const hasColorSchemeConfigured: boolean = this.colorSchemeService.isSelectorInConfig(
            custom.selector ?? OVERLAY_SELECTOR
        );

        const theStyles: OverlayCustomConfig = hasColorSchemeConfigured ? custom : { ...module, ...custom };

        this.setBaseConfig({ ...module, ...custom, offsetSize });
        this.setOverlayConfig({ ...module, ...custom, className });
        this.setStyles(theStyles);
    }

    ngOnDestroy(): void {
        this.hideHandler(false);

        this.destroy$.next();
        this.destroy$.complete();

        this.overlayUpdated$.complete();
    }

    /**
     * @description
     * Removes the listener.
     */
    private removeListener(listener: string): void {
        if (typeof this.listenTo[listener] !== 'function') return;

        (this.listenTo[listener] as () => void)();
        this.listenTo[listener] = undefined;
    }

    /**
     * @description
     * Allow to close the Overlay on Escape, if `allowClose` or `allowClose.escape` is set to `true`.
     *
     * @param { boolean } enable - Establishes if sets or removes the listener for the Escape key.
     */
    private setEscapeKey(enable: boolean = true): void {
        if (!this.allowCloseEscape) return;

        if (!enable) {
            this.removeListener('closeEscape');
            return;
        }

        const listenElement: HTMLElement | Document = this.allowTabCycle
            ? this.nativeElement
            : this.triggerElement ?? this.document;

        if (listenElement)
            this.listenTo.closeEscape = this.r2.listen(listenElement, 'keydown.escape', this.manageEscapeKey);
    }

    /**
     * @description
     * Close on Escape callback.
     */
    private manageEscapeKey = ((e: KeyboardEvent): void => {
        if (!this.isVisible) return;

        e.stopPropagation();
        e.preventDefault();
        this.hideHandler();
    }).bind(this);

    /**
     * @description
     * Allow to close the Overlay on clicking outside of it, if `allowClose` or `allowClose.clickOutside` is set to `true`.
     *
     * @param { boolean } enable - Establishes if sets or removes the listener for the click event.
     */
    private setClickOutside(enable: boolean = true): void {
        if (!this.allowCloseClickOutside) return;

        if (!enable) {
            this.removeListener('closeClickOutside');
            return;
        }

        this.listenTo.closeClickOutside = this.r2.listen(this.document, 'click', this.manageClickOutside);
    }

    /**
     * @description
     * Close on Click Outside callback.
     */
    private manageClickOutside = ((e: PointerEvent): void => {
        if (!(this.isVisible && !this.nativeElement.contains(e.target as HTMLElement))) return;

        e.stopPropagation();
        e.preventDefault();
        this.hideHandler(false);
    }).bind(this);

    /**
     * @description
     * Set the Tab Cycle within the Overlay, if `allowTabCycle` is set to `true`.
     *
     * @param { boolean } enable - Establishes if sets or removes the Directive and the listener for the Tab key.
     */
    private setTabCycle(enable: boolean = true): void {
        if (!this.allowTabCycle) return;

        if (!enable) {
            if (this.tabCycleDirective) {
                this.tabCycleDirective.enabled = false;
                this.tabCycleDirective = undefined;
            }

            this.removeListener('tabCycle');

            return;
        }

        this.tabCycleDirective = new TabCycleDirective(this.hostOverlayElement, this.DOMHelper);
        this.tabCycleDirective.enabled = true;

        this.listenTo.tabCycle = this.r2.listen(
            this.nativeElement,
            'keydown',
            this.tabCycleDirective.manageKeyDown.bind(this.tabCycleDirective)
        );
    }

    /**
     * @description
     * Check if the arrow component should be created or destroyed.
     */
    private setArrow(): void {
        if (this.arrowSize > 0) {
            if (!this.arrowComponent)
                this.arrowComponent = this.overlayArrowService.createArrow(this.nativeElement, this);
            return;
        }

        this.arrowComponent?.destroyArrow();
    }

    /**
     * @description
     * Sets the focus either on the Overlay (if `firstFocusOn` is set to `undefined`) or
     * the first/last tabbable element.
     *
     * If no tabbable element is found, focus will be set on the Overlay.
     *
     * @param { boolean } setFocus - Establishes whether it has to set the focus (on Overlay or first/last tabbable element)
     * or not (returns to the trigger).
     */
    private setTabCycleFocus(setFocus: boolean = true, returnFocusToTrigger: boolean = true): void {
        if (!this.allowTabCycle) return;

        if (setFocus) {
            this.tabCycleDirective?.focus(this.firstFocusOn);
        } else if (returnFocusToTrigger) {
            this.triggerElement?.focus();
        }
    }

    /**
     * @description
     * Saves the given config into the Directive.
     *
     * @param { OverlayCustomConfig } config - The configuration.
     */
    setOverlayConfig(config: OverlayCustomConfig): void {
        if ('arrowSize' in config) this.arrowSize = config.arrowSize as number;
        if ('fadeMs' in config) this.fadeMs = config.fadeMs as number;
        if ('fadeDelayMs' in config) this.fadeDelayMs = config.fadeDelayMs as number;
        if ('zIndex' in config) this.zIndex = config.zIndex as number;
        if ('padding' in config) this.directiveConfig.padding = config.padding as string;
        if ('borderSize' in config) this.borderSize = config.borderSize as number;
        if ('maxWidth' in config) this.inputMaxWidth = config.maxWidth as string;
        if ('maxHeight' in config) this.inputMaxHeight = config.maxHeight as string;

        if ('forceScheme' in config && config.forceScheme) {
            const autoScheme: boolean = config.forceScheme.toLowerCase() === 'auto';
            const { attribute, value } = this.colorSchemeService.getAttributeSelector(config.forceScheme);

            if (!autoScheme) {
                this.directiveConfig.forceScheme = config.forceScheme;
                this.r2.setAttribute(this.nativeElement, attribute, value);
            } else {
                this.directiveConfig.forceScheme = undefined;
                this.r2.removeAttribute(this.nativeElement, attribute);
            }
        }

        if (this.isDirective) {
            if ('backgroundColor' in config) this.directiveConfig.backgroundColor = config.backgroundColor as string;
            if ('textColor' in config) this.directiveConfig.textColor = config.textColor as string;
            if ('borderColor' in config) this.directiveConfig.borderColor = config.borderColor as string;
            if ('borderRadius' in config)
                this.directiveConfig.borderRadius =
                    this.DOMHelper.getNumericValue(config.borderRadius) ?? OVERLAY_DEFAULTS.borderRadius;
            if ('shadow' in config) this.directiveConfig.shadow = config.shadow as string;
            if ('shadowColor' in config) this.directiveConfig.shadowColor = config.shadowColor as string;
        }

        if ('className' in config) {
            this.overlayService
                .getClassNames(config.className)
                ?.forEach((className) => this.r2.addClass(this.nativeElement, className));
        }

        if ('allowClose' in config) {
            const allowCloseEscape: boolean =
                this.DOMHelper.getBooleanValue((config.allowClose as OverlayAllowClose)?.escape) ??
                this.DOMHelper.getBooleanValue(config.allowClose as boolean) ??
                (this.DOMHelper.getBooleanValue(OVERLAY_DEFAULTS.allowClose as boolean) as boolean);
            const allowCloseClickOutside: boolean =
                this.DOMHelper.getBooleanValue((config.allowClose as OverlayAllowClose)?.clickOutside) ??
                this.DOMHelper.getBooleanValue(config.allowClose as boolean) ??
                (this.DOMHelper.getBooleanValue(OVERLAY_DEFAULTS.allowClose as boolean) as boolean);

            this.allowCloseEscape = allowCloseEscape;
            this.allowCloseClickOutside = allowCloseClickOutside;
        }

        if ('allowTabCycle' in config) this.allowTabCycle = config.allowTabCycle as boolean;
        if ('firstFocusOn' in config) this.firstFocusOn = config.firstFocusOn as TabCycleFirstFocus;
    }

    /**
     * @description
     * Process and set only the custom given styles, within the configuration object,
     * into the host (Overlay) element.
     *
     * @param { OverlayCustomConfig } theStyles - The styles to configure.
     */
    setStyles(theStyles: OverlayCustomConfig | undefined): void {
        const selector: string = this.customSelector ?? OVERLAY_SELECTOR;

        if (!this.isDirective) {
            // Inline custom styles for the component use only.
            const styles: ColorSchemeProperties = (theStyles ?? {}) as ColorSchemeProperties;
            this.customStyles = this.colorSchemeService.getCustomStyles(selector, styles);
            return;
        }

        // Inline styles for the directive use only.
        const currentScheme = this.colorSchemeService.getCurrentScheme(selector) ?? {};
        const padding = this.directiveConfig.padding ?? currentScheme.padding;
        const borderSize = `${this.borderSize}px`;
        const borderColor = this.directiveConfig.borderColor ?? currentScheme.borderColor;
        const border = `${borderSize} solid ${borderColor}`;
        const boxShadow = `${this.directiveConfig.shadow ?? currentScheme.shadow} ${
            this.directiveConfig.shadowColor ?? currentScheme.shadowColor
        }`;
        const borderRadius = `${this.directiveConfig.borderRadius ?? currentScheme.borderRadius}px`;
        const backgroundColor = this.directiveConfig.backgroundColor ?? currentScheme.backgroundColor;
        const color = this.directiveConfig.textColor ?? currentScheme.textColor;
        const zIndex = this.zIndex;
        const arrowSize = this.arrowSize;
        const fadeMs = `${this.fadeMs}ms`;

        this.customStyles = {
            border,
            borderRadius,
            backgroundColor,
            boxShadow,
            color,
            zIndex,
            padding,
            pointerEvents: 'initial',
            '--overlay-fade-ms': fadeMs,
            ...(arrowSize > 0
                ? {
                      '--arrow-fix': borderSize,
                      '--arrow-size': `${arrowSize}px`,
                      '--arrow-border-size': borderSize,
                      '--arrow-border-color': borderColor,
                      '--arrow-bg-color': backgroundColor,
                  }
                : {}),
        } as unknown as CSSStyleDeclaration;
    }

    /**
     * @description
     * To establish a custom selector.
     *
     * Specially when Overlay is used as a base for another component/library.
     */
    setCustomSelector(selector: string): void {
        this.customSelector = selector;
    }

    /**
     * @description
     * To force change detection.
     */
    detectChanges(): void {
        this.cdr.markForCheck();
    }

    /**
     * @description
     * Shows the Overlay.
     */
    show(): void {
        this.overlayShow = true;

        clearTimeout(this.timeoutID);

        setTimeout(() => {
            if (this.fluidSize && !this.isMaxWidthAuto) {
                this.maxSize.width = parseFloat(window.getComputedStyle(this.nativeElement, '::before').width) || 0;
                this.maxSize.height = parseFloat(window.getComputedStyle(this.nativeElement, '::after').height) || 0;
            }

            lastOverlayData.maxSize = { ...this.maxSize };

            this.setEscapeKey();
            this.setClickOutside();
            this.setTabCycle();
            this.setTabCycleFocus();

            this.overlayOpen.emit();
            this.overlayToggle.emit('open');
        }, 10);

        /**
         * @description
         * Process and set the values for `width`, `max-width` & `max-height`.
         *
         * @param { OverlayBaseMaxSize } maxSize - The given max sizes.
         */
        const updateMaxSizes = (maxSize?: OverlayBaseMaxSize) => {
            const viewportSize = this.viewportSizeSafe ?? this.viewportSize;

            const calcMaxWidth: number =
                maxSize?.width ?? (this.isTopBottom && this.fluidAlignment ? viewportSize.width : NaN);
            const setMaxWidth: string = this.DOMHelper.isNumeric(calcMaxWidth) ? `${calcMaxWidth}px, ` : '';

            const directiveOnlyHeight: number = this.isDirective ? this.borderSize * 2 : 0;
            const calcMaxHeight: number =
                maxSize?.height ?? (!this.isTopBottom && this.fluidAlignment ? viewportSize.height : NaN);
            const setMaxHeight: string = this.DOMHelper.isNumeric(calcMaxHeight)
                ? `${calcMaxHeight + directiveOnlyHeight}px, `
                : '';

            this.styleWidth = maxSize?.width ? `${maxSize.width}px` : 'max-content';
            this.styleMaxWidth = `min(${setMaxWidth}var(--ao-max-width, 100vw))`;
            this.styleMaxHeight = `min(${setMaxHeight}var(--ao-max-height, 100vh))`;
        };

        /**
         * @description
         * Verifies if the Overlay needs to recalculate its Position/Alignment.
         *
         * @param { OverlayBaseCalculatedPosition } overlayData - The latest Overlay render data.
         * @returns { boolean }
         */
        const needsToRecalc = (overlayData: OverlayBaseCalculatedPosition): boolean => {
            if (!(this.fluidSize && this.fluidAlignment)) return false;

            const {
                position: currentPosition,
                maxSize: { width: currentMaxWidth, height: currentMaxHeight } = { width: 0, height: 0 },
            } = overlayData;
            const {
                position: lastPosition,
                maxSize: { width: lastMaxWidth, height: lastMaxHeight } = { width: 0, height: 0 },
                triggerRect: { x: lastTriggerX, y: lastTriggerY },
            } = lastOverlayData;

            if (this.firstCalc && !lastPosition) lastOverlayData.position = currentPosition;

            const yTriggerMoved: boolean = lastTriggerY !== this.triggerRect.y;
            const xTriggerMoved: boolean = lastTriggerX !== this.triggerRect.x;
            const positionOverlayChanged: boolean = lastPosition !== currentPosition;
            const maxWidthOverlayChanged: boolean = currentMaxWidth > 0 && lastMaxWidth !== currentMaxWidth;
            const maxHeightOverlayChanged: boolean = currentMaxHeight !== null && lastMaxHeight !== currentMaxHeight;

            if (
                positionOverlayChanged ||
                (this.isTopBottom && (this.firstCalc || yTriggerMoved) && maxHeightOverlayChanged) ||
                (!this.isTopBottom && (this.firstCalc || xTriggerMoved) && maxWidthOverlayChanged)
            ) {
                if (positionOverlayChanged) lastOverlayData.position = currentPosition;
                if (maxWidthOverlayChanged) lastOverlayData.maxSize.width = currentMaxWidth;
                if (maxHeightOverlayChanged) lastOverlayData.maxSize.height = currentMaxHeight;
                if (yTriggerMoved || xTriggerMoved) lastOverlayData.triggerRect = this.triggerRect;

                return true;
            }

            return false;
        };

        const lastOverlayData: {
            position?: OverlayBasePosition;
            maxSize: OverlayBaseMaxSize;
            triggerRect: DOMRect;
        } = {
            triggerRect: this.virtualTriggerRect || this.triggerElement?.getBoundingClientRect(),
            maxSize: { width: 0, height: 0 },
        };

        updateMaxSizes();

        /**
         * @description
         * Attaches the Overlay and updates its position if changes are detected.
         */
        this.attachOverlay(this.nativeElement)
            .pipe(takeUntil(merge(this.destroy$, this.isDetached$)))
            .subscribe((overlayData: OverlayBaseCalculatedPosition) => {
                setTimeout(() => {
                    this.overlayFade = true;
                    this.detectChanges();
                }, this.fadeDelayMs);

                updateMaxSizes(overlayData.maxSize);

                if (needsToRecalc(overlayData)) {
                    this.recalculate();
                    return;
                }

                this.firstCalc = false;

                const { top, left, bottom, right } = overlayData.render;

                this.r2.setStyle(this.nativeElement, 'top', top !== null ? `${top}px` : null);
                this.r2.setStyle(this.nativeElement, 'left', left !== null ? `${left}px` : null);
                this.r2.setStyle(this.nativeElement, 'bottom', bottom !== null ? `${bottom}px` : null);
                this.r2.setStyle(this.nativeElement, 'right', right !== null ? `${right}px` : null);

                this.overlayUpdated$.next(overlayData);
            });
    }

    /**
     * @description
     * Hides the Overlay.
     */
    hide(): void {
        this.hideHandler();
    }

    /**
     * @description
     * Handles the "hide" of the Overlay internally.
     */
    private hideHandler(returnFocusToTrigger: boolean = this.triggerElement instanceof HTMLElement): void {
        this.setEscapeKey(false);
        this.setClickOutside(false);
        this.setTabCycle(false);
        this.setTabCycleFocus(false, returnFocusToTrigger);

        this.detachOverlay();

        if (!this.isVisible) return;

        setTimeout(() => {
            this.overlayFade = false;
            this.detectChanges();
        }, this.fadeDelayMs);

        this.timeoutID = setTimeout(() => {
            this.overlayShow = false;

            this.overlayClose.emit();
            this.overlayToggle.emit('close');
        }, this.fadeMs);
    }

    /**
     * @description
     * Toggles the Overlay between show/hide.
     */
    toggle(): void {
        if (!this.isVisible) {
            this.show();
        } else {
            this.hideHandler();
        }
    }
}
