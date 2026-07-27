import { Injectable, ComponentRef } from '@angular/core';

import type { KeyboardNavigationKey } from '@a11y-ngx/keyboard-navigation';

import { MenuFactoryService } from './menu.factory.service';
import { MenuService } from './menu.service';

import type { MenuComponent } from './components/menu.component';

import { ERROR_USE_SELECTOR_NOT_DEFINED } from './menu.errors';

import { MENU_SUBMENU_CONFIG, MenuCreateConfig } from './menu.type.private';
import type { MenuPosition } from './menu.type';

@Injectable({ providedIn: 'root' })
export class MenuDirectorPrivateService {
    constructor(private factory: MenuFactoryService, private service: MenuService) {}

    /**
     * @description
     * Creates a new menu.
     *
     * @param trigger - The trigger that opened the menu.
     * @param content - The main data to instantiate and config the menu.
     * @param isRoot - Whether the menu is the _root_ instance or not (aka submenu).
     * @returns A `MenuComponent` component reference.
     */
    createMenu(
        trigger: HTMLElement | DOMRect,
        content: MenuCreateConfig,
        isRoot: boolean = false
    ): ComponentRef<MenuComponent> {
        const { position: rootMenuPosition, focusItemWhenOpen } = this.service.config;

        if (isRoot) {
            if (!this.service.featureSelector) throw new Error(ERROR_USE_SELECTOR_NOT_DEFINED());

            // Creates the container
            this.factory.createContainer();

            // Sets the label for the menu instance, if any
            const label: string | null = this.service.instanceConfig.menuLabel || null;
            if (!content.label && label) content.label = label;

            // If no alignment was set in the position when user overrides the default ...
            if (rootMenuPosition.indexOf('-') === -1)
                // ... force it to "start"
                content.config = { position: `${rootMenuPosition}-start` as MenuPosition };
        } else {
            // Sets the config for submenus
            content.config = { ...MENU_SUBMENU_CONFIG };

            // Gets the position from the last open menu
            const { getCurrentPosition: lastMenuPosition, isRootMenu: lastMenuIsRoot } = this.service
                .lastMenu as MenuComponent;
            let forcePosition: boolean = false;

            // If last menu was "root instance" ...
            if (lastMenuIsRoot) {
                // ... and user chose "left" ...
                if (rootMenuPosition.startsWith('left')) forcePosition = true;
            }
            // If last menu was a submenu and last position was "left" ...
            else if (lastMenuPosition === 'left') forcePosition = true;

            // ... keep opening in that direction
            if (forcePosition) content.config.position = 'left-start';
        }

        const { menuList, menuListIDs, navFromKeyboard, executeKeyNavNavigation$ } = this.service;

        // Creates the menu
        const menuRef: ComponentRef<MenuComponent> = this.factory.createMenu(trigger, content, isRoot);

        // Saves the component reference and ID
        menuList.push(menuRef);
        menuListIDs.push(menuRef.instance.menuPath.join('-'));

        // If navigating from keyboard
        if (navFromKeyboard) {
            // If NOT root menu (aka submenu)
            if (!isRoot) {
                // Set focus on first item (usually 'Enter' or 'ArrowRight' keys)
                setTimeout(() => this.service.focusItem(), 5);
            }
            // If config was established to focus 'first' or 'last' item after opening
            else if (focusItemWhenOpen) {
                // Sends the corresponding key to the KeyNav Service proxy
                const key: KeyboardNavigationKey = focusItemWhenOpen === 'first' ? 'ArrowDown' : 'ArrowUp';
                setTimeout(() => executeKeyNavNavigation$.next(key), 5);
            }
        }

        // Fire change detection
        menuRef.changeDetectorRef.detectChanges();

        // Returns Menu component reference
        return menuRef;
    }

    /**
     * @description
     * Destroys the container for the menus.
     */
    destroyContainer(): void {
        this.factory.destroyContainer();
    }
}
