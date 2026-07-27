import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { OverlayBase } from '@a11y-ngx/overlay-base';

import type { MenuItemShortcutConfig } from '../menu.type.private';
import type { MenuPosition } from '../menu.type';

@Component({
    selector: 'a11y-menu-tooltip',
    template: `
        <span menu-tooltip>{{ tooltip }}</span>
        <div menu-item-shortcut *ngIf="shortcutVisual" [innerHTML]="shortcutVisual"></div>
    `,
    styleUrls: ['./menu-tooltip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'a11y-menu-tooltip',
        'aria-hidden': 'true',
        '[style]': 'tooltipStyles',
        '[attr.show]': `attrShow ? '' : null`,
        '[attr.fade]': `attrFade ? '' : null`,
    },
})
export class MenuTooltipComponent extends OverlayBase implements OnInit, OnDestroy {
    @Input() tooltip!: string;
    @Input() trigger!: HTMLElement;
    @Input() position: MenuPosition = 'top';
    @Input() shortcut: MenuItemShortcutConfig | undefined = undefined;

    shortcutVisual: string | undefined = undefined;

    protected tooltipStyles: Partial<CSSStyleDeclaration> = {};

    protected attrShow: boolean = false;
    protected attrFade: boolean = false;

    constructor(private hostElement: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.attrShow = true;

        this.shortcutVisual = this.shortcut?.visual;

        this.setBaseConfig({ trigger: this.trigger, position: this.position });

        this.attachOverlay(this.hostElement.nativeElement)
            .pipe(takeUntil(this.isDetached$))
            .subscribe(({ render: { top, bottom, left, right } }) => {
                this.tooltipStyles = {
                    top: top !== null ? `${top}px` : undefined,
                    bottom: bottom !== null ? `${bottom}px` : undefined,
                    left: left !== null ? `${left}px` : undefined,
                    right: right !== null ? `${right}px` : undefined,
                };

                setTimeout(() => {
                    this.attrFade = true;
                    this.cdr.markForCheck();
                }, 5);
            });
    }

    ngOnDestroy(): void {
        this.detachOverlay();
    }
}
