import { TestBed } from '@angular/core/testing';

import { ThemeRootService } from './theme.service.root';

describe('ThemeRootService', () => {
    let service: ThemeRootService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeRootService);
    });

    it('should create the <style> tag', () => {
        const styleTag = document.getElementById('a11y-theme');
        expect(styleTag).toBeTruthy();
    });

    it('should remove the <style> tag when destroyed', () => {
        service.ngOnDestroy();
        const styleTag = document.getElementById('a11y-theme');
        expect(styleTag).toBeFalsy();
    });
});
