import {
    PLATFORM_ID,
    Injectable,
    inject,
    ComponentRef,
    ApplicationRef,
    EmbeddedViewRef,
    createComponent,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { MenuService } from './menu.service';
import { MobileService } from './mobile/mobile.service';

import { MenuContainerComponent } from './menu.container.component';
import { MenuComponent } from './components/menu.component';

import type { MenuAnimateType, MenuCreateConfig } from './menu.type.private';

@Injectable({ providedIn: 'root' })
export class MenuFactoryService {
    private containerRef: ComponentRef<MenuContainerComponent> | null = null;
    private destroyContainerTimeout!: ReturnType<typeof setTimeout>;
    private destroyMs: number = 0;

    private readonly appRef: ApplicationRef = inject(ApplicationRef);
    private readonly service: MenuService = inject(MenuService);
    private readonly mobileService: MobileService = inject(MobileService);

    private readonly document: Document = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);

    /**
     * @description
     * Creates the container for menus and attaches it to the body.
     */
    createContainer(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        clearTimeout(this.destroyContainerTimeout);

        const { animateMs } = this.service.config;
        this.destroyMs = Math.max(animateMs, 0);

        if (!this.containerRef) {
            // Creates the Container component reference
            this.containerRef = createComponent(MenuContainerComponent, { environmentInjector: this.appRef.injector });

            // Attaches the view to the app.
            this.appRef.attachView(this.containerRef.hostView);

            // Returns the Host View as an HTML Element
            const containerElement: HTMLElement = (this.containerRef.hostView as EmbeddedViewRef<unknown>)
                .rootNodes[0] as HTMLElement;

            // Attaches the Container HTML Element to the body
            this.document.body.appendChild(containerElement);
        }

        // Initializes the KeyNav data
        this.containerRef.instance.initKeyNavData();
    }

    /**
     * @description
     * Destroys the container component after any animation timeout.
     */
    destroyContainer(): void {
        this.destroyContainerTimeout = setTimeout(() => {
            if (!this.containerRef) return;

            this.containerRef.destroy();
            this.containerRef = null;
            this.destroyMs = 0;
        }, this.destroyMs);
    }

    /**
     * @description
     * Creates the Menu component, assigns the data and inserts it within the container.
     */
    createMenu(
        trigger: HTMLElement | DOMRect,
        content: MenuCreateConfig,
        isRoot: boolean = false
    ): ComponentRef<MenuComponent> {
        // Creates the Menu component reference
        const menuRef: ComponentRef<MenuComponent> = (
            this.containerRef as ComponentRef<MenuContainerComponent>
        ).instance.container.createComponent(MenuComponent);

        // Assigns the data to the Menu component instance
        const { items, path, label, config: customConfig = {} } = content;
        menuRef.instance.menuItems = items;
        menuRef.instance.menuPath = path ?? [];
        menuRef.instance.menuLabel = label || null;

        const animateIn: MenuAnimateType = this.service.animateData.in;
        const { offsetMenu, offsetSubmenu, closeOnScrollOutside, ...mainConfig } = this.service.config;

        // Sets the initial scale factor if the animation is set to "scale"
        let initialScale: number = 1;
        if (animateIn === 'scale-up') initialScale = 0.9;
        else if (animateIn === 'scale-down') initialScale = 1.1;

        const offsetSize: number = isRoot ? offsetMenu : offsetSubmenu;
        const allowScrollListener: boolean = !closeOnScrollOutside;

        // Sets the Overlay Base config
        menuRef.instance.setBaseConfig({
            ...mainConfig,
            ...customConfig,
            trigger,
            offsetSize,
            initialScale,
            allowScrollListener,
        });

        // Pushes a new state into the window's history (mobile only)
        this.mobileService.pushMobileState();

        // Returns Menu component reference
        return menuRef;
    }
}
