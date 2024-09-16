import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

import { A11yTabCycleModule } from './tab-cycle.module';
import { TabCycleDirective } from './tab-cycle.directive';

@Component({
    template: `
        <div #div a11yTabCycle>
            <input type="text" />
            <input type="checkbox" />
            <button type="button" disabled>button 01</button>
            <div tabindex="0">some content</div>
            <button type="button">button 02</button>
        </div>
        <div #div a11yTabCycle="false"></div>
        <div #div [a11yTabCycle]="false"></div>
        <div #div a11yTabCycle tabindex></div>
        <div #div a11yTabCycle tabindex="0"></div>
    `,
})
class TabCycleTestComponent {
    @ViewChildren('div', { read: ElementRef }) divs: QueryList<HTMLDivElement>;
    @ViewChildren(TabCycleDirective) directives: QueryList<TabCycleDirective>;
}

describe('Tab Cycle Directive', () => {
    let component: TabCycleTestComponent;
    let fixture: ComponentFixture<TabCycleTestComponent>;

    const TAB: KeyboardEvent = new KeyboardEvent('keydown', { code: 'Tab', bubbles: true });
    const SHIFT_TAB: KeyboardEvent = new KeyboardEvent('keydown', { code: 'Tab', shiftKey: true, bubbles: true });

    const getDivElement = (idx: number): HTMLDivElement =>
        (component.divs.get(idx) as unknown as ElementRef<HTMLDivElement>).nativeElement;
    const getDirective = (idx: number): TabCycleDirective => component.directives.get(idx) as TabCycleDirective;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TabCycleTestComponent],
            imports: [A11yTabCycleModule],
        }).compileComponents();

        fixture = TestBed.createComponent(TabCycleTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    afterAll(() => {
        /* fixture.nativeElement.remove();
        fixture.destroy(); */
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.directives.length).toBe(5);
    });

    it('should check for enabled directives', () => {
        const directivesEnabled: number = component.directives.filter((directive) => directive.isEnabled).length;
        expect(directivesEnabled).toBe(4);
    });

    describe('Check the Attributes', () => {
        it('should check the "tabindex" attribute has the right value', () => {
            expect(getDivElement(0).getAttribute('tabindex')).toBe('-1');
            expect(getDivElement(1).getAttribute('tabindex')).toBe('-1');
            expect(getDivElement(2).getAttribute('tabindex')).toBeNull();
            expect(getDivElement(3).getAttribute('tabindex')).toBe('-1');
            expect(getDivElement(4).getAttribute('tabindex')).toBe('0');
        });

        it('should check the "tabindex" attribute from the getter has the right value', () => {
            expect(getDirective(0).tabindex).toBe('-1');
            expect(getDirective(1).tabindex).toBe('-1');
            expect(getDirective(2).tabindex).toBeNull();
            expect(getDirective(3).tabindex).toBe('-1');
            expect(getDirective(4).tabindex).toBe('0');
        });

        it('should check the "role" attribute has the right value', () => {
            expect(getDivElement(0).getAttribute('role')).toBe('dialog');
            expect(getDivElement(1).getAttribute('role')).toBe('dialog');
            expect(getDivElement(2).getAttribute('role')).toBeNull();
            expect(getDivElement(3).getAttribute('role')).toBe('dialog');
            expect(getDivElement(4).getAttribute('role')).toBe('dialog');
        });

        it('should check the "aria-modal" attribute has the right value', () => {
            expect(getDivElement(0).getAttribute('aria-modal')).toBe('true');
            expect(getDivElement(1).getAttribute('aria-modal')).toBe('true');
            expect(getDivElement(2).getAttribute('aria-modal')).toBeNull();
            expect(getDivElement(3).getAttribute('aria-modal')).toBe('true');
            expect(getDivElement(4).getAttribute('aria-modal')).toBe('true');
        });
    });

    describe('Check the Enable/Disable', () => {
        it('should update the attributes accordingly', () => {
            expect(getDirective(1).isEnabled).toBeTrue();

            getDirective(1).a11yTabCycle = false;

            expect(getDirective(1).isEnabled).toBeFalse();

            expect(getDivElement(1).getAttribute('tabindex')).toBeNull();
            expect(getDivElement(1).getAttribute('role')).toBeNull();
            expect(getDivElement(1).getAttribute('aria-modal')).toBeNull();

            getDirective(1).a11yTabCycle = true;

            expect(getDirective(1).isEnabled).toBeTrue();

            expect(getDivElement(1).getAttribute('tabindex')).toBe('-1');
            expect(getDivElement(1).getAttribute('role')).toBe('dialog');
            expect(getDivElement(1).getAttribute('aria-modal')).toBe('true');
        });

        it('should update the attributes accordingly, except "tabindex" which was pre-set', () => {
            expect(getDirective(4).tabindex).toBe('0');
            expect(getDivElement(4).getAttribute('tabindex')).toBe('0');

            getDirective(4).a11yTabCycle = false;

            expect(getDivElement(4).getAttribute('tabindex')).toBe('0');
            expect(getDivElement(4).getAttribute('role')).toBeNull();
            expect(getDivElement(4).getAttribute('aria-modal')).toBeNull();

            getDirective(4).a11yTabCycle = true;

            expect(getDivElement(4).getAttribute('tabindex')).toBe('0');
            expect(getDivElement(4).getAttribute('role')).toBe('dialog');
            expect(getDivElement(4).getAttribute('aria-modal')).toBe('true');
        });
    });

    describe('Check the First Focus', () => {
        it('should focus on the first element', () => {
            const directive = component.directives.get(0);
            const tabbableElements = directive.tabbableElements;
            directive.focus('first');
            expect(document.activeElement).not.toEqual(directive.nativeElement);
            expect(document.activeElement).toEqual(tabbableElements[0]);
        });

        it('should focus on the last element', () => {
            const directive = component.directives.get(0);
            const tabbableElements = directive.tabbableElements;
            directive.focus('last');
            expect(document.activeElement).not.toEqual(directive.nativeElement);
            expect(document.activeElement).toEqual(tabbableElements[tabbableElements.length - 1]);
        });
    });

    describe('Check the Tab Cycle', () => {
        it('should focus on the right elements when pressing TAB and SHIFT+TAB combination keys', () => {
            const directive = component.directives.get(0);
            const tabbableElements = directive.tabbableElements;
            const documentKeydown = (e: KeyboardEvent): void => {
                if (e.code !== 'Tab') return;

                e.preventDefault();

                const currentIndex: number = tabbableElements.indexOf(document.activeElement as HTMLElement);
                let nextIndex: number;

                if (e.shiftKey) {
                    nextIndex =
                        currentIndex === -1
                            ? tabbableElements.length - 1
                            : (currentIndex - 1 + tabbableElements.length) % tabbableElements.length;
                } else {
                    nextIndex = (currentIndex + 1) % tabbableElements.length;
                }

                tabbableElements[nextIndex].focus();
            };

            document.addEventListener('keydown', documentKeydown);

            spyOn(directive, 'manageKeyDown');

            directive.focus();
            expect(document.activeElement).toEqual(directive.nativeElement);

            directive.nativeElement.dispatchEvent(TAB);
            expect(directive.manageKeyDown).toHaveBeenCalledWith(TAB);

            expect(document.activeElement).toEqual(tabbableElements[0]);
            expect(document.activeElement.nodeName).toEqual('INPUT');
            expect(document.activeElement.getAttribute('type')).toEqual('text');

            directive.nativeElement.dispatchEvent(TAB);
            expect(document.activeElement).toEqual(tabbableElements[1]);
            expect(document.activeElement.nodeName).toEqual('INPUT');
            expect(document.activeElement.getAttribute('type')).toEqual('checkbox');

            directive.nativeElement.dispatchEvent(TAB);
            expect(document.activeElement).toEqual(tabbableElements[2]);
            expect(document.activeElement.nodeName).toEqual('DIV');

            directive.nativeElement.dispatchEvent(TAB);
            expect(document.activeElement).toEqual(tabbableElements[3]);
            expect(document.activeElement.nodeName).toEqual('BUTTON');

            directive.nativeElement.dispatchEvent(TAB);
            expect(document.activeElement).toEqual(tabbableElements[0]);
            expect(document.activeElement.nodeName).toEqual('INPUT');
            expect(document.activeElement.getAttribute('type')).toEqual('text');

            directive.focus();
            expect(document.activeElement).toEqual(directive.nativeElement);

            directive.nativeElement.dispatchEvent(SHIFT_TAB);
            expect(directive.manageKeyDown).toHaveBeenCalledWith(SHIFT_TAB);

            expect(document.activeElement).toEqual(tabbableElements[3]);
            expect(document.activeElement.nodeName).toEqual('BUTTON');

            directive.nativeElement.dispatchEvent(SHIFT_TAB);
            expect(document.activeElement).toEqual(tabbableElements[2]);
            expect(document.activeElement.nodeName).toEqual('DIV');

            directive.nativeElement.dispatchEvent(SHIFT_TAB);
            expect(document.activeElement).toEqual(tabbableElements[1]);
            expect(document.activeElement.nodeName).toEqual('INPUT');
            expect(document.activeElement.getAttribute('type')).toEqual('checkbox');

            directive.nativeElement.dispatchEvent(SHIFT_TAB);
            expect(document.activeElement).toEqual(tabbableElements[0]);
            expect(document.activeElement.nodeName).toEqual('INPUT');
            expect(document.activeElement.getAttribute('type')).toEqual('text');

            directive.nativeElement.dispatchEvent(SHIFT_TAB);
            expect(document.activeElement).toEqual(tabbableElements[3]);
            expect(document.activeElement.nodeName).toEqual('BUTTON');
            directive.nativeElement.dispatchEvent(SHIFT_TAB);

            document.removeEventListener('keydown', documentKeydown);
        });
    });
});
