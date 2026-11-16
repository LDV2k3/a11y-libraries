import { Component, OnInit, inject, ElementRef } from '@angular/core';

@Component({
    selector: 'a11y-menu-separator',
    template: '',
    styleUrls: ['./menu-separator.component.scss'],
    host: {
        role: 'separator',
        '[attr.aria-orientation]': 'orientation',
    },
})
export class MenuSeparatorComponent implements OnInit {
    private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

    protected orientation: 'horizontal' | 'vertical' = 'horizontal';

    ngOnInit(): void {
        setTimeout(() => {
            if (this.hostElement.nativeElement.closest('[menu-group="inline"]')) {
                this.orientation = 'vertical';
            }
        });
    }
}
