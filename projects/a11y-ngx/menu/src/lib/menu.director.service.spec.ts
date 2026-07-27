import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { MenuDirectorService } from './menu.director.service';
import { MenuService } from './menu.service';

describe('MenuDirectorService', () => {
    let service: MenuDirectorService;
    let menuService: MenuService;

    let document: Document;
    let trigger: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MenuDirectorService);
        menuService = TestBed.inject(MenuService);

        document = TestBed.inject(DOCUMENT);
        trigger = document.createElement('button');
        document.body.appendChild(trigger);
    });

    afterEach(() => trigger.remove());

    it('should create the root menu with minimum params', () => {
        const menu = service.createRootMenu(trigger, [{ label: 'item1' }], 'some-selector').instance;

        expect(menu.menuItems).toEqual([{ label: 'item1' }]);
        expect(menuService.featureSelector).toEqual('some-selector');
    });

    it('should create the root menu with a DOMRect trigger', () => {
        const menu = service.createRootMenu(new DOMRect(100, 100), [{ label: 'item1' }], 'some-selector', {
            className: 'domrect-class',
        }).instance;

        expect(menu.menuItems).toEqual([{ label: 'item1' }]);
        expect(document.querySelector('a11y-menu.domrect-class')).toBeTruthy();
    });

    it('should remove the previous menu before create the new one', fakeAsync(() => {
        service.createRootMenu(trigger, [{ label: 'item1' }], 'some-selector-a', { className: 'menu-a' }).instance;

        let menuElA = document.querySelector('a11y-menu.menu-a');
        expect(menuElA).toBeTruthy();

        service.createRootMenu(trigger, [{ label: 'item1' }], 'some-selector-b', { className: 'menu-b' }).instance;
        flush();

        menuElA = document.querySelector('a11y-menu.menu-a');
        expect(menuElA).toBeFalsy();

        const menuElB = document.querySelector('a11y-menu.menu-b');
        expect(menuElB).toBeTruthy();
    }));

    it('should remove the menu', fakeAsync(() => {
        spyOn(menuService, 'destroyMenu').and.callThrough();

        service.createRootMenu(trigger, [{ label: 'item1' }], 'some-selector-c', { className: 'menu-c' }).instance;
        service.destroyRootMenu();
        flush();

        const menuEl = document.querySelector('a11y-menu.menu-c');
        expect(menuEl).toBeFalsy();
        expect(menuService.destroyMenu).toHaveBeenCalledWith({ closeReason: 'internal' });
    }));
});
