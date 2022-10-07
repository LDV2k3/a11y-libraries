import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yWindowResizeModule } from '@a11y-ngx/window-resize';

import { ResponsiveImageAreaDirective } from './responsive-image-area.directive';
import { ResponsiveImageMapDirective } from './responsive-image-map.directive';

@NgModule({
    declarations: [ResponsiveImageAreaDirective, ResponsiveImageMapDirective],
    imports: [CommonModule, A11yWindowResizeModule],
    exports: [ResponsiveImageAreaDirective, ResponsiveImageMapDirective]
})
export class A11yResponsiveImageMapsModule { }
