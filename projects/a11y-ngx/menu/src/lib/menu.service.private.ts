import {
    Injectable,
    Injector,
    Inject,
    ComponentFactoryResolver,
    ComponentRef,
    ApplicationRef,
    EmbeddedViewRef,
} from '@angular/core';

import { MobileService } from './mobile/mobile.service';
import { WINDOW } from './menu.module.providers.private';

import { MenuTooltipComponent } from './components/menu-tooltip.component';

import type { MenuAnimateType, MenuComputedStyles, MenuItemShortcutConfig } from './menu.type.private';
import type { MenuItemShortcut, MenuPosition } from './menu.type';

@Injectable({ providedIn: 'root' })
export class MenuPrivateService {
    lastMenuOpenTimeout!: ReturnType<typeof setTimeout>;
    lastMouseEnterTimeout!: ReturnType<typeof setTimeout>;
    lastMouseLeaveTimeout!: ReturnType<typeof setTimeout>;

    private menuStyles: MenuComputedStyles | undefined = undefined;

    private readonly isMac: boolean;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private mobileService: MobileService,
        @Inject(WINDOW) private window: Window | null
    ) {
        if (this.window) {
            const userAgent: string = this.window.navigator?.userAgent ?? '';
            this.isMac = /(macintosh|iphone|ipad|ipod)/i.test(userAgent);
        } else this.isMac = false;
    }

    /**
     * @description
     * Parses the given shortcut object into an "aria" and "visual" parts to be used on each item.
     */
    processShortcut(shortcut: MenuItemShortcut | undefined): MenuItemShortcutConfig | undefined {
        if (this.mobileService.isMobile || !shortcut || !shortcut.key.trim().length) return;

        const ariaParts: string[] = [];
        const visualParts: string[] = [];

        const isMac: boolean = this.isMac;
        const { key, keyLabel, ctrlCmd, alt, shift } = shortcut;

        if (ctrlCmd) {
            ariaParts.push(isMac ? 'Meta' : 'Ctrl');
            visualParts.push(isMac ? '⌘' : 'Ctrl');
        }
        if (alt) {
            ariaParts.push('Alt');
            visualParts.push(isMac ? '⌥' : 'Alt');
        }
        if (shift) {
            ariaParts.push('Shift');
            visualParts.push(isMac ? '⇧' : 'Shift');
        }

        let keyPart: string;
        if (key.trim().toLowerCase() === 'enter') keyPart = 'Enter';
        else if (key.trim().toLowerCase() === 'space') keyPart = 'Space';
        else {
            keyPart = key.trim();
            if (keyPart.length === 1) keyPart = keyPart.toUpperCase();
        }

        ariaParts.push(keyLabel || keyPart);
        visualParts.push(keyPart);

        const aria: string = ariaParts.join('+');
        const visual: string = visualParts.join(isMac ? '' : '+');

        return { aria, visual };
    }

    /**
     * @description
     * Returns the opposite of the animation provided.
     */
    oppositeAnimation(animateType: MenuAnimateType): MenuAnimateType {
        const opposites: Record<MenuAnimateType, MenuAnimateType> = {
            'top-bottom': 'bottom-top',
            'bottom-top': 'top-bottom',
            'left-right': 'right-left',
            'right-left': 'left-right',
            'scale-up': 'scale-down',
            'scale-down': 'scale-up',
            none: 'none',
        };

        return opposites[animateType];
    }

    /**
     * @description
     * Returns the computed styles from the given menu element.
     */
    getMenuComputedStyles(menuElement: HTMLElement): MenuComputedStyles {
        if (!this.menuStyles) {
            const { borderWidth, paddingTop, paddingBottom, paddingLeft, paddingRight } = getComputedStyle(menuElement);
            this.menuStyles = { borderWidth, paddingTop, paddingBottom, paddingLeft, paddingRight };
        }

        return this.menuStyles;
    }

    /**
     * @description
     * Resets the computed styles.
     */
    resetMenuComputedStyles(): void {
        this.menuStyles = undefined;
    }

    /**
     * @description
     * Creates the tooltip and attaches after the trigger.
     */
    createTooltip(
        trigger: HTMLElement,
        tooltip: string,
        position: MenuPosition,
        shortcut?: MenuItemShortcutConfig
    ): ComponentRef<MenuTooltipComponent> {
        // Creates the Tooltip component reference
        const tooltipRef: ComponentRef<MenuTooltipComponent> = this.componentFactoryResolver
            .resolveComponentFactory(MenuTooltipComponent)
            .create(this.injector);

        // Config the Tooltip instance
        tooltipRef.instance.trigger = trigger;
        tooltipRef.instance.tooltip = tooltip;
        tooltipRef.instance.position = position;
        tooltipRef.instance.shortcut = shortcut;

        // Attaches the view to the app.
        this.appRef.attachView(tooltipRef.hostView);

        // Gets the Host View as an HTML Element
        const tooltipElement: HTMLElement = (tooltipRef.hostView as EmbeddedViewRef<unknown>)
            .rootNodes[0] as HTMLElement;

        // Attaches the Tooltip HTML Element after the trigger
        trigger.after(tooltipElement);

        return tooltipRef;
    }
}
