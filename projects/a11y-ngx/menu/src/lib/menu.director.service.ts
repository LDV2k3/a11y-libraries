import { Injectable, ComponentRef, TemplateRef } from '@angular/core';

import { MenuDirectorPrivateService } from './menu.director.service.private';
import { MenuService } from './menu.service';

import type { MenuComponent } from './components/menu.component';

import type { MenuMainConfig } from './menu.type.private';
import type { Menu } from './menu.type';

@Injectable({ providedIn: 'root' })
export class MenuDirectorService {
    constructor(private service: MenuService, private directorPrivate: MenuDirectorPrivateService) {}

    /**
     * @description
     * Creates the Root Menu.
     *
     * @param trigger - The trigger element.
     * @param items - The menu items.
     * @param selector - The unique selector.
     * @param instanceConfig - The instance configuration.
     * @param label - The menu label.
     * @param iconTemplate - The icon template.
     * @returns A `MenuComponent` component reference.
     */
    createRootMenu(
        trigger: HTMLElement | DOMRect,
        items: Menu,
        selector: string,
        instanceConfig: Partial<MenuMainConfig> = {},
        label?: string | null,
        iconTemplate?: TemplateRef<unknown>
    ): ComponentRef<MenuComponent> {
        // If a menu already exists, destroy it
        if (this.service.featureSelector) this.destroyRootMenu();

        this.service.initRootMenuData(trigger, items, selector, instanceConfig, iconTemplate);

        return this.directorPrivate.createMenu(trigger, { items, label }, true);
    }

    /**
     * @description
     * Destroys the entire menu.
     */
    destroyRootMenu(): void {
        this.service.destroyMenu({ closeReason: 'internal' });
    }
}
