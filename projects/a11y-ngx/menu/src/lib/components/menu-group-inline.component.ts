import { Component, Input, ViewChild, OnInit, ElementRef } from '@angular/core';

import { MenuService } from '../menu.service';

import { MENU_CONFIG_DEFAULTS as DEFAULTS } from '../menu.type.private';
import type {
    MenuInlineLabelType,
    MenuGridLabelType,
    MenuGroupJustifyItems,
    MenuGroupItemsLayout,
    MenuGroupLayout,
    MenuGroupBase,
} from '../menu.type.private';
import type {
    MenuGroupActionGrid,
    MenuGroupActionInline,
    MenuGroupSelectableGrid,
    MenuGroupSelectableInline,
} from '../menu.type';

@Component({
    selector: 'a11y-menu-group-inline',
    template: `
        <a11y-icon menu-item-icon [icon]="group.icon"></a11y-icon>
        <span *ngIf="showGroupName && group.label" menu-group-label aria-hidden="true">{{ group.label }}</span>
        <ng-container *ngIf="showAboveBelowPanelLabel; then aboveBelowTemplate; else groupItemsTemplate"></ng-container>

        <ng-template #aboveBelowTemplate>
            <span menu-group-wrapper>
                <ng-container *ngTemplateOutlet="groupItemsTemplate"></ng-container>
                <div menu-group-panel-label aria-hidden="true">
                    <span [innerHTML]="itemPanelText ?? '&nbsp;'"></span>
                    <span *ngIf="itemPanelShortcut" menu-item-shortcut [innerHTML]="itemPanelShortcut"></span>
                </div>
            </span>
        </ng-template>

        <ng-template #groupItemsTemplate>
            <span
                #groupItems
                menu-group-items
                role="none"
                [attr.justify]="groupItemsJustify"
                [attr.has-icons]="groupHasIcons ? '' : null"
                [attr.has-icons-only]="groupHasIcons && groupHasIconsOnly ? '' : null"
                [style]="groupItemsGridStyles">
                <ng-content></ng-content>
            </span>
        </ng-template>
    `,
    styleUrls: ['./menu-group-inline.component.scss'],
    host: {
        role: 'group',
        'menu-group': 'inline',
        '[class]': 'groupClassNames',
        '[attr.aria-label]': 'group.label || null',
        '[attr.layout]': 'groupLayout',
        '[attr.item-labels]': 'itemsLabelPosition',
        '[attr.label-no-wrap]': `itemsLabelNoWrap ? '' : null`,
        '[attr.items-busy]': `groupIsBusy ? '' : null`,
        '[attr.items-only]': `!group.icon && !group.label ? '' : null`,
        '[attr.has-columns]': `groupColumns ? '' : null`,
        '[style.--cols]': 'groupColumns || null',
    },
})
export class MenuGroupInlineComponent implements OnInit {
    @Input() group!: MenuGroupSelectableInline | MenuGroupActionInline | MenuGroupSelectableGrid | MenuGroupActionGrid;

    @ViewChild('groupItems') readonly groupItems!: ElementRef<HTMLSpanElement>;

    /** @description Whether it should show the label panel or not. */
    showAboveBelowPanelLabel!: boolean;
    /** @description Whether the label is a floating panel (tooltip) or not. */
    labelFloating!: boolean;
    /** @description Whether the label is a static panel or not. */
    labelPanel!: boolean;

    /** @description The items layout. */
    groupItemLayout!: MenuGroupItemsLayout;
    /** @description The items justify. */
    groupItemsJustify: MenuGroupJustifyItems | null = null;
    /** @description Whether it should show or hide the label above the items (when group "stack" layout). */
    showGroupName: boolean = DEFAULTS.groupShowLabel;

    /**
     * @description
     * The group layout.
     *
     * - 'stack'
     * ```
     *   [ label ]
     *   [ item1 ] [ item2 ]
     * ```
     *
     * - 'inline' / 'grid'
     * ```
     *   [ icon ] [ label ] [[ item1 ] [ item2 ]]
     * ```
     */
    groupLayout!: MenuGroupLayout;
    groupHasIcons!: boolean;
    groupHasIconsOnly!: boolean;
    groupIsBusy: boolean = false;
    protected groupColumns: number = 0;

    /** @description The label's position. */
    itemsLabelPosition!: MenuInlineLabelType | MenuGridLabelType;
    /** @description Whether the label is normal (within the item) or not (tooltip / panel). */
    itemsLabelNormal!: boolean;
    /** @description Whether the label's text will wrap or not. */
    itemsLabelNoWrap!: boolean;

    /** @description The panel's text. */
    itemPanelText: string | undefined = undefined;
    /** @description The panel's shortcut. */
    itemPanelShortcut: string | undefined = undefined;

    /** @description The group class names. */
    protected groupClassNames: string[] = [];
    readonly groupItemsGridStyles: Partial<CSSStyleDeclaration> = {};

    constructor(private menuService: MenuService) {}

    ngOnInit(): void {
        const {
            layout = DEFAULTS.groupLayout,
            itemsLabelPosition = DEFAULTS.groupItemsLabelPosition,
            itemsLabelWrap = DEFAULTS.groupItemsLabelWrap,
            itemsLayout,
            className,
        } = this.group;

        this.groupItemLayout = itemsLayout;

        this.groupLayout = layout;
        this.itemsLabelPosition = itemsLabelPosition;
        this.itemsLabelNoWrap = !itemsLabelWrap;
        this.itemsLabelNormal = ['below', 'start', 'end'].includes(itemsLabelPosition);

        this.labelPanel = this.itemsLabelPosition.startsWith('panel');
        this.labelFloating = this.itemsLabelPosition.startsWith('floating');
        this.showAboveBelowPanelLabel = !this.labelFloating && this.labelPanel;

        this.groupHasIconsOnly = !this.itemsLabelNormal;

        this.groupClassNames = this.menuService.classNameToArray(className);

        this.groupHasIcons = this.group.items.some((item) => item.icon);

        // To establish the "show group name" for stack layouts
        if (layout === 'stack') {
            const { showLabel, label = '' } = this.group as MenuGroupBase;
            const { showGroupLabels } = this.menuService.config;
            this.showGroupName = (showLabel ?? showGroupLabels) && label.length > 0;
        }

        // Inline Item Layout
        if (this.group.itemsLayout === 'inline') {
            this.groupItemsJustify = this.group.itemsJustify ?? DEFAULTS.groupItemsJustify;
        }
        // Grid Item Layout
        else {
            const { columns = DEFAULTS.groupGridColumns, itemsFlow = DEFAULTS.groupItemsFlow, items } = this.group;

            // Set the lower value up to zero
            let groupColumns: number = Math.max(0, columns);

            // When a wrong value of columns was set (zero), redefine it with the default
            if (groupColumns === 0) groupColumns = DEFAULTS.groupGridColumns;

            this.groupColumns = groupColumns;

            if (itemsFlow === 'column') {
                this.groupItemsGridStyles.gridAutoFlow = 'column';
                this.groupItemsGridStyles.gridTemplateRows = `repeat(${Math.ceil(items.length / groupColumns)}, auto)`;
            }
        }
    }
}
