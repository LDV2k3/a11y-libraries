import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabCycleDirective } from './tab-cycle.directive';

@NgModule({
    declarations: [TabCycleDirective],
    imports: [CommonModule],
    exports: [TabCycleDirective],
})
export class A11yTabCycleModule {}
