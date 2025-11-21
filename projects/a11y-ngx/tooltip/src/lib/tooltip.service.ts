import {
    Injectable,
    Injector,
    Inject,
    OnDestroy,
    ComponentRef,
    EmbeddedViewRef,
    ViewRef,
    ApplicationRef,
    ComponentFactoryResolver,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import { auditTime, takeUntil } from 'rxjs/operators';

import { DOMHelperService, KEY } from '@a11y-ngx/dom-helper';
import { ScreenReaderOnlyComponent } from '@a11y-ngx/sr-only';
import type { ResponsiveImageAreaDirective } from '@a11y-ngx/responsive-image-maps';

import { WINDOW } from './tooltip.window.providers';
import { TooltipCreateService } from './tooltip.create.service';

import { TooltipComponent } from './tooltip.component';

import { TOOLTIP_CONFIG, TooltipDelayEvents, TooltipHostData } from './tooltip.type.private';
import { TooltipConfig } from './tooltip.type';

@Injectable()
export class TooltipService implements OnDestroy {
    customConfig: Partial<TooltipConfig> = {};
    private readonly config: Partial<TooltipConfig>;

    hostElement!: HTMLElement;

    tooltipComponent: TooltipComponent | undefined = undefined;
    private srOnlyComponentRef: ComponentRef<ScreenReaderOnlyComponent> | undefined = undefined;

    get tooltipEmpty(): boolean {
        return this.tooltipPlainText.trim().length === 0;
    }

    private get hostView(): ViewRef {
        return (this.srOnlyComponentRef as ComponentRef<ScreenReaderOnlyComponent>).hostView;
    }

    tooltipId!: string;
    private tooltipText!: string;
    private tooltipPlainText!: string;
    private tooltipImageArea: DOMRect | undefined = undefined;
    tooltipFromTitle: boolean = false;

    isFocused: boolean = false;
    isHovered: boolean = false;

    shouldDelay: boolean = false;

    private originalFadeDelayMs: number = 0;
    private canBeAriaLabelled: boolean = false;

    private destroyTimeoutID: ReturnType<typeof setTimeout> | undefined = undefined;

    set tooltip(text: string) {
        this.tooltipText = text?.replace(/<(?!\/?b>|\/?strong>|\/?i>|\/?em>|br\s*\/?>)[^>]+>/gi, '').trim();
        this.tooltipPlainText = text
            ?.replace(/<[^>]*>/g, '')
            .replace(/[^\w.,¡!¿? -]/g, '')
            .trim();
        this.setSROnlyText(this.tooltipPlainText);

        if (!this.tooltipComponent) return;

        this.tooltipComponent.customContent = this.tooltipText;
        if (this.tooltipComponent.isVisible) this.tooltipComponent.detectChanges();
    }

    /**
     * Which events (keyboard or mouse) are allowed to delay when show or hide.
     */
    get delayOnEvent(): TooltipDelayEvents {
        return { ...TOOLTIP_CONFIG.delayOnEvent, ...this.config.delayOnEvent } as TooltipDelayEvents;
    }
    set delayOnEvent(delayOnEvent: TooltipDelayEvents) {
        this.config.delayOnEvent = Object.keys(delayOnEvent).length ? delayOnEvent : undefined;
    }

    /**
     * Allows an animation when shows or hides the tooltip.
     */
    get animate(): boolean {
        return this.config.animate ?? TOOLTIP_CONFIG.animate;
    }
    set animate(animate: boolean) {
        this.config.animate = this.DOMHelper.getBooleanValue(animate) ?? undefined;
    }

    /**
     * Allows for the tooltip to prevail visible when the mouse hovers it.
     */
    get prevail(): boolean {
        return this.config.prevail ?? TOOLTIP_CONFIG.prevail;
    }
    set prevail(prevail: boolean) {
        this.config.prevail = this.DOMHelper.getBooleanValue(prevail) ?? undefined;
    }

    /**
     * Establish if the tooltip should be applied as a label (`aria-label`) within the host element.
     */
    get asLabel(): boolean {
        return this.config.asLabel ?? TOOLTIP_CONFIG.asLabel;
    }
    set asLabel(asLabel: boolean) {
        this.config.asLabel = this.DOMHelper.getBooleanValue(asLabel) ?? undefined;
    }

    /**
     * The event key codes to allow toggle the tooltip.
     */
    get toggleOn(): string[] {
        return this.config.toggleOn ?? TOOLTIP_CONFIG.toggleOn;
    }
    set toggleOn(toggleOn: string[]) {
        this.config.toggleOn = toggleOn;
    }

    private hostData: TooltipHostData = { nodeName: '', text: {}, is: {} };

    constructor(
        private componentFactory: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private DOMHelper: DOMHelperService,
        private tooltipCreateService: TooltipCreateService,
        @Inject(WINDOW) private window: Window | undefined,
        @Inject(DOCUMENT) public document: Document
    ) {
        this.config = this.tooltipCreateService.globalConfig;

        this.originalFadeDelayMs = this.config.fadeDelayMs as number;
    }

    ngOnDestroy(): void {
        this.destroyTooltip();
        this.destroySROnly();
    }

    init(): void {
        this.hostData.nodeName = this.hostElement.nodeName.toLowerCase();
        this.hostData.is.abbr = this.hostElement.matches('abbr');
        this.hostData.is.area = this.hostElement.matches('area');
        this.hostData.is.img = this.DOMHelper.isImageElement(this.hostElement);

        this.hostData.text.ariaLabel = this.getAttrValue('aria-label');
        this.hostData.text.ariaLabelledBy = this.getAttrValue('aria-labelledby');

        if (this.hostData.is.img) {
            this.hostData.text.alt = this.getAttrValue('alt');
            const attrAlt: boolean = this.hostData.text.alt !== '';
            const attrAriaLabel: boolean = this.hostData.text.ariaLabel !== '';
            const attrAriaLabelledBy: boolean = this.hostData.text.ariaLabelledBy !== '';
            this.hostData.is.imgWithNoAlt = !attrAlt && !attrAriaLabel && !attrAriaLabelledBy;
        }

        if (!this.hostData.is.imgWithNoAlt) this.canBeAriaLabelled = this.DOMHelper.canBeAriaLabelled(this.hostElement);

        this.checkHostHasText();
        this.initAttributes();

        if (this.hostData.is.abbr) this.createSROnlyElement();
    }

    setTooltipConfig(config: Partial<TooltipConfig>): void {
        if (this.tooltipComponent) {
            this.tooltipComponent.setOverlayConfig(config);

            const isVisible: boolean = this.tooltipComponent.isVisible;

            if (('position' in config || config.boundary instanceof HTMLElement) && isVisible) {
                this.tooltipComponent.recalculate();
            }
        }

        if ('fadeDelayMs' in config) this.originalFadeDelayMs = config.fadeDelayMs as number;
        if ('delayOnEvent' in config) this.delayOnEvent = config.delayOnEvent as TooltipDelayEvents;
        if ('animate' in config) this.animate = config.animate as boolean;
        if ('prevail' in config) this.prevail = config.prevail as boolean;
        if ('asLabel' in config) {
            this.asLabel = config.asLabel as boolean;
            this.initAttributes();
        }
        if ('toggleOn' in config && Array.isArray(config.toggleOn)) this.toggleOn = config.toggleOn;
    }

    createTooltip(isMouseEnter: boolean): void {
        this.killDestroyTimeout();

        if (this.tooltipComponent) {
            this.tooltipComponent.fadeDelayMs = this.originalFadeDelayMs;
            return;
        }

        this.checkImageArea();
        this.initAttrAriaDescribedBy();

        this.tooltipComponent = this.tooltipCreateService.createTooltip(
            this.tooltipImageArea ?? this.hostElement,
            this.tooltipText,
            this.customConfig
        );

        if (isMouseEnter) this.document.addEventListener('keyup', this.onTooltipEscapeKey);

        if (this.prevail) {
            this.tooltipComponent.nativeElement.addEventListener('mouseenter', this.tooltipPrevailOnMouseEnter);
            this.tooltipComponent.nativeElement.addEventListener('mouseleave', this.tooltipPrevailOnMouseLeave);
        }

        this.tooltipComponent.tooltipId = this.tooltipId;
        this.tooltipComponent.attrAnimate = this.animate || null;

        this.tooltipComponent.fadeDelayMs = this.shouldDelay ? this.originalFadeDelayMs : 0;
        this.tooltipComponent.show();

        this.initImageAreaListeners();
    }

    destroyTooltip(): void {
        if (!this.tooltipComponent || this.isFocused) return;

        // To hide it instantly in case the user has chosen a higher value
        this.tooltipComponent.fadeDelayMs = 0;

        const delay: number = this.shouldDelay ? this.originalFadeDelayMs : 0;

        this.destroyTimeoutID = setTimeout(() => {
            if (this.tooltipComponent) this.tooltipComponent.destroyTooltip();
            this.tooltipComponent = undefined;
            this.tooltipImageArea = undefined;
            this.setAttrValue('aria-describedby', null);
            this.document.removeEventListener('keyup', this.onTooltipEscapeKey);
        }, delay);
    }

    private onTooltipEscapeKey = ((event: KeyboardEvent): void => {
        if (event.code === KEY.ESCAPE && this.tooltipComponent?.isVisible) {
            event.stopImmediatePropagation();
            this.destroyTooltip();
            this.document.removeEventListener('keyup', this.onTooltipEscapeKey);
        }
    }).bind(this);

    private initAttributes(): void {
        // Set an empty 'title' attribute if is '<abbr>' or text is coming from the actual title attr, or removes it otherwise
        this.setAttrValue('title', this.hostData.is.abbr || this.tooltipFromTitle ? '' : null);

        // If it is an image with no text, set "alt"
        if (this.hostData.is.imgWithNoAlt) this.setAttrValue('alt', this.tooltipPlainText);
        // If can't be labelled, create the sr-only element after the host
        else if (!this.canBeAriaLabelled) {
            if (!this.isSameInnerTextAsTooltip) this.createSROnlyElement();
        }
        // If asked to be forced as label, set "aria-label"
        else if (this.asLabel) this.setAttrValue('aria-label', this.tooltipPlainText);
    }

    private initAttrAriaDescribedBy(): void {
        const hostFocused: boolean = this.document.activeElement === this.hostElement;
        if (!hostFocused) return;

        const ariaDescribedBy: string | null = !this.isSameInnerTextAsTooltip ? this.tooltipId : null;
        this.setAttrValue('aria-describedby', ariaDescribedBy);
    }

    private get isSameInnerTextAsTooltip(): boolean {
        return (this.hostData.text.inner ?? '').toLocaleLowerCase() === this.tooltipPlainText.toLocaleLowerCase();
    }

    private killDestroyTimeout(): void {
        clearTimeout(this.destroyTimeoutID);
        this.destroyTimeoutID = undefined;
    }

    private checkHostHasText(): void {
        const hasLength = (text: string): boolean => text.trim().length > 0;

        const ariaLabelText: string = this.getAttrValue('aria-label');
        if (hasLength(ariaLabelText)) {
            this.hostData.text.inner = ariaLabelText;
            return;
        }

        const ariaLabelledByIDs: string = this.getAttrValue('aria-labelledby');
        if (hasLength(ariaLabelledByIDs)) {
            const ariaLabelledByText: string = (
                this.document.querySelector(`#${ariaLabelledByIDs.split(' ')[0]}`) as HTMLElement
            ).innerText;
            if (hasLength(ariaLabelledByText)) {
                this.hostData.text.inner = ariaLabelledByText;
                return;
            }
        }

        const innerTextText: string = this.hostElement.innerText;
        if (hasLength(innerTextText)) {
            this.hostData.text.inner = innerTextText;
            return;
        }

        const altValueText: string = this.getAttrValue('alt');
        const {
            is: { area: isArea, img: isImg },
        } = this.hostData;
        if ((isImg || isArea) && hasLength(altValueText)) {
            this.hostData.text.inner = altValueText;
            return;
        }

        const inputValueText: string = this.getAttrValue('value');
        const inputValue: boolean = this.hostElement.matches('input') && hasLength(inputValueText);
        if (inputValue) {
            this.hostData.text.inner = inputValueText;
            return;
        }
    }

    private createSROnlyElement(): void {
        const srOnlyElement: HTMLElement = this.getSROnlyComponent(this.tooltipPlainText);
        const parentElement: HTMLElement = this.hostElement.parentElement as HTMLElement;
        const insertBeforeElement: HTMLElement = this.hostElement.nextSibling as HTMLElement;

        this.DOMHelper.r2.insertBefore(parentElement, srOnlyElement, insertBeforeElement);
    }

    private getSROnlyComponent(text: string): HTMLElement {
        if (!this.srOnlyComponentRef) this.createSROnly(text);
        else this.setSROnlyText(text);

        return (this.hostView as EmbeddedViewRef<unknown>)?.rootNodes[0] as HTMLElement;
    }

    private setSROnlyText(text: string): void {
        if (!this.srOnlyComponentRef) return;

        this.srOnlyComponentRef.instance.text = `(${text})`;
    }

    private createSROnly(text: string): void {
        this.srOnlyComponentRef = this.componentFactory
            .resolveComponentFactory(ScreenReaderOnlyComponent)
            .create(this.injector);

        // Attach the view to the app.
        this.appRef.attachView(this.hostView);

        this.setSROnlyText(text);
    }

    private destroySROnly(): void {
        if (!this.srOnlyComponentRef) return;

        this.appRef.detachView(this.hostView);
        this.srOnlyComponentRef.destroy();
        this.srOnlyComponentRef = undefined;
    }

    private tooltipPrevailOnMouseEnter = ((): void => this.killDestroyTimeout()).bind(this);
    private tooltipPrevailOnMouseLeave = ((): void => this.destroyTooltip()).bind(this);

    private setAttrValue(attr: string, value: string | null): void {
        if (value !== null) this.DOMHelper.r2.setAttribute(this.hostElement, attr, value);
        else this.DOMHelper.r2.removeAttribute(this.hostElement, attr);
    }

    private getAttrValue(attr: string): string {
        return (this.DOMHelper.getAttributeValue(this.hostElement, attr) ?? '').trim();
    }

    private initImageAreaListeners(): void {
        if (!this.window || !this.tooltipImageArea || !this.tooltipComponent) return;

        fromEvent(this.window, 'scroll')
            .pipe(auditTime(10), takeUntil(this.tooltipComponent.destroy$))
            .subscribe(() => this.updateImageArea());

        fromEvent(this.window, 'resize')
            .pipe(auditTime(10), takeUntil(this.tooltipComponent.destroy$))
            .subscribe(() => this.updateImageArea());
    }

    private updateImageArea(): void {
        if (!this.tooltipComponent) return;

        this.checkImageArea();
        this.tooltipComponent.setBaseConfig({ trigger: this.tooltipImageArea });
        this.tooltipComponent.recalculate();
    }

    private checkImageArea(): void {
        if (!this.hostData.is.area) return;

        this.tooltipImageArea = this.responsiveImageAreaDirective?.getBoundingClientRect();
    }

    private get responsiveImageAreaDirective(): ResponsiveImageAreaDirective | null {
        if (!this.window) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ngGlobal: any = (this.window as any).ng;

        try {
            const directives: unknown[] | undefined = ngGlobal?.getDirectives(this.hostElement) as
                | unknown[]
                | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (directives?.find((d: any) => d?.constructor?.name === 'ResponsiveImageAreaDirective') ??
                null) as ResponsiveImageAreaDirective | null;
        } catch {
            return null;
        }
    }
}
