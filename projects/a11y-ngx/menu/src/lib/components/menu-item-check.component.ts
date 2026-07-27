import { Component, Input } from '@angular/core';

import type { MenuGroupTypeSelectable } from '../menu.type.private';

@Component({
    selector: 'a11y-menu-item-check',
    template: '',
    styleUrls: ['./menu-item-check.component.scss'],
    host: {
        '[attr.item-check]': 'type',
    },
})
export class MenuItemCheckComponent {
    @Input() type!: MenuGroupTypeSelectable;
}
