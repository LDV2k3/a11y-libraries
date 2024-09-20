import {
    Directive,
    Input,
    Output,
    ContentChildren,
    ElementRef,
    EventEmitter,
    QueryList,
    AfterViewInit,
    OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { WindowResizeService } from '@a11y-ngx/window-resize';

import { ResponsiveImageAreaDirective } from './responsive-image-area.directive';

import { ImageSize, MapSize } from './responsive-image-map.type';

@Directive({
    selector: 'map[name]',
    exportAs: 'responsiveImageMap',
})
export class ResponsiveImageMapDirective implements AfterViewInit, OnDestroy {
    @Input() name!: string;

    @Output() sizeChanged: EventEmitter<MapSize> = new EventEmitter<MapSize>();

    @ContentChildren(ResponsiveImageAreaDirective) areas!: QueryList<ResponsiveImageAreaDirective>;

    /** @description To know when the image has been loaded. */
    readonly loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** @description The image size and position. */
    readonly imageSize: MapSize = { left: 0, top: 0, width: 0, height: 0, fullWidth: 0, fullHeight: 0 };

    private readonly destroy$: Subject<void> = new Subject<void>();
    private imageMainElement!: HTMLImageElement;

    /** @description The `<img>` element. */
    get imageElement(): HTMLImageElement {
        return this.imageMainElement;
    }

    /** @description The `<map>` element */
    get nativeElement(): HTMLMapElement {
        return this.hostElement.nativeElement;
    }

    /** @description The scale factor of the image. */
    get scaleFactor(): ImageSize {
        return {
            width: this.imageSize.width / this.imageSize.fullWidth,
            height: this.imageSize.height / this.imageSize.fullHeight,
        };
    }

    /** @description If the image is loaded. */
    private get isLoaded(): boolean {
        return this.loaded.value;
    }

    constructor(private hostElement: ElementRef<HTMLMapElement>, private resizeService: WindowResizeService) {}

    ngAfterViewInit(): void {
        this.initMap();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initMap(): void {
        if (!this.areas.length) return;

        const useMap = `[usemap="#${this.name}"]`;
        const imageElements: HTMLImageElement[] = Array.from(document.querySelectorAll(useMap));

        if (imageElements.length !== 1) {
            let errorMsg: string;

            if (!imageElements.length) {
                errorMsg = `There's no <img> tag with ${useMap}.`;
            } else {
                errorMsg = `There's more than one <img> tag with ${useMap}.`;
            }

            errorMsg = `
                A11y Responsive Image Map:
                ${errorMsg}
            `;
            console.warn(errorMsg.replace(/ {2,}/g, ''));
            return;
        }

        this.imageMainElement = imageElements[0];

        this.imageElement.addEventListener(
            'load',
            () => {
                this.updateSize();
                this.sizeChanged.emit(this.imageSize);
                this.loaded.next(true);
            },
            { once: true }
        );

        this.resizeService.event.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
            const oldSize = `${this.imageSize.width}x${this.imageSize.height}`;
            this.update();
            const newSize = `${this.imageSize.width}x${this.imageSize.height}`;

            if (oldSize !== newSize) {
                this.sizeChanged.emit(this.imageSize);
            }
        });
    }

    private updateSize(): void {
        const imageRect: DOMRect = this.imageElement.getBoundingClientRect();

        this.imageSize.top = imageRect.top;
        this.imageSize.left = imageRect.left;
        this.imageSize.width = imageRect.width;
        this.imageSize.height = imageRect.height;
        this.imageSize.fullWidth = this.imageElement.naturalWidth;
        this.imageSize.fullHeight = this.imageElement.naturalHeight;
    }

    /** @description To update the image size and its `<area>` coordinates on demand. */
    update(): void {
        if (this.isLoaded) {
            this.updateSize();
            this.areas.forEach((area: ResponsiveImageAreaDirective) => area.updateCoords());
        }
    }
}
