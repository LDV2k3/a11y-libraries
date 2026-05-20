import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgModule, Component, ViewChild } from '@angular/core';

import { A11yKeyboardNavigationModule } from './keyboard-navigation.module';
import { KeyboardNavigationDirective } from './keyboard-navigation.directive';

import { ERROR_ITEMS_NOT_PROVIDED, ERROR_KEYS_NOT_PROVIDED } from './keyboard-navigation.errors';

import { NAVIGATION_DEFAULT, NAVIGATION_STRATEGIES } from './keyboard-navigation.type.private';
import type {
    KeyboardNavigationConfig,
    KeyboardNavigationCurrent,
    KeyboardNavigationEvent,
    KeyboardNavigationStrategy,
    KeyboardNavigationAction,
    KeyboardNavigationKey,
    KeyboardNavigationType,
} from './keyboard-navigation.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_SIMPLE: any[] = ['a', 'b', 'c'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_NESTED: any[] = [
    { val: 'a', children: [{ val: 'a-0' }] },
    { val: 'b', children: [] },
    { val: 'c', children: [{ val: 'c-0' }, { val: 'c-1', children: [{ val: 'c-1-0' }] }] },
    { val: 'd' },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_DISABLED: any[] = [
    { val: 'a', children: [{ val: 'a-0', disabled: true }] },
    { val: 'b', children: [] },
    {
        val: 'c',
        children: [
            { val: 'c-0', disabled: true },
            { val: 'c-1', children: [{ val: 'c-1-0' }] },
        ],
    },
    { val: 'd', children: [[{ val: 'd-0' }, { val: 'd-1' }]] },
];

@Component({
    template: `
        <div
            [a11yKeyNav]="items"
            [a11yKeyNavConfig]="config"
            [a11yKeyNavCurrent]="current"
            [a11yKeyNavType]="type"
            #keyNav="a11yKeyNav"
            (navigate)="onNavigate($event)"
            tabindex="0"></div>
    `,
    styles: [
        `
            div {
                background-color: yellow;
                width: 100px;
                height: 100px;
            }
        `,
    ],
})
class KeyNavTestComponent {
    items: unknown[] = [];
    config: Partial<KeyboardNavigationConfig> = {};
    current: number | KeyboardNavigationCurrent | undefined = undefined;
    type: KeyboardNavigationType | undefined = undefined;

    @ViewChild(KeyboardNavigationDirective) keyNav!: KeyboardNavigationDirective;

    onNavigate(nav: KeyboardNavigationEvent): void {
        console.log(nav);
    }
}

@NgModule({
    declarations: [KeyNavTestComponent],
    imports: [A11yKeyboardNavigationModule],
})
class KeyNavTestModule {}

