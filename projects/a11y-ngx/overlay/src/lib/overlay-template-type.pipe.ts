import { Pipe, PipeTransform, TemplateRef } from '@angular/core';

@Pipe({ name: 'overlayTemplate' })
export class OverlayTemplateTypePipe implements PipeTransform {
    transform(template: TemplateRef<unknown> | string): TemplateRef<unknown> {
        return template as TemplateRef<unknown>;
    }
}
