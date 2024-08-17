import { TestBed } from '@angular/core/testing';

import { ColorSchemeService } from './color-scheme.service';

describe('Color Scheme Service', () => {
    let service: ColorSchemeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorSchemeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should correctly update the "userChosen" property when its value is changed', () => {
        service['chosenValue'] = undefined;
        expect(service.userChosen).toEqual('auto');

        service.userChosen = 'dark';
        expect(service.userChosen).toEqual('dark');
    });

    it('should have the right values set for the default schemes', () => {
        expect(service.colorSchemes.length).toEqual(3);
        expect(service.colorSchemes[0].value).toEqual('light');
        expect(service.colorSchemes[1].value).toEqual('dark');
        expect(service.colorSchemes[2].value).toEqual('auto');
    });

    it('should have "allowUserToChangeScheme" set on "true" by default', () => {
        expect(service.allowUserToChangeScheme).toBeTrue();
    });
});
