import { Directive, ElementRef, AfterViewInit, Optional, Input, HostBinding } from '@angular/core';
import { filter, takeWhile } from 'rxjs/operators';

import { ResponsiveImageMapDirective } from './responsive-image-map.directive';

import { AreaSize, MapSize } from './responsive-image-map.type';

@Directive({
    selector: 'area[shape][coords]',
    exportAs: 'responsiveImageArea',
})
export class ResponsiveImageAreaDirective implements AfterViewInit {
    @Input() shape!: 'rect' | 'circle' | 'poly';
    @Input()
    get coords(): string {
        return this.newCoords ?? this.originalCoords.join(',');
    }
    set coords(coords: string) {
        this.originalCoords = coords
            .replace(/[^0-9,]/g, '')
            .split(',')
            .map((coord) => parseInt(coord, 10));
    }

    @HostBinding('attr.coords') private newCoords!: string;

    private originalCoords!: number[];

    private get isRect(): boolean {
        return this.shape.toLowerCase() === 'rect';
    }

    private get isCircle(): boolean {
        return this.shape.toLowerCase() === 'circle';
    }

    private get isPoly(): boolean {
        return this.shape.toLowerCase() === 'poly';
    }

    /** @description The `<area>` element. */
    get nativeElement(): HTMLAreaElement {
        return this.hostElement.nativeElement;
    }

    /** @description The `<area>` size and position. */
    readonly areaSize: AreaSize = { width: 0, height: 0, left: 0, top: 0 };

    constructor(
        private hostElement: ElementRef<HTMLAreaElement>,
        @Optional() private mapDirective: ResponsiveImageMapDirective
    ) {}

    ngAfterViewInit(): void {
        this.mapDirective?.loaded
            .pipe(
                takeWhile((loaded: boolean) => !loaded, true),
                filter((loaded: boolean) => loaded)
            )
            .subscribe(() => this.updateCoords());
    }

    /** @description Tho get the `<area>` DOMRect info. */
    getBoundingClientRect(): DOMRect {
        this.mapDirective.update();

        const imageSize: MapSize = this.mapDirective.imageSize;

        const left: number = this.areaSize.left + imageSize.left;
        const top: number = this.areaSize.top + imageSize.top;
        const width: number = this.areaSize.width;
        const height: number = this.areaSize.height;

        return new DOMRect(left, top, width, height);
    }

    /** @description Tho update the `<area>` coordinates based on the current image size. */
    updateCoords(): void {
        if (!this.originalCoords) {
            const errorMsg: string = `
                A11y Responsive Image Map:
                Unable to get the coordinates for the <area> element in the map "#${this.mapDirective.name}".
            `;
            console.warn(errorMsg.replace(/ {2,}/g, ''));
            return;
        }

        const { width, height } = this.mapDirective.scaleFactor;
        const newCoords: number[] = this.originalCoords.map((coord: number, idx: number) =>
            Math.round(coord * (idx % 2 === 0 ? width : height))
        );

        if (this.isPoly) {
            const evenIndexesValues: number[] = newCoords.filter((_, i) => i % 2 === 0);
            const oddIndexesValues: number[] = newCoords.filter((_, i) => i % 2 !== 0);

            const left: number = Math.min(...evenIndexesValues);
            const top: number = Math.min(...oddIndexesValues);

            this.areaSize.width = Math.max(...evenIndexesValues) - left;
            this.areaSize.height = Math.max(...oddIndexesValues) - top;
            this.areaSize.left = left;
            this.areaSize.top = top;
        } else {
            const coordX1: number = newCoords[0]; // (beginning) left
            const coordX2: number = newCoords[2]; // (ending) left / radius
            const coordY1: number = newCoords[1]; // (beginning) top
            const coordY2: number = newCoords[3]; // (ending) top

            if (this.isRect) {
                this.areaSize.width = coordX2 - coordX1;
                this.areaSize.height = coordY2 - coordY1;
                this.areaSize.left = coordX1;
                this.areaSize.top = coordY1;
            } else if (this.isCircle) {
                this.areaSize.width = coordX2 * 2;
                this.areaSize.height = coordX2 * 2;
                this.areaSize.left = coordX1 - coordX2;
                this.areaSize.top = coordY1 - coordX2;
            }
        }

        this.newCoords = newCoords.join(',');
    }
}
