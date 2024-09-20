import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsiveImageMapDirective } from './responsive-image-map.directive';
import { ResponsiveImageAreaDirective } from './responsive-image-area.directive';

@NgModule({
    declarations: [ResponsiveImageMapDirective, ResponsiveImageAreaDirective],
    imports: [CommonModule],
    exports: [ResponsiveImageMapDirective, ResponsiveImageAreaDirective],
})
export class A11yResponsiveImageMapsModule {}