describe('Keyboard Navigation', () => {
    let component: KeyNavTestComponent;
    let fixture: ComponentFixture<KeyNavTestComponent>;
    let hostEl: HTMLDivElement;
    let spyOnNavigate: jasmine.Spy<(nav: KeyboardNavigationEvent) => void>;

    const setItems = (items: unknown[]): void => {
        component.items = items;
        fixture.detectChanges();
    };
    const setCurrent = (current: number | KeyboardNavigationCurrent): void => {
        component.current = current;
        fixture.detectChanges();
    };
    const setConfig = (config: Partial<KeyboardNavigationConfig>): void => {
        component.config = config;
        fixture.detectChanges();
    };
    const sendKey = (code: KeyboardNavigationKey, repeat: boolean = false): void => {
        hostEl.dispatchEvent(new KeyboardEvent('keydown', { code, repeat }));
    };
    const expectedNav = (
        key: KeyboardNavigationKey,
        action: KeyboardNavigationAction,
        itemFrom: unknown,
        itemTo: unknown,
        indexFrom: number,
        indexTo: number,
        pathFrom: number[],
        pathTo: number[]
    ): KeyboardNavigationEvent => ({ key, action, itemFrom, itemTo, indexFrom, indexTo, pathFrom, pathTo });
    const lastNav = (): KeyboardNavigationEvent => spyOnNavigate.calls.mostRecent().args[0];

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            declarations: [KeyNavTestComponent],
            imports: [KeyNavTestModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(KeyNavTestComponent);
        component = fixture.componentInstance;
        hostEl = fixture.debugElement.query(By.css('div')).nativeElement;
        spyOnNavigate = spyOn(component, 'onNavigate'); //.and.callThrough();
        hostEl.focus();
        fixture.detectChanges();
    });

    it('should not emit anything without any items established and should throw a console warn', () => {
        const spyOnConsoleWarn = spyOn(console, 'warn');

        sendKey('ArrowDown');
        expect(spyOnNavigate).not.toHaveBeenCalled();

        expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_ITEMS_NOT_PROVIDED());
    });

    it('should warn the user about no keys being provided for custom strategy', () => {
        const spyOnConsoleWarn = spyOn(console, 'warn');

        setConfig({
            type: 'custom',
            orientation: 'vertical',
            customStrategy: { loop: false, keys: undefined as unknown as Record<string, unknown> },
        });

        expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_KEYS_NOT_PROVIDED());
    });

    it('should not init the default strategy (menu) when there is already one initiated', () => {
        component.keyNav['service']['strategy'] = NAVIGATION_STRATEGIES.dropdown;
        component.keyNav['service'].init();

        const strategy: KeyboardNavigationStrategy = component.keyNav['service']['strategy'];
        expect(strategy).toEqual(NAVIGATION_STRATEGIES.dropdown);
    });

    it('should not save any of the undefined properties sent to the config', () => {
        setConfig({
            allowNavigateDisabled: undefined,
            allowRepeatedEventsFor: undefined,
            allowSelectFirstChild: undefined,
            childrenProperty: undefined,
            customStrategy: undefined,
            disabledProperty: undefined,
            orientation: undefined,
            throttleMs: undefined,
            type: undefined,
        });

        expect(component.keyNav.config).toEqual(NAVIGATION_DEFAULT);
    });

    it('should return the defaults for each getter', () => {
        expect(component.keyNav.items).toEqual([]);
        expect(component.keyNav.current).toEqual({ index: -1, path: [] });
        expect(component.keyNav.config).toEqual(NAVIGATION_DEFAULT);
    });

    describe('Check "validatePath()" method', () => {
        it('should update the last navigated state with the given path when there is a previous navigate state', () => {
            setItems(NAV_NESTED);

            sendKey('ArrowDown');
            setCurrent({ path: [0] });

            const itemA0: unknown = NAV_NESTED[0]['children'][0];

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA0, itemA0, 0, 0, [0], [0]));
        });

        it('should update the last navigated state with the given path when there is no previous navigate state', () => {
            setItems(NAV_NESTED);
            setCurrent({ path: [0] });

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(
                expectedNav('ArrowDown', 'next', undefined, NAV_NESTED[0]['children'][0], -1, 0, [0], [0])
            );
        });

        it('should not update the last navigated state with the given path because that level does not exist', () => {
            setItems(NAV_NESTED);
            setCurrent({ path: [10] });

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, NAV_NESTED[0], -1, 0, [], []));
        });

        describe('Check the change of path/index in a more complex nested object', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const CUSTOM_NAV_NESTED: any[] = JSON.parse(JSON.stringify(NAV_NESTED));
            CUSTOM_NAV_NESTED[0]['children'].push({ val: 'a-1' }, { val: 'a-2', disabled: true }, { val: 'a-3' });
            CUSTOM_NAV_NESTED[0]['children'][0].disabled = true;

            it('should jump to the given path and keep the index (since it was not set)', () => {
                setItems(CUSTOM_NAV_NESTED);

                sendKey('ArrowDown');
                setCurrent({ path: [0] });
                expect(component.keyNav.current).toEqual({ index: 0, path: [0] });

                const itemA0: unknown = CUSTOM_NAV_NESTED[0]['children'][0];
                const itemA1: unknown = CUSTOM_NAV_NESTED[0]['children'][1];

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA0, itemA1, 0, 1, [0], [0]));
            });

            it('should jump to the given path and index, then move to the first enabled item', () => {
                setItems(CUSTOM_NAV_NESTED);

                sendKey('ArrowDown');
                setCurrent({ path: [0], index: 3 });
                expect(component.keyNav.current).toEqual({ index: 3, path: [0] });

                const itemA3: unknown = CUSTOM_NAV_NESTED[0]['children'][3];
                const itemA1: unknown = CUSTOM_NAV_NESTED[0]['children'][1];

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA3, itemA1, 3, 1, [0], [0]));
            });

            it('should jump to the given path and index, then move to the next item (disabled allowed)', () => {
                setItems(CUSTOM_NAV_NESTED);
                setConfig({ allowNavigateDisabled: true });

                sendKey('ArrowDown');
                setCurrent({ path: [0], index: 1 });
                expect(component.keyNav.current).toEqual({ index: 1, path: [0] });

                const itemA1: unknown = CUSTOM_NAV_NESTED[0]['children'][1];
                const itemA2: unknown = CUSTOM_NAV_NESTED[0]['children'][2];

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA1, itemA2, 1, 2, [0], [0]));
            });

            it('should validate the change of path and/or index several times', () => {
                setItems(CUSTOM_NAV_NESTED);

                sendKey('ArrowDown');

                // Path and index exist
                setCurrent({ path: [0], index: 3 });
                expect(component.keyNav.current).toEqual({ index: 3, path: [0] });

                // Path exist, previous index doesn't (reset to -1)
                setCurrent({ path: [2] });
                expect(component.keyNav.current).toEqual({ index: -1, path: [2] });

                // New index exist
                setCurrent({ index: 1 });
                expect(component.keyNav.current).toEqual({ index: 1, path: [2] });

                // New path does not exist (reset path), previous index exist in new path (keep it)
                setCurrent({ path: [3] });
                expect(component.keyNav.current).toEqual({ index: 1, path: [] });

                // New path and index does not exist (reset both)
                setCurrent({ path: [5], index: 8 });
                expect(component.keyNav.current).toEqual({ index: -1, path: [] });

                // New path has empty children (not valid), should reset
                setCurrent({ path: [1], index: 3 });
                expect(component.keyNav.current).toEqual({ index: 3, path: [] });
            });
        });
    });

    it('should emit only one time for each action for a strategy with no loop', () => {
        setItems(NAV_SIMPLE);
        setConfig({ type: 'tree' });

        sendKey('Home');
        expect(spyOnNavigate).toHaveBeenCalledTimes(1);
        sendKey('Home');
        expect(spyOnNavigate).toHaveBeenCalledTimes(1);

        sendKey('ArrowUp');
        expect(spyOnNavigate).toHaveBeenCalledTimes(2);
        sendKey('ArrowUp');
        expect(spyOnNavigate).toHaveBeenCalledTimes(2);

        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(3);
        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(3);

        sendKey('ArrowLeft');
        expect(spyOnNavigate).toHaveBeenCalledTimes(4);
        sendKey('ArrowLeft');
        expect(spyOnNavigate).toHaveBeenCalledTimes(4);

        sendKey('End');
        expect(spyOnNavigate).toHaveBeenCalledTimes(5);
        sendKey('End');
        expect(spyOnNavigate).toHaveBeenCalledTimes(5);

        sendKey('ArrowDown');
        expect(spyOnNavigate).toHaveBeenCalledTimes(6);
        sendKey('ArrowDown');
        expect(spyOnNavigate).toHaveBeenCalledTimes(6);
    });

    it('should not navigate to subitems when current item has no children', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const CUSTOM_NAV_NESTED: any[] = JSON.parse(JSON.stringify(NAV_NESTED));
        CUSTOM_NAV_NESTED[0]['children'][0].disabled = true;

        setItems(CUSTOM_NAV_NESTED);
        setCurrent({ path: [1] });

        sendKey('ArrowDown'); // 'a'
        sendKey('ArrowRight'); // open
        expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', CUSTOM_NAV_NESTED[0], undefined, 0, -1, [], [0]));

        sendKey('ArrowDown'); // 'a-0' is disabled, not allowed
        expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, undefined, -1, -1, [0], [0]));

        sendKey('ArrowLeft'); // close

        sendKey('ArrowDown'); // 'b'
        sendKey('ArrowRight'); // open
        expect(lastNav()).toEqual(
            expectedNav('ArrowRight', 'open', CUSTOM_NAV_NESTED[1], CUSTOM_NAV_NESTED[1], 1, 1, [], [])
        );

        sendKey('End'); // 'd'
        sendKey('ArrowRight'); // open
        expect(lastNav()).toEqual(
            expectedNav('ArrowRight', 'open', CUSTOM_NAV_NESTED[3], CUSTOM_NAV_NESTED[3], 3, 3, [], [])
        );
    });

    describe('Check the strategies', () => {
        describe('Check "menu" strategy', () => {
            beforeEach(() => setItems(NAV_SIMPLE));

            it('should only emit available actions', () => {
                sendKey('End');
                expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowRight');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowLeft');
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('Home');
                expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);

                sendKey('PageUp'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);

                sendKey('PageDown'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);
            });

            it('should navigate through all items using arrow down and loop', () => {
                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'c', 'a', 2, 0, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(6);
            });

            it('should navigate through all items using arrow up and loop', () => {
                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'a', 'c', 0, 2, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(6);
            });

            it('should navigate to first item', () => {
                sendKey('Home');
                expect(lastNav()).toEqual(expectedNav('Home', 'first', undefined, 'a', -1, 0, [], []));
            });

            it('should navigate to last item', () => {
                sendKey('End');
                expect(lastNav()).toEqual(expectedNav('End', 'last', undefined, 'c', -1, 2, [], []));
            });
        });

        describe('Check "dropdown" strategy', () => {
            beforeEach(() => {
                setItems(NAV_SIMPLE);
                setConfig({ type: 'dropdown' });
            });

            it('should navigate through all items using arrow down and no loop', () => {
                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);
            });

            it('should navigate through all items using arrow up and no loop', () => {
                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);
            });

            it('should only emit available actions', () => {
                sendKey('End');
                expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowRight'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowLeft'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('Home');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('PageUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                sendKey('PageDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);
            });
        });

        describe('Check "tabs" strategy', () => {
            beforeEach(() => {
                setItems(NAV_SIMPLE);
                setConfig({ type: 'tabs' });
            });

            describe('Check orientation "horizontal" (default)', () => {
                it('should navigate through all items using arrow right and loop', () => {
                    sendKey('ArrowRight');
                    expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', undefined, 'a', -1, 0, [], []));

                    sendKey('ArrowRight');
                    expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'a', 'b', 0, 1, [], []));

                    sendKey('ArrowRight');
                    expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'b', 'c', 1, 2, [], []));

                    sendKey('ArrowRight');
                    expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'c', 'a', 2, 0, [], []));

                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);
                });

                it('should navigate through all items using arrow left and loop', () => {
                    sendKey('ArrowLeft');
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', undefined, 'c', -1, 2, [], []));

                    sendKey('ArrowLeft');
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'c', 'b', 2, 1, [], []));

                    sendKey('ArrowLeft');
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'b', 'a', 1, 0, [], []));

                    sendKey('ArrowLeft');
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'a', 'c', 0, 2, [], []));

                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);
                });

                it('should only emit available actions', () => {
                    sendKey('End');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                    sendKey('ArrowRight');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                    sendKey('ArrowLeft');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('ArrowUp'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('ArrowDown'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('Home');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                    sendKey('PageUp'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                    sendKey('Enter');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('PageDown'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('Space');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(6);
                });
            });

            describe('Check orientation "vertical"', () => {
                beforeEach(() => setConfig({ orientation: 'vertical' }));

                it('should navigate through all items using arrow down and loop', () => {
                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'c', 'a', 2, 0, [], []));

                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);
                });

                it('should navigate through all items using arrow up and loop', () => {
                    sendKey('ArrowUp');
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', undefined, 'c', -1, 2, [], []));

                    sendKey('ArrowUp');
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                    sendKey('ArrowUp');
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));

                    sendKey('ArrowUp');
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'a', 'c', 0, 2, [], []));

                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);
                });

                it('should only emit available actions', () => {
                    sendKey('End');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                    sendKey('ArrowUp');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                    sendKey('ArrowDown');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('ArrowRight'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('ArrowLeft'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('Home');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                    sendKey('PageUp'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                    sendKey('Enter');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('PageDown'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('Space');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(6);
                });
            });
        });

        describe('Check "toolbar" strategy', () => {
            beforeEach(() => {
                setItems(NAV_SIMPLE);
                setConfig({ type: 'toolbar' });
            });

            it('should navigate through all items using arrow right and loop', () => {
                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'b', 'c', 1, 2, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'c', 'a', 2, 0, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should navigate through all items using arrow left and loop', () => {
                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'b', 'a', 1, 0, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'a', 'c', 0, 2, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should only emit available actions', () => {
                sendKey('End');
                expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                sendKey('ArrowRight');
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowLeft');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowUp'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowDown'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('Home');
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('PageUp'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('PageDown'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });
        });

        describe('Check "radio" strategy', () => {
            beforeEach(() => {
                setItems(NAV_SIMPLE);
                setConfig({ type: 'radio' });
            });

            it('should navigate through all items using arrow right and loop', () => {
                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'b', 'c', 1, 2, [], []));

                sendKey('ArrowRight');
                expect(lastNav()).toEqual(expectedNav('ArrowRight', 'next', 'c', 'a', 2, 0, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should navigate through all items using arrow left and loop', () => {
                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'b', 'a', 1, 0, [], []));

                sendKey('ArrowLeft');
                expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'previous', 'a', 'c', 0, 2, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should navigate through all items using arrow down and loop', () => {
                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'c', 'a', 2, 0, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should navigate through all items using arrow up and loop', () => {
                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'a', 'c', 0, 2, [], []));

                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });

            it('should only emit available actions', () => {
                sendKey('End'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(0);

                sendKey('ArrowRight');
                expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                sendKey('ArrowLeft');
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('Home'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('PageUp'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('PageDown'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);
            });
        });

        describe('Check "tree" strategy', () => {
            beforeEach(() => {
                setItems(NAV_SIMPLE);
                setConfig({ type: 'tree' });
            });

            it('should navigate through all items using arrow down and no loop', () => {
                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                sendKey('ArrowDown');
                expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);
            });

            it('should navigate through all items using arrow up and no loop', () => {
                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', undefined, 'c', -1, 2, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'c', 'b', 2, 1, [], []));

                sendKey('ArrowUp');
                expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', 'b', 'a', 1, 0, [], []));
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);
            });

            it('should only emit available actions', () => {
                sendKey('End');
                expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                sendKey('ArrowRight');
                expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                sendKey('ArrowLeft');
                expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                sendKey('ArrowUp');
                expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                sendKey('ArrowDown');
                expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                sendKey('Home');
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);

                sendKey('PageUp'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);

                sendKey('PageDown'); // Not available
                expect(spyOnNavigate).toHaveBeenCalledTimes(6);
            });
        });

        describe('Check "slider" strategy', () => {
            const FLAT_ITEMS: number[] = Array.from({ length: 51 }, (_, i) => i);

            beforeEach(() => {
                setItems(FLAT_ITEMS);
                setCurrent(25);
                setConfig({ type: 'slider' });
            });

            it('should increase and decrease by one on arrow navigation', () => {
                sendKey('ArrowDown');
                expect(component.keyNav.current.index).toEqual(24);

                sendKey('ArrowRight');
                sendKey('ArrowRight');
                sendKey('ArrowRight');
                expect(component.keyNav.current.index).toEqual(27);

                sendKey('ArrowUp');
                sendKey('ArrowUp');
                expect(component.keyNav.current.index).toEqual(29);

                sendKey('ArrowLeft');
                expect(component.keyNav.current.index).toEqual(28);
            });

            it('should increase and decrease by 10 on page navigation', () => {
                sendKey('PageDown');
                expect(component.keyNav.current.index).toEqual(15);

                sendKey('PageUp');
                sendKey('PageUp');
                sendKey('PageUp');
                expect(component.keyNav.current.index).toEqual(45);

                sendKey('PageDown');
                expect(component.keyNav.current.index).toEqual(35);
            });

            it('should increase and decrease by 19 (custom pagination) on page navigation', () => {
                setConfig({ pageSize: 19 });

                sendKey('PageDown');
                expect(component.keyNav.current.index).toEqual(6);

                sendKey('PageDown');
                expect(component.keyNav.current.index).toEqual(0);

                sendKey('PageUp');
                sendKey('PageUp');
                expect(component.keyNav.current.index).toEqual(38);

                sendKey('PageUp');
                expect(component.keyNav.current.index).toEqual(50);

                sendKey('PageDown');
                expect(component.keyNav.current.index).toEqual(31);
            });
        });

        describe('Check "custom" strategy', () => {
            const customStrategy: KeyboardNavigationStrategy = {
                loop: false,
                keys: {
                    ArrowUp: 'next',
                    ArrowDown: 'first',
                    ArrowLeft: 'last',
                    PageDown: 'open',
                    Home: 'previous',
                    End: 'next',
                },
            };

            const customStrategyWithOrientation: KeyboardNavigationStrategy = {
                loop: false,
                keys: {
                    Home: 'previous',
                },
                keysHorizontal: {
                    ArrowUp: 'next',
                    ArrowDown: 'last',
                },
                keysVertical: {
                    ArrowLeft: 'last',
                    PageDown: 'open',
                },
            };

            describe('Check when no "type" is set', () => {
                beforeEach(() => {
                    setItems(NAV_SIMPLE);
                    setConfig({ customStrategy });
                });

                it('should not set the custom strategy and navigate according the default "menu" strategy', () => {
                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'c', 'a', 2, 0, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'a', 'b', 0, 1, [], []));

                    sendKey('ArrowDown');
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));

                    expect(spyOnNavigate).toHaveBeenCalledTimes(6);
                });
            });

            describe('Check when "type" is correctly set', () => {
                beforeEach(() => setConfig({ type: 'custom', customStrategy }));

                it('should navigate according the established strategy', () => {
                    setItems(NAV_SIMPLE);

                    sendKey('ArrowLeft'); // last
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'last', undefined, 'c', -1, 2, [], []));

                    sendKey('ArrowUp'); // next
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'next', 'c', 'c', 2, 2, [], []));

                    sendKey('Home'); // previous
                    expect(lastNav()).toEqual(expectedNav('Home', 'previous', 'c', 'b', 2, 1, [], []));

                    sendKey('End'); // next
                    expect(lastNav()).toEqual(expectedNav('End', 'next', 'b', 'c', 1, 2, [], []));

                    sendKey('ArrowDown'); // first
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'first', 'c', 'a', 2, 0, [], []));
                });

                it('should only emit available actions', () => {
                    setItems(NAV_SIMPLE);

                    sendKey('End');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                    sendKey('ArrowRight'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                    sendKey('ArrowLeft');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(2);

                    sendKey('ArrowUp');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(3);

                    sendKey('ArrowDown');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(4);

                    sendKey('Home');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('PageUp'); // Not available
                    expect(spyOnNavigate).toHaveBeenCalledTimes(5);

                    sendKey('PageDown');
                    expect(spyOnNavigate).toHaveBeenCalledTimes(6);
                });
            });

            describe('Check the orientation', () => {
                it('should navigate through the defined keys when "orientation" is set to "horizontal" (default)', () => {
                    setItems(NAV_SIMPLE);
                    setConfig({ type: 'custom', customStrategy: customStrategyWithOrientation });

                    // Home: 'previous' => generic
                    // ArrowUp: 'next'
                    // ArrowDown: 'last'

                    sendKey('ArrowRight'); // NOT defined
                    expect(spyOnNavigate).not.toHaveBeenCalled();

                    sendKey('ArrowUp'); // next
                    expect(lastNav()).toEqual(expectedNav('ArrowUp', 'next', undefined, 'a', -1, 0, [], []));

                    sendKey('ArrowDown'); // last
                    expect(lastNav()).toEqual(expectedNav('ArrowDown', 'last', 'a', 'c', 0, 2, [], []));

                    sendKey('ArrowDown'); // NOT defined
                    expect(spyOnNavigate).toHaveBeenCalledTimes(2);
                });

                it('should navigate through the defined keys when "orientation" is set to "vertical"', () => {
                    setItems(NAV_SIMPLE);
                    setConfig({
                        type: 'custom',
                        orientation: 'vertical',
                        customStrategy: customStrategyWithOrientation,
                    });

                    // Home: 'previous' => generic
                    // ArrowLeft: 'last'
                    // PageDown: 'open'

                    sendKey('ArrowRight'); // NOT defined
                    expect(spyOnNavigate).not.toHaveBeenCalled();

                    sendKey('ArrowLeft'); // last
                    expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'last', undefined, 'c', -1, 2, [], []));

                    sendKey('ArrowUp'); // NOT defined
                    expect(spyOnNavigate).toHaveBeenCalledTimes(1);

                    sendKey('PageDown'); // open
                    expect(lastNav()).toEqual(expectedNav('PageDown', 'open', 'c', 'c', 2, 2, [], []));
                });
            });
        });
    });

    it('should emit the same event when "resetLastNavigationState()" is invoked', () => {
        setItems(NAV_SIMPLE);

        sendKey('ArrowDown');
        expect(spyOnNavigate).toHaveBeenCalledTimes(1);

        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(2);

        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(2);

        component.keyNav.resetLastNavigationState();

        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(3);

        sendKey('ArrowRight');
        expect(spyOnNavigate).toHaveBeenCalledTimes(3);
    });

    describe('Check the "Current Navigation" input', () => {
        it('should navigate to third item when setting current index at second item', () => {
            setItems(NAV_SIMPLE);
            setCurrent(1);

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'b', 'c', 1, 2, [], []));
        });

        it('should navigate to first item when setting current index at an unexisting value', () => {
            setItems(NAV_SIMPLE);
            setCurrent(5);

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, 'a', -1, 0, [], []));
        });

        it('should navigate to first item (of the parent wanted level) when setting current path at an unexisting level', () => {
            setItems(NAV_NESTED);
            setCurrent({ path: [2, 2] });

            const itemC0: unknown = NAV_NESTED[2]['children'][0];

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, itemC0, -1, 0, [2], [2]));
        });

        it('should navigate to first item (of the wanted level) when setting current path at an existing level', () => {
            setItems(NAV_NESTED);
            setCurrent({ path: [2, 1] });

            const itemC10: unknown = NAV_NESTED[2]['children'][1]['children'][0];

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, itemC10, -1, 0, [2, 1], [2, 1]));
        });

        it('should not navigate to first item (loop) when setting current index at last item', () => {
            setItems(NAV_SIMPLE);
            setConfig({ type: 'dropdown' });
            setCurrent(2);

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', 'c', 'c', 2, 2, [], []));
        });

        it('should navigate to first item (loop) when setting path and current index at last item', () => {
            setItems(NAV_DISABLED);
            setConfig({ allowNavigateDisabled: true });
            setCurrent({ index: 1, path: [2] });

            const itemC0: unknown = NAV_DISABLED[2]['children'][0];
            const itemC1: unknown = NAV_DISABLED[2]['children'][1];

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC1, itemC0, 1, 0, [2], [2]));

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC0, itemC1, 0, 1, [2], [2]));
        });

        it('should not navigate to first item (item disabled) when setting path and current index at last item', () => {
            setItems(NAV_DISABLED);
            setCurrent({ index: 1, path: [2] });

            const itemC1: unknown = NAV_DISABLED[2]['children'][1];

            sendKey('ArrowDown');
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC1, itemC1, 1, 1, [2], [2]));

            sendKey('ArrowDown');
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);
        });
    });

    describe('Check the Throttle', () => {
        beforeEach(() => setItems(NAV_SIMPLE));

        it('should throttle repeated keydown events under the default value (100ms)', fakeAsync(() => {
            sendKey('ArrowDown');
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);

            tick(99);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);

            tick(1);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(2);

            tick(99);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(2);

            tick(1);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(3);
        }));

        it('should throttle repeated keydown events under the a custom value (50ms)', fakeAsync(() => {
            setConfig({ throttleMs: 50 });

            sendKey('ArrowDown');
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);

            tick(49);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);

            tick(1);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(2);

            tick(49);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(2);

            tick(1);
            sendKey('ArrowDown', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(3);

            tick(1500);
            sendKey('ArrowDown');
            expect(spyOnNavigate).toHaveBeenCalledTimes(4);

            tick(5000);
            sendKey('ArrowUp');
            expect(spyOnNavigate).toHaveBeenCalledTimes(5);

            tick(49);
            sendKey('ArrowUp', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(5);

            tick(1);
            sendKey('ArrowUp', true);
            expect(spyOnNavigate).toHaveBeenCalledTimes(6);
        }));

        it('should not throttle keydown events under the a custom value (0ms)', fakeAsync(() => {
            setConfig({ throttleMs: 0 });

            sendKey('ArrowDown');
            expect(spyOnNavigate).toHaveBeenCalledTimes(1);

            sendKey('ArrowDown', true);
            sendKey('ArrowDown', true);
            sendKey('ArrowDown', true);
            sendKey('ArrowDown', true);

            expect(spyOnNavigate).toHaveBeenCalledTimes(5);
        }));
    });

    describe('Check "allowSelectFirstChild" property', () => {
        beforeEach(() => setItems(NAV_DISABLED));

        const itemA: unknown = NAV_DISABLED[0];
        const itemA0: unknown = NAV_DISABLED[0]['children'][0];
        const itemC: unknown = NAV_DISABLED[2];
        const itemC1: unknown = NAV_DISABLED[2]['children'][1];

        it('should not select first child even if property is set to true but "allow navigate disabled" is false (default)', () => {
            setConfig({ allowSelectFirstChild: true });

            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemA, undefined, 0, -1, [], [0]));
        });

        it('should select first child when property is set to true and "allow navigate disabled" is also true', () => {
            setConfig({ allowSelectFirstChild: true, allowNavigateDisabled: true });

            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemA, itemA0, 0, 0, [], [0]));
        });

        it('should select first enabled child when property is set to true but "allow navigate disabled" is false (default)', () => {
            setConfig({ allowSelectFirstChild: true });

            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowDown'); // 'b'
            sendKey('ArrowDown'); // 'c'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC, itemC1, 2, 1, [], [2]));
        });

        it('should select first enabled child when property is set to true but "allow navigate disabled" is false (default)', () => {
            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowDown'); // 'b'
            sendKey('ArrowDown'); // 'c'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC, undefined, 2, -1, [], [2]));

            sendKey('ArrowDown'); // 'c-1'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, itemC1, -1, 1, [2], [2]));
        });
    });

    describe('Check "disabledProperty" property', () => {
        beforeEach(() => {
            setItems(NAV_DISABLED);
            setConfig({ allowSelectFirstChild: true });
        });

        it('should navigate only through the enabled items when "disabledProperty" property is an empty string and it is using the default "disabled" value', () => {
            setConfig({ disabledProperty: '' });

            const itemC: unknown = NAV_DISABLED[2];
            const itemC1: unknown = NAV_DISABLED[2]['children'][1];

            // - 'c'
            //   - 'c-0' <- disabled
            //   - 'c-1'
            //     - 'c-1-0'

            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowDown'); // 'b'
            sendKey('ArrowDown'); // 'c'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC, itemC1, 2, 1, [], [2]));
        });

        it('should navigate through all the items (even if disabled) when "disabledProperty" property has the wrong value', () => {
            setConfig({ disabledProperty: 'abc' });

            const itemA: unknown = NAV_DISABLED[0];
            const itemA0: unknown = NAV_DISABLED[0]['children'][0];
            const itemB: unknown = NAV_DISABLED[1];
            const itemC: unknown = NAV_DISABLED[2];
            const itemC0: unknown = NAV_DISABLED[2]['children'][0];
            const itemC1: unknown = NAV_DISABLED[2]['children'][1];

            sendKey('ArrowDown'); // 'a'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, itemA, -1, 0, [], []));

            sendKey('ArrowRight'); // 'a-0' <- disabled
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemA, itemA0, 0, 0, [], [0]));

            sendKey('ArrowLeft'); // back to 'a'

            sendKey('ArrowDown'); // 'b'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA, itemB, 0, 1, [], []));

            sendKey('ArrowDown'); // 'c'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemB, itemC, 1, 2, [], []));

            sendKey('ArrowRight'); // 'c-0' <- disabled
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC, itemC0, 2, 0, [], [2]));

            sendKey('ArrowDown'); // 'c-1'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC0, itemC1, 0, 1, [2], [2]));
        });
    });

    describe('Check "childrenProperty" property', () => {
        beforeEach(() => setItems(NAV_NESTED));

        it('should navigate to the children items when "childrenProperty" property is an empty string and it is using the default "children" value', () => {
            setConfig({ childrenProperty: '', allowSelectFirstChild: true });

            const itemA: unknown = NAV_NESTED[0];
            const itemA1: unknown = NAV_NESTED[0]['children'][0];

            // - 'a'
            //   - 'a-0'

            sendKey('ArrowDown'); // 'a'
            sendKey('ArrowRight'); // open
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemA, itemA1, 0, 0, [], [0]));
        });

        it('should not navigate through any of the children items when "childrenProperty" property has the wrong value', () => {
            setItems(NAV_NESTED);
            setConfig({ childrenProperty: 'abc' });

            sendKey('ArrowDown'); // 'a'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, NAV_NESTED[0], -1, 0, [], []));

            sendKey('ArrowRight');
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', NAV_NESTED[0], NAV_NESTED[0], 0, 0, [], []));

            sendKey('ArrowDown'); // 'b'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', NAV_NESTED[0], NAV_NESTED[1], 0, 1, [], []));

            sendKey('ArrowRight');
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', NAV_NESTED[1], NAV_NESTED[1], 1, 1, [], []));

            sendKey('ArrowDown'); // 'c'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', NAV_NESTED[1], NAV_NESTED[2], 1, 2, [], []));

            sendKey('ArrowRight');
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', NAV_NESTED[2], NAV_NESTED[2], 2, 2, [], []));

            sendKey('ArrowDown'); // 'd'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', NAV_NESTED[2], NAV_NESTED[3], 2, 3, [], []));

            sendKey('ArrowRight');
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', NAV_NESTED[3], NAV_NESTED[3], 3, 3, [], []));
        });
    });

    describe('Check nested items', () => {
        beforeEach(() => {
            setItems(NAV_NESTED);
            setConfig({ allowSelectFirstChild: true });
        });

        it('should navigate through the subitems when available', () => {
            const itemA: unknown = NAV_NESTED[0];
            const itemA0: unknown = NAV_NESTED[0]['children'][0];
            const itemB: unknown = NAV_NESTED[1];
            const itemC: unknown = NAV_NESTED[2];
            const itemC0: unknown = NAV_NESTED[2]['children'][0];
            const itemC1: unknown = NAV_NESTED[2]['children'][1];
            const itemC10: unknown = NAV_NESTED[2]['children'][1]['children'][0];
            const itemD: unknown = NAV_NESTED[3];

            // - 'a'
            //   - 'a-0'
            // - 'b'
            // - 'c'
            //   - 'c-0'
            //   - 'c-1'
            //     - 'c-1-0'
            // - 'd'

            sendKey('ArrowDown'); // 'a'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', undefined, itemA, -1, 0, [], []));

            sendKey('ArrowRight'); // 'a-0'
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemA, itemA0, 0, 0, [], [0]));

            sendKey('ArrowUp'); // 'a-0'
            expect(lastNav()).toEqual(expectedNav('ArrowUp', 'previous', itemA0, itemA0, 0, 0, [0], [0]));

            sendKey('ArrowDown'); // 'a-0'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA0, itemA0, 0, 0, [0], [0]));

            sendKey('ArrowLeft'); // 'a'
            expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'close', itemA0, itemA, 0, 0, [0], []));

            sendKey('ArrowDown'); // 'b'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemA, itemB, 0, 1, [], []));

            sendKey('ArrowRight'); // 'b'
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemB, itemB, 1, 1, [], []));

            sendKey('ArrowDown'); // 'c'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemB, itemC, 1, 2, [], []));

            sendKey('ArrowRight'); // 'c-0'
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC, itemC0, 2, 0, [], [2]));

            sendKey('ArrowDown'); // 'c-1'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC0, itemC1, 0, 1, [2], [2]));

            sendKey('ArrowRight'); // 'c-1-0'
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemC1, itemC10, 1, 0, [2], [2, 1]));

            sendKey('ArrowDown'); // 'c-1-0'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC10, itemC10, 0, 0, [2, 1], [2, 1]));

            sendKey('ArrowLeft'); // 'c-1'
            expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'close', itemC10, itemC1, 0, 1, [2, 1], [2]));

            sendKey('ArrowLeft'); // 'c'
            expect(lastNav()).toEqual(expectedNav('ArrowLeft', 'close', itemC1, itemC, 1, 2, [2], []));

            sendKey('ArrowDown'); // 'd'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemC, itemD, 2, 3, [], []));

            sendKey('ArrowRight'); // 'd'
            expect(lastNav()).toEqual(expectedNav('ArrowRight', 'open', itemD, itemD, 3, 3, [], []));

            sendKey('ArrowDown'); // 'a'
            expect(lastNav()).toEqual(expectedNav('ArrowDown', 'next', itemD, itemA, 3, 0, [], []));
        });
    });
});
