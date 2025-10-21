import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SROnlyCreateCSSRootService } from './sr-only-create-root-css.service';

import { ScreenReaderOnlyComponent, VisuallyHiddenComponent } from './sr-only.component';

@NgModule({
    declarations: [ScreenReaderOnlyComponent, VisuallyHiddenComponent],
    imports: [CommonModule],
    exports: [ScreenReaderOnlyComponent, VisuallyHiddenComponent],
})
export class A11ySROnlyModule {
    constructor(private CSSRootService: SROnlyCreateCSSRootService) {
        this.CSSRootService.createCSSRoot();
    }
}
