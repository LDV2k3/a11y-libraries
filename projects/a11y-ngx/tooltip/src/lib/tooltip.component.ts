import { Component, ChangeDetectionStrategy } from '@angular/core';

import { OverlayBaseComponent } from '@a11y-ngx/overlay';

import { TOOLTIP_SELECTOR } from './tooltip.type.private';

@Component({
    selector: TOOLTIP_SELECTOR,
    template: `
        <div overlay-wrapper>
            <div overlay-content [class.tooltip-inner]="useBootstrapStyles" [innerHTML]="customContent"></div>
        </div>
    `,
    styleUrls: ['./tooltip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'tooltip',
        '[attr.aria-hidden]': 'true',
        '[attr.id]': 'tooltipId',
        '[attr.top]': 'attrPositionTop',
        '[attr.bottom]': 'attrPositionBottom',
        '[attr.left]': 'attrPositionLeft',
        '[attr.right]': 'attrPositionRight',
        '[attr.animate]': 'attrAnimate',
        '[attr.use-bs]': 'useBootstrapStyles ? "" : null',
        '[class.tooltip]': 'useBootstrapStyles',
    },
})
export class TooltipComponent extends OverlayBaseComponent {
    protected get attrPositionTop(): string | null {
        return this.attrAnimate && this.isTop ? '' : null;
    }
    protected get attrPositionBottom(): string | null {
        return this.attrAnimate && this.isBottom ? '' : null;
    }
    protected get attrPositionLeft(): string | null {
        return this.attrAnimate && this.isLeft ? '' : null;
    }
    protected get attrPositionRight(): string | null {
        return this.attrAnimate && this.isRight ? '' : null;
    }

    attrAnimate: boolean | null = null;

    tooltipId!: string;

    /**
     * For the Tooltip Service to assign.
     */
    destroyTooltip = (): void => {
        return;
    };
}
