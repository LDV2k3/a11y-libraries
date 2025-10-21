import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'a11y-sr-only',
    templateUrl: './sr-only.component.html',
    styleUrls: ['./sr-only.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ScreenReaderOnlyComponent {
    @Input() text: string | undefined = undefined;
}

@Component({
    selector: 'a11y-visually-hidden',
    templateUrl: './sr-only.component.html',
})
export class VisuallyHiddenComponent extends ScreenReaderOnlyComponent {}
