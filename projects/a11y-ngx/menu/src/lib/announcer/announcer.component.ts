import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';

@Component({
    selector: 'a11y-live-announcer',
    template: '{{ ariaLiveMessage }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'a11y-visually-hidden',
        'aria-atomic': 'true',
        '[attr.aria-live]': `ariaLivePolite ? 'polite' : 'assertive'`,
    },
})
export class LiveAnnouncerComponent {
    ariaLiveMessage: string = '';

    protected ariaLivePolite: boolean = true;

    private ariaLiveTimeout!: ReturnType<typeof setTimeout>;

    private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
    private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    /**
     * @description
     * Announces something through the aria-live element.
     */
    announce(message: string, doItPolite: boolean): void {
        clearTimeout(this.ariaLiveTimeout);

        const host: HTMLElement = this.host.nativeElement;

        this.ariaLivePolite = doItPolite;
        host.removeAttribute('aria-hidden');
        this.cdr.detectChanges();

        setTimeout(() => {
            this.ariaLiveMessage = message;
            this.cdr.detectChanges();
        }, 100);

        this.ariaLiveTimeout = setTimeout(() => {
            this.ariaLivePolite = true;
            host.setAttribute('aria-hidden', 'true');
            this.cdr.detectChanges();
        }, 3000);
    }
}
