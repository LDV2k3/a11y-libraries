import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { forceStylesCleanup } from '../test';

import { A11yOverlayModule } from './overlay.module';
import { OverlayBaseComponent } from './overlay.component.base';

describe('Overlay Base Component', () => {
    let component: OverlayBaseComponent;
    let fixture: ComponentFixture<OverlayBaseComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OverlayBaseComponent],
            imports: [A11yOverlayModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        fixture = TestBed.createComponent(OverlayBaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    afterAll(() => {
        fixture.nativeElement.remove();
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
