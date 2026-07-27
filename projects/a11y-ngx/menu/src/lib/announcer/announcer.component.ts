import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'a11y-live-announcer',
    template: '{{ ariaLiveMessage }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'a11y-visually-hidden',
        'aria-atomic': 'true',
        '[attr.aria-hidden]': 'ariaLiveHidden',
        '[attr.aria-live]': `ariaLivePolite ? 'polite' : 'assertive'`,
    },
})
export class LiveAnnouncerComponent {
    ariaLiveMessage: string = '';

    protected ariaLiveHidden: boolean = true;
    protected ariaLivePolite: boolean = true;

    private ariaLiveTimeout!: ReturnType<typeof setTimeout>;

    constructor(private cdr: ChangeDetectorRef) {}

    /**
     * @description
     * Announces something through the aria-live element.
     */
    announce(message: string, doItPolite: boolean): void {
        clearTimeout(this.ariaLiveTimeout);

        this.ariaLivePolite = doItPolite;
        this.ariaLiveHidden = false;
        this.cdr.detectChanges();

        setTimeout(() => {
            this.ariaLiveMessage = message;
            this.cdr.detectChanges();
        }, 100);

        this.ariaLiveTimeout = setTimeout(() => {
            this.ariaLivePolite = true;
            this.ariaLiveHidden = true;
            this.cdr.detectChanges();
        }, 3000);
    }
}
