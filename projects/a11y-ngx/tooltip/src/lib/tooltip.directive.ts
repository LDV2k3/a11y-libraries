import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';

import { KEY } from '@a11y-ngx/dom-helper';

import { TooltipService } from './tooltip.service';

import { TooltipConfig } from './tooltip.type';
import { TOOLTIP_SELECTOR, TOOLTIP_TOUCH_DELAY } from './tooltip.type.private';

let uid: number = 0;

@Directive({
    selector: `[tooltip]:not(iframe), [title]:not(iframe)`,
    exportAs: 'a11yTooltip',
    providers: [TooltipService],
    host: {
        '(keyup)': 'onTooltipToggle($event)',
        '(focus)': 'onTooltipShowHide($event)',
        '(mouseenter)': 'onTooltipShowHide($event)',
        '(blur)': 'onTooltipShowHide($event)',
        '(mouseleave)': 'onTooltipShowHide($event)',
        '(touchstart)': 'onTooltipTouchStart()',
        '(touchend)': 'onTooltipTouchEnd($event)',
        '(touchcancel)': 'onTooltipTouchCancel($event)',
        '(touchmove)': 'onTooltipTouchCancel($event)',
    },
})
export class TooltipDirective implements AfterViewInit {
    @Input() set tooltip(text: string) {
        this.service.tooltip = text;
    }
    @Input() set title(text: string) {
        this.tooltip = text;
        this.service.tooltipFromTitle = true;
    }
    @Input() set tooltipConfig(config: Partial<TooltipConfig>) {
        this.service.customConfig = config ?? {};
        this.service.setTooltipConfig(config ?? {});
    }

    private isLongPress: boolean = false;
    private longPressTimeoutID: ReturnType<typeof setTimeout> | undefined = undefined;

    constructor(private hostElement: ElementRef<HTMLElement>, private service: TooltipService) {
        this.service.tooltipId = `${TOOLTIP_SELECTOR}-${uid++}`;
        this.service.hostElement = this.hostElement.nativeElement;
    }

    ngAfterViewInit(): void {
        this.service.init();
    }

    /**
     * @description — Recalculate position on demand.
     */
    recalculate(): void {
        this.service.tooltipComponent?.recalculate();
    }

    protected onTooltipToggle(event: KeyboardEvent): void {
        if (!this.service.tooltipComponent) return;

        if (event.code === KEY.ESCAPE && this.service.tooltipComponent.isVisible) {
            event.stopImmediatePropagation();
            this.service.tooltipComponent.hide();
        }

        if (this.service.toggleOn?.includes(event.code)) {
            this.service.tooltipComponent.toggle();
        }
    }

    protected onTooltipShowHide(event: MouseEvent | FocusEvent): void {
        if (this.service.tooltipEmpty) return;

        const isBlur: boolean = event.type === 'blur';
        const isFocus: boolean = event.type === 'focus';
        const isMouseLeave: boolean = event.type === 'mouseleave';
        const isMouseEnter: boolean = event.type === 'mouseenter';

        if (isFocus) this.service.isFocused = true;
        if (isBlur) this.service.isFocused = false;
        if (isMouseEnter) this.service.isHovered = true;
        if (isMouseLeave) this.service.isHovered = false;

        if ((this.service.isFocused && isMouseLeave) || (this.service.isHovered && isBlur)) return;

        const { keyboard: delayOnKeyboard, mouse: delayOnMouse } = this.service.delayOnEvent;
        this.service.shouldDelay =
            (delayOnKeyboard && (isFocus || isBlur)) || (delayOnMouse && (isMouseEnter || isMouseLeave));

        if (isFocus || isMouseEnter) {
            this.service.createTooltip(isMouseEnter);
        } else if (isBlur || isMouseLeave) {
            this.service.destroyTooltip();
        }
    }

    protected onTooltipTouchStart(): void {
        this.isLongPress = false;

        this.longPressTimeoutID = setTimeout(() => {
            this.isLongPress = true;

            this.service.shouldDelay = this.service.delayOnEvent.touch;

            navigator?.vibrate(50);
            this.service.createTooltip(false);
            this.service.document.addEventListener('touchstart', () => this.service.destroyTooltip(), { once: true });
        }, TOOLTIP_TOUCH_DELAY);
    }

    protected onTooltipTouchEnd(event: TouchEvent): void {
        clearTimeout(this.longPressTimeoutID);

        if (!this.isLongPress) return;

        event.preventDefault();
        event.stopPropagation();
        this.isLongPress = false;
    }

    protected onTooltipTouchCancel(event: TouchEvent): void {
        const killTooltip = (): void => {
            clearTimeout(this.longPressTimeoutID);
            this.service.destroyTooltip();
        };

        if (event.type === 'touchmove') {
            const touch: Touch = event.touches[0];
            const startEl: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);
            if (startEl !== this.hostElement.nativeElement) killTooltip();
        } else {
            killTooltip();
        }
    }
}
