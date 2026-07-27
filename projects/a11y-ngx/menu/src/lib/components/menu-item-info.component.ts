import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MenuService } from '../menu.service';

import type { MenuItemInfo } from '../menu.type';

@Component({
    selector: 'a11y-menu-item-info',
    template: `
        <a11y-icon menu-item-icon [icon]="item.icon"></a11y-icon>
        <span menu-item-label>{{ item.info }}</span>
    `,
    styleUrls: ['./menu-item.component.scss'],
    host: {
        role: 'none',
        'menu-item-info': '',
        '[class]': 'itemClassNames',
        // For CSS purposes, to hide the icon's placeholder on the inline layouts if it doesn't have an icon
        '[attr.has-icon]': `item.icon ? '' : null`,
    },
})
export class MenuItemInfoComponent implements OnInit, OnDestroy {
    /** @description The info item. */
    @Input() item!: MenuItemInfo;

    protected itemClassNames: string[] = [];

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(private menuService: MenuService, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const initClassNames = (): void => {
            this.itemClassNames = this.menuService.classNameToArray(this.item.className);
        };

        const { value: itemValue } = this.item;
        // If item has a "value" defined, listen for changes in the item
        if (itemValue)
            this.menuService.menuItemUpdated$
                .pipe(
                    takeUntil(this.destroy$),
                    filter(({ value, type }) => type === 'info' && value === itemValue)
                )
                .subscribe(({ data: updateData }) => {
                    const data: MenuItemInfo = updateData as MenuItemInfo;

                    Object.assign(this.item, data);

                    if (data.className) initClassNames();

                    this.cdr.markForCheck();
                });

        initClassNames();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
