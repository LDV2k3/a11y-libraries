import { Component, Input, OnInit } from '@angular/core';

import { MenuService } from '../menu.service';

import type { MenuGroupItemsLayout } from '../menu.type.private';
import type { MenuGroupActionStack, MenuGroupSelectableStack } from '../menu.type';

@Component({
    selector: 'a11y-menu-group',
    template: `
        <div *ngIf="showGroupName" menu-group-label aria-hidden="true">{{ group.label }}</div>
        <ng-content></ng-content>
    `,
    styleUrls: ['./menu-group-stack.component.scss'],
    host: {
        role: 'group',
        '[class]': 'groupClassNames',
        '[attr.menu-group]': `group.type ?? 'common'`,
        '[attr.aria-label]': 'group.label || null',
        '[attr.has-icons]': `groupHasIcons ? '' : null`,
    },
})
export class MenuGroupStackComponent implements OnInit {
    @Input() group!: MenuGroupSelectableStack | MenuGroupActionStack;

    /** @description The layout type for the group. */
    readonly groupItemLayout: MenuGroupItemsLayout = 'stack';
    /** @description Whether it should show or hide the label above the items. */
    showGroupName!: boolean;
    /** @description Whether the entire group is busy or not. */
    groupIsBusy: boolean = false;

    /** @description Whether any of the items within the group has icons or not. */
    protected groupHasIcons: boolean = false;
    /** @description The group class names. */
    protected groupClassNames: string[] = [];

    constructor(private menuService: MenuService) {}

    ngOnInit(): void {
        const { items, showLabel, label = '', className } = this.group;
        const { showGroupLabels } = this.menuService.config;

        this.groupClassNames = this.menuService.classNameToArray(className);

        this.groupHasIcons = items.some((item) => item.icon);
        this.showGroupName = (showLabel ?? showGroupLabels) && label.length > 0;
    }
}
