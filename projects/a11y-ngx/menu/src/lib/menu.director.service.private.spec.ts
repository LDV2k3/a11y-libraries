import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Component, ComponentRef, ElementRef, ViewChild } from '@angular/core';

import { forceElementsCleanup } from '../test';

import { MenuDirectorPrivateService } from './menu.director.service.private';
import { MenuService } from './menu.service';

import { A11yMenuModule } from './menu.module';
import type { MenuComponent } from './components/menu.component';

import { ERROR_USE_SELECTOR_NOT_DEFINED } from './menu.errors';
import type { MenuCreateConfig } from './menu.type.private';

@Component({
    selector: 'a11y-test-menu-create',
    template: '<button type="button" #trigger>trigger</button>',
    styles: ['button { position: fixed; inset: 50% auto auto 50%; }'],
})
class TestMenuCreateComponent {
    @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>;
}

describe('MenuDirectorPrivateService', () => {
    let fixture: ComponentFixture<TestMenuCreateComponent>;
    let component: TestMenuCreateComponent;

    let service: MenuDirectorPrivateService;
    let menuService: MenuService;

    let document: Document;
    let trigger: HTMLElement;

    beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ declarations: [TestMenuCreateComponent], imports: [A11yMenuModule] });

        fixture = TestBed.createComponent(TestMenuCreateComponent);
        component = fixture.componentInstance;

        service = TestBed.inject(MenuDirectorPrivateService);
        menuService = TestBed.inject(MenuService);
        menuService['useSelector']('some-selector');

        document = TestBed.inject(DOCUMENT);
        trigger = component.trigger.nativeElement;
    });

    afterEach(() => {
        menuService['menuInstanceConfig'] = {};
        menuService['menuFeatureConfig'] = {};

        if (!forceElementsCleanup) return;

        trigger.remove();
    });

    it('should throw error when there is an empty selector', () => {
        menuService['useSelector'](undefined);

        expect(() => service.createMenu(trigger, { items: [] }, true)).toThrowError(ERROR_USE_SELECTOR_NOT_DEFINED());
    });

    describe('"createMenu()" method', () => {
        describe('The Root Menu', () => {
            it('should be created as root', () => {
                const menu = service.createMenu(trigger, { items: [] }, true).instance;
                expect(menu.isRootMenu).toBeTrue();
            });

            describe('The Label', () => {
                it('should have the label from the instance config', () => {
                    menuService['menuInstanceConfig'] = { menuLabel: 'menu-label' };
                    const menu = service.createMenu(trigger, { items: [] }, true).instance;
                    expect(menu.menuLabel).toEqual('menu-label');
                });

                it('should have the label from the content config', () => {
                    const menu = service.createMenu(trigger, { items: [], label: 'menu-label' }, true).instance;
                    expect(menu.menuLabel).toEqual('menu-label');
                });
            });

            describe('The Position', () => {
                it('should set "start" as the default alignment if no defined in the config', () => {
                    menuService['menuFeatureConfig'] = { position: 'bottom' };
                    const menu = service.createMenu(trigger, { items: [] }, true).instance;
                    expect(menu['desiredPosition']).toEqual('bottom');
                    expect(menu['desiredAlignment']).toEqual('start');
                });
            });

            describe('Focus item when open (keyboard nav only)', () => {
                const content: MenuCreateConfig = { items: [{ label: 'item1' }, { label: 'item2' }] };

                const createMenuForFirstFocusOn = (focusItemWhenOpen?: 'first' | 'last'): void => {
                    menuService['menuFeatureConfig'] = { focusItemWhenOpen };
                    spyOn(menuService.executeKeyNavNavigation$, 'next').and.callThrough();
                    service.createMenu(trigger, content, true);
                    tick(16);
                };

                beforeEach(() => menuService.navigateFrom('kb'));

                it('should NOT send any signal to NOT set focus on any item', fakeAsync(() => {
                    createMenuForFirstFocusOn();
                    expect(menuService.executeKeyNavNavigation$.next).not.toHaveBeenCalled();
                }));

                it('should send the "ArrowDown" key signal to focus on first item', fakeAsync(() => {
                    createMenuForFirstFocusOn('first');
                    expect(menuService.executeKeyNavNavigation$.next).toHaveBeenCalledWith('ArrowDown');
                }));

                it('should send the "ArrowUp" key signal to focus on last item', fakeAsync(() => {
                    createMenuForFirstFocusOn('last');
                    expect(menuService.executeKeyNavNavigation$.next).toHaveBeenCalledWith('ArrowUp');
                }));
            });
        });

        describe('The SubMenu', () => {
            const createMenu = (isRoot: boolean, trigger: HTMLElement, path: number[]): ComponentRef<MenuComponent> => {
                const rootMenu = service.createMenu(
                    trigger,
                    { items: [{ label: 'itm1' }, { label: 'itm2' }], path },
                    isRoot || undefined // to cover coverage
                );
                tick(16);
                rootMenu.changeDetectorRef.detectChanges();
                flush();
                return rootMenu;
            };

            const getItem = (from: HTMLElement): HTMLElement => {
                return from.querySelectorAll('[menu-item]')?.item(0) as HTMLElement;
            };

            describe('The Position', () => {
                it('should set "left" as the default position when previous submenu was also at left', fakeAsync(() => {
                    trigger.style.left = '90%';
                    fixture.detectChanges();

                    menuService['menuFeatureConfig'] = { position: 'left-start', maxWidth: '150px' };

                    const rootMenu = createMenu(true, trigger, []).instance;
                    const rootTrigger = getItem(rootMenu.nativeElement);

                    const submenu1 = createMenu(false, rootTrigger, [0]).instance;
                    const submenu1Trigger = getItem(submenu1.nativeElement);

                    const submenu2 = createMenu(false, submenu1Trigger, [0, 0]);
                    expect(submenu2.instance.getCurrentPosition).toEqual('left');
                    tick(16);
                }));

                it('should open at right then set subsequent submenus at "left" because of lack of space', fakeAsync(() => {
                    trigger.style.left = 'auto';
                    trigger.style.right = 'calc(60px + 150px)'; // 60 = trigger + 150 = menu
                    fixture.detectChanges();

                    menuService['menuFeatureConfig'] = { position: 'right', maxWidth: '150px' };

                    const rootMenu = createMenu(true, trigger, []).instance;
                    const rootTrigger = getItem(rootMenu.nativeElement);
                    expect(rootMenu.getCurrentPosition).toEqual('right');

                    const submenu1 = createMenu(false, rootTrigger, [0]).instance;
                    const submenu1Trigger = getItem(submenu1.nativeElement);
                    expect(submenu1.getCurrentPosition).toEqual('left');

                    const submenu2 = createMenu(false, submenu1Trigger, [0, 0]);
                    expect(submenu2.instance.getCurrentPosition).toEqual('left');
                    tick(16);
                }));

                it('should open all at right', fakeAsync(() => {
                    trigger.style.left = '5%';
                    fixture.detectChanges();

                    menuService['menuFeatureConfig'] = { position: 'right', maxWidth: '150px' };

                    const rootMenu = createMenu(true, trigger, []).instance;
                    const rootTrigger = getItem(rootMenu.nativeElement);
                    expect(rootMenu.getCurrentPosition).toEqual('right');

                    const submenu1 = createMenu(false, rootTrigger, [0]).instance;
                    const submenu1Trigger = getItem(submenu1.nativeElement);
                    expect(submenu1.getCurrentPosition).toEqual('right');

                    const submenu2 = createMenu(false, submenu1Trigger, [0, 0]);
                    expect(submenu2.instance.getCurrentPosition).toEqual('right');
                    tick(16);
                }));
            });
        });
    });

    describe('"destroyContainer()" method', () => {
        it('should destroy the container', fakeAsync(() => {
            service.createMenu(trigger, { items: [] }, true);
            service.destroyContainer();
            flush();
            expect(document.querySelector('a11y-menu-container')).toBeNull();
        }));
    });
});
