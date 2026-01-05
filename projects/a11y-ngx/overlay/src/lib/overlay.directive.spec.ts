import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NgModule, ViewChild } from '@angular/core';
import { forceElementsCleanup, forceStylesCleanup } from '../test';

import { A11yOverlayModule } from './overlay.module';
import { OverlayDirective } from './overlay.directive';

import { OverlayCustomConfig } from './overlay.type';

const theCustomStyles: { [property: string]: string | number } = {
    backgroundColor: 'rgb(255, 0, 0)',
    borderColor: 'rgb(255, 255, 0)',
    borderSize: 2,
    borderRadius: 10,
    shadow: '0 0 5px',
    shadowColor: 'rgb(255, 125, 0)',
    textColor: 'rgba(255, 255, 255, .9)',
    padding: '15px 20px',
};

@Component({
    selector: 'a11y-test-overlay-directive',
    template: `
        <button type="button" #trigger (click)="overlay.toggle()">trigger</button>
        <div a11yOverlay="a11yOverlay" [trigger]="trigger" [config]="config">
            <div [innerHTML]="content"></div>
        </div>
    `,
    styles: [
        `
            button {
                position: fixed;
                inset: auto 50% 50% auto;
            }
        `,
    ],
})
export class CustomOverlayDirectiveTestComponent {
    @ViewChild(OverlayDirective) overlay: OverlayDirective;

    config: OverlayCustomConfig = {};
    content: string = 'testing overlay with some big content';
}

@NgModule({
    declarations: [CustomOverlayDirectiveTestComponent],
    imports: [A11yOverlayModule],
})
export class CustomOverlayDirectiveTestModule {}

describe('Overlay Directive', () => {
    let component: CustomOverlayDirectiveTestComponent;
    let fixture: ComponentFixture<CustomOverlayDirectiveTestComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomOverlayDirectiveTestComponent],
            imports: [CustomOverlayDirectiveTestModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        fixture = TestBed.createComponent(CustomOverlayDirectiveTestComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();

        localStorage.removeItem('a11y.colorScheme');
    }));

    afterEach(() => {
        if (!forceElementsCleanup) return;

        fixture.nativeElement.remove();
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`should check that "isDirective" property is set to true`, () => {
        expect(component.overlay['isDirective']).toBe(true);
    });

    it(`should check that each style is set within the config properly`, () => {
        component.config = { ...theCustomStyles };
        fixture.detectChanges();

        const config = component.overlay['directiveConfig'];

        Object.keys(theCustomStyles).forEach((property) => expect(config[property]).toEqual(theCustomStyles[property]));
    });
});
