import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { POSITION } from '@a11y-ngx/overlay-base';

import { OverlayDirective } from './overlay.directive';

import { OverlayPosition } from './overlay.type';

@Component({
    selector: 'a11y-overlay-arrow',
    template: '',
    styleUrls: ['./overlay-arrow.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style]': 'attrStyle',
        '[style.--arrow-scale]': 'scaleFactor',
        '[attr.top]': 'isTop',
        '[attr.bottom]': 'isBottom',
        '[attr.left]': 'isLeft',
        '[attr.right]': 'isRight',
        '[attr.start]': 'isStart',
        '[attr.center]': 'isCenter',
        '[attr.end]': 'isEnd',
    },
})
export class OverlayArrowComponent implements OnInit, OnDestroy {
    protected get scaleFactor(): number | null {
        return this.hostDirective.borderSize === 1 ? 2.5 : null;
    }

    protected get isTop(): string | null {
        return this.hostDirective.isTop ? '' : null;
    }

    protected get isBottom(): string | null {
        return this.hostDirective.isBottom ? '' : null;
    }

    protected get isLeft(): string | null {
        return this.hostDirective.isLeft ? '' : null;
    }

    protected get isRight(): string | null {
        return this.hostDirective.isRight ? '' : null;
    }

    protected get isStart(): string | null {
        return !this.hostDirective.overlayOutside && this.hostDirective.isStart ? '' : null;
    }

    protected get isCenter(): string | null {
        return !this.hostDirective.overlayOutside && this.hostDirective.isCenter ? '' : null;
    }

    protected get isEnd(): string | null {
        return !this.hostDirective.overlayOutside && this.hostDirective.isEnd ? '' : null;
    }

    protected attrStyle!: CSSStyleDeclaration;

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(private hostDirective: OverlayDirective, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.hostDirective.overlayUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.setArrowPosition());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * @description
     * For the Arrow Service to assign.
     */
    destroyArrow = (): void => {
        return;
    };

    /**
     * @description
     * Updates the Arrow position whenever the overlay updates its position.
     */
    private setArrowPosition(): void {
        const overlayFinalRect: DOMRect = this.hostDirective.overlayElement.getBoundingClientRect();
        const isTopBottom: boolean = this.hostDirective.isTopBottom;
        const triggerRect: DOMRect = this.hostDirective.triggerRect;

        const triggerSize: number = isTopBottom ? triggerRect.width : triggerRect.height;
        const overlaySize: number = isTopBottom ? overlayFinalRect.width : overlayFinalRect.height;
        const overlayBiggerThanTrigger: boolean = overlaySize > triggerSize;
        let styleSize: number;
        let stylePosition: number;

        if (this.hostDirective.fluidAlignment && overlayBiggerThanTrigger) {
            const distanceA: number = isTopBottom
                ? this.hostDirective.triggerBoundaryDistance(POSITION.LEFT)
                : this.hostDirective.triggerBoundaryDistance(POSITION.TOP);
            const distanceB: number = isTopBottom
                ? this.hostDirective.triggerBoundaryDistance(POSITION.RIGHT)
                : this.hostDirective.triggerBoundaryDistance(POSITION.BOTTOM);
            const arrowSize: number = (this.hostDirective.arrowSize + this.hostDirective.borderSize) * 2 + 5;
            const arrowAreaSize: number = triggerSize + (distanceA >= 0 ? distanceB : distanceA);
            const triggerPosition: number = isTopBottom ? triggerRect.left : triggerRect.top;
            const overlayPosition: number = isTopBottom ? overlayFinalRect.left : overlayFinalRect.top;
            const arrowPosition: number = triggerPosition - overlayPosition;
            styleSize = Math.max(Math.min(arrowAreaSize, triggerSize, overlaySize), arrowSize);
            stylePosition =
                distanceB < 0 ? Math.min(overlaySize - arrowSize, arrowPosition) : Math.max(0, arrowPosition);
        } else {
            const arrowAreaSize: number = overlayBiggerThanTrigger ? triggerSize : overlaySize;
            styleSize = arrowAreaSize;

            if (this.hostDirective.isStart) {
                stylePosition = 0;
            } else if (this.hostDirective.isEnd) {
                stylePosition = overlaySize - arrowAreaSize;
            } else {
                stylePosition = (overlaySize - arrowAreaSize) / 2;
            }
        }

        const overlayOutside: OverlayPosition | undefined = this.hostDirective.overlayOutside;

        const top: string | null = !isTopBottom && overlayOutside ? `${stylePosition}px` : null;
        const left: string | null = isTopBottom && overlayOutside ? `${stylePosition}px` : null;
        const width: string | null = isTopBottom ? `${styleSize}px` : null;
        const height: string | null = !isTopBottom ? `${styleSize}px` : null;

        this.attrStyle = { top, left, width, height } as CSSStyleDeclaration;
        this.cdr.markForCheck();
    }
}
