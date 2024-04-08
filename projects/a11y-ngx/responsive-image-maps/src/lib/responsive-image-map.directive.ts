import { Directive, Input, Output, ContentChildren, ElementRef, EventEmitter, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { WindowResizeService } from '@a11y-ngx/window-resize';

import { ResponsiveImageAreaDirective } from './responsive-image-area.directive';

import { MapSize } from './responsive-image-map.type';

@Directive({ selector: 'map[name]', exportAs: 'responsiveImageMap' })
export class ResponsiveImageMapDirective implements AfterViewInit, OnDestroy {
    @Input() name: string;

    readonly loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private readonly destroy$: Subject<void> = new Subject<void>();
    private imageMainElement: HTMLImageElement;

    @Output() sizeChanged: EventEmitter<MapSize> = new EventEmitter<MapSize>();

    @ContentChildren(ResponsiveImageAreaDirective) areas: QueryList<ResponsiveImageAreaDirective>;

    readonly imageSize: MapSize = { left: 0, top: 0, width: 0, height: 0, fullWidth: 0, fullHeight: 0 };
    get imageElement(): HTMLImageElement {
        return this.imageMainElement;
    }

    get scaleFactor(): { width: number, height: number } {
        return {
            width: this.imageSize.width / this.imageSize.fullWidth,
            height: this.imageSize.height / this.imageSize.fullHeight
        };
    }

    get nativeElement(): HTMLMapElement {
        return this.hostElement.nativeElement;
    }

    private get isLoaded(): boolean {
        return this.loaded.value;
    }

    constructor(
        private hostElement: ElementRef<HTMLMapElement>,
        private resizeService: WindowResizeService
    ) { }

    ngAfterViewInit(): void {
        if (this.areas.length) {
            this.initMap();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initMap(): void {
        const useMap = `[usemap="#${this.name}"]`;
        const imageElement: HTMLImageElement = document.querySelector(useMap);

        if (imageElement) {
            this.imageMainElement = imageElement;

            this.imageElement.addEventListener('load', () => {
                this.updateSize();
                this.loaded.next(true);
            }, { once: true });

            this.resizeService.event
                .pipe(debounceTime(100), takeUntil(this.destroy$))
                .subscribe(() => {
                    const oldSize = `${this.imageSize.width}x${this.imageSize.height}`;
                    this.update();
                    const newSize = `${this.imageSize.width}x${this.imageSize.height}`;

                    if (oldSize !== newSize) {
                        this.sizeChanged.emit(this.imageSize);
                    }
                });
        } else {
            console.warn(`There's no <img> tag with ${useMap}`);
        }
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

    update(): void {
        if (this.isLoaded) {
            this.updateSize();
            this.areas.forEach(area => area.updateCoords());
        }
    }
}
