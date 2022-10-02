import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WindowResizeService } from './window-resize.service';

@NgModule({
    imports: [CommonModule],
    providers: [WindowResizeService]
})
export class A11yWindowResizeModule { }
