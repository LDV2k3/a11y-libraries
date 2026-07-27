// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

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

// To delete the trigger/menu after each test. // Default true
export const forceElementsCleanup: boolean = true;
/* istanbul ignore next */
if (!forceElementsCleanup)
    console.warn('WATCH OUT!!! the "forceElementsCleanup" is set to false and your tests may fail!!!');

// -------------- FOR DEBUGGING PURPOSES --------------
// -------------- FOR DEBUGGING PURPOSES --------------

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: forceElementsCleanup },
});

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
