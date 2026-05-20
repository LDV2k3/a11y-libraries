import { NgModule } from '@angular/core';

import { KeyboardNavigationDirective } from './keyboard-navigation.directive';

@NgModule({
    declarations: [KeyboardNavigationDirective],
    exports: [KeyboardNavigationDirective],
})
export class A11yKeyboardNavigationModule {}
