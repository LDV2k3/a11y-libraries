import {
    PLATFORM_ID,
    Injectable,
    Inject,
    Injector,
    OnDestroy,
    Optional,
    SkipSelf,
    ComponentFactoryResolver,
    ComponentRef,
    ApplicationRef,
    EmbeddedViewRef,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './announcer.errors';

import { LiveAnnouncerComponent } from './announcer.component';

@Injectable({ providedIn: 'root' })
export class LiveAnnouncerService implements OnDestroy {
    private announcerRef!: ComponentRef<LiveAnnouncerComponent>;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        @Inject(PLATFORM_ID) private platformId: string,
        @Inject(DOCUMENT) private document: Document,
        @Optional() @SkipSelf() private parentService: LiveAnnouncerService | null
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('LiveAnnouncerService'));

        this.createAnnouncer();
    }

    ngOnDestroy(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.announcerRef.destroy();
    }

    /**
     * @description
     * Announces the given `message` waiting for the screen reader until
     * it finishes its current speech before reading this.
     */
    announce(message: string): void {
        this.announceMessage(message, true);
    }

    /**
     * @description
     * Announces the given `message` interrupting the screen reader for any ongoing speech.
     */
    interrupt(message: string): void {
        this.announceMessage(message, false);
    }

    /**
     * @description
     * Announces the given `message`.
     */
    private announceMessage(message: string, doItPolite: boolean): void {
        const announcer: LiveAnnouncerComponent = this.announcerRef.instance;

        announcer.announce('', doItPolite);
        setTimeout(() => announcer.announce(message, doItPolite), 75);
    }

    /**
     * @description
     * Creates the announcer live region at the end of the `<body>`.
     */
    private createAnnouncer(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        // Creates the Live Announcer component reference
        this.announcerRef = this.componentFactoryResolver
            .resolveComponentFactory(LiveAnnouncerComponent)
            .create(this.injector);

        // Attaches the view to the app.
        this.appRef.attachView(this.announcerRef.hostView);

        // Gets the Host View as an HTML Element
        const announcerElement: HTMLElement = (this.announcerRef.hostView as EmbeddedViewRef<unknown>)
            .rootNodes[0] as HTMLElement;

        // Attaches the Live Announcer HTML Element at the end of the `<body>`
        this.document.body.appendChild(announcerElement);
    }
}
