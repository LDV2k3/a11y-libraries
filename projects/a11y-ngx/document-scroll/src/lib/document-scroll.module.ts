import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentScrollService } from './document-scroll.service';

@NgModule({
    imports: [CommonModule],
    providers: [DocumentScrollService]
})
export class A11yDocumentScrollModule { }
