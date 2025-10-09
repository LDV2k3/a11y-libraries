// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ɵDomSharedStylesHost } from '@angular/platform-browser';
import { OVERLAY_STYLES_ID } from './public-api';

declare const require: {
    context(
        path: string,
        deep?: boolean,
        filter?: RegExp
    ): {
        keys(): string[];
        <T>(id: string): T;
    };
};

// -------------- FOR DEBUGGING PURPOSES --------------
// -------------- FOR DEBUGGING PURPOSES --------------

// To clean up the styles after each test. // Default true
export const forceStylesCleanup: boolean = true;
// To delete the trigger/overlay after each test. // Default true
export const forceElementsCleanup: boolean = true;

// -------------- FOR DEBUGGING PURPOSES --------------
// -------------- FOR DEBUGGING PURPOSES --------------

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

afterEach(() => {
    if (!forceStylesCleanup) return;
    document.querySelectorAll(`#${OVERLAY_STYLES_ID}`).forEach((style) => style.remove());
    getTestBed().inject(ɵDomSharedStylesHost).ngOnDestroy();
});

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);

// And load the modules.
context.keys().map(context);
