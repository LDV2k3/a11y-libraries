import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { MenuFactoryService } from './menu.factory.service';
import { MenuService } from './menu.service';

describe('MenuFactoryService', () => {
    let service: MenuFactoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MenuFactoryService);
    });

    describe('"createContainer()" method', () => {
        it('should abort when there is no document', () => {
            spyOn(window, 'clearTimeout');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (service as any).document = null;

            service.createContainer();
            expect(window.clearTimeout).not.toHaveBeenCalled();
        });

        it('should create the container and attach it to the body', () => {
            service.createContainer();

            const containerEl = document.body.querySelector('a11y-menu-container');
            expect(containerEl).toBeTruthy();
        });

        it('should NOT create the container if was already created', () => {
            spyOn(document.body, 'appendChild');

            service.createContainer();
            service.createContainer();
            expect(document.body.appendChild).toHaveBeenCalledTimes(1);
        });
    });

    describe('"destroyContainer()" method', () => {
        it('should abort when there is no container', fakeAsync(() => {
            expect(() => {
                service.destroyContainer();
                tick();
            }).not.toThrow();
        }));

        it('should destroy the container', fakeAsync(() => {
            service.createContainer();
            service.destroyContainer();
            flush();

            const containerEl = document.body.querySelector('a11y-menu-container');
            expect(containerEl).toBeFalsy();
        }));
    });

    describe('"createMenu()" method', () => {
        let menuService: MenuService;
        let trigger: HTMLElement;

        beforeEach(() => {
            menuService = TestBed.inject(MenuService);
            trigger = document.createElement('button');
            document.body.appendChild(trigger);
        });

        afterEach(() => trigger.remove());

        it('should create the menu instance with minimum params', () => {
            service.createContainer();

            const items = [{ label: 'item1' }];
            const menu = service.createMenu(trigger, { items }).instance;

            expect(menu.menuItems).toEqual(items);
            expect(menu.menuLabel).toBeNull();
            expect(menu.menuPath).toEqual([]);
        });

        it('should create the menu instance with all the params', () => {
            service.createContainer();

            const menu = service.createMenu(trigger, { items: [], path: [1], label: 'Menu Label' }, true).instance;

            expect(menu.menuLabel).toEqual('Menu Label');
            expect(menu.menuPath).toEqual([1]);
        });

        it('should create the menu instance with animation as "scale-up"', () => {
            menuService['menuInstanceConfig'] = { animate: 'scale-up' };
            menuService['initAnimateData']();
            service.createContainer();

            const menu = service.createMenu(trigger, { items: [] }).instance;

            expect(menu.scaleFactor).toEqual(0.9);
        });

        it('should create the menu instance with animation as "scale-down"', () => {
            menuService['menuInstanceConfig'] = { animate: 'scale-down' };
            menuService['initAnimateData']();
            service.createContainer();

            const menu = service.createMenu(trigger, { items: [] }).instance;

            expect(menu.scaleFactor).toEqual(1.1);
        });
    });
});
