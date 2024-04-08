import { Directive, ElementRef, AfterViewInit, Optional, Input, HostBinding } from '@angular/core';
import { filter, takeWhile } from 'rxjs/operators';

import { ResponsiveImageMapDirective } from './responsive-image-map.directive';

import { AreaSize } from './responsive-image-map.type';

@Directive({
    selector: `
        area[shape="rect"][coords],
        area[shape="circle"][coords]
    `
})
export class ResponsiveImageAreaDirective implements AfterViewInit {
    @Input() shape: string;
    @Input() set coords(coords: string) {
        this.originalCoords = coords.replace(/[^0-9,]/g, '').split(',').map(coord => parseInt(coord, 10));
    }

    @HostBinding('attr.coords') private newCoords: string;

    private originalCoords: number[];

    private get isRect(): boolean {
        return (this.shape.toLowerCase() === 'rect');
    }

    private get isCircle(): boolean {
        return (this.shape.toLowerCase() === 'circle');
    }

    get nativeElement(): HTMLAreaElement {
        return this.hostElement.nativeElement;
    }

    readonly areaSize: AreaSize = { width: 0, height: 0, left: 0, top: 0 };

    constructor(
        private hostElement: ElementRef<HTMLAreaElement>,
        @Optional() private mapDirective: ResponsiveImageMapDirective
    ) { }

    ngAfterViewInit(): void {
        this.mapDirective?.loaded
            .pipe(
                takeWhile(loaded => !loaded, true),
                filter(loaded => loaded)
            )
            .subscribe(() => this.updateCoords());
    }

    getBoundingClientRect(): DOMRect {
        this.mapDirective.update();

        let left: number;
        let top: number;
        let width: number;
        let height: number;

        const coords = this.originalCoords;

        if (coords) {
            const coordX1: number = coords[0]; // (beginning) left
            const coordX2: number = coords[2]; // (ending) left / radius
            const coordY1: number = coords[1]; // (beginning) top
            const coordY2: number = coords[3]; // (ending) top

            const scaleFactor = this.mapDirective.scaleFactor;
            const imageSize = this.mapDirective.imageSize;

            if (this.isRect) {
                left = (coordX1 * scaleFactor.width) + imageSize.left;
                top = (coordY1 * scaleFactor.height) + imageSize.top;
                width = (coordX2 - coordX1) * scaleFactor.width;
                height = (coordY2 - coordY1) * scaleFactor.height;
            } else if (this.isCircle) {
                left = ((coordX1 - coordX2) * scaleFactor.width) + imageSize.left;
                top = ((coordY1 - coordX2) * scaleFactor.height) + imageSize.top;
                width = (coordX2 * 2) * scaleFactor.width;
                height = (coordX2 * 2) * scaleFactor.height;
            }
        }

        return new DOMRect(left, top, width, height);
    }

    updateCoords(): void {
        const coords = this.originalCoords;

        if (coords) {
            let newCoords: number[];

            const scaleFactor = this.mapDirective.scaleFactor;

            const coordX1: number = Math.floor(coords[0] * scaleFactor.width);  // (beginning) left
            const coordX2: number = Math.floor(coords[2] * scaleFactor.width);  // (ending) left / radius
            const coordY1: number = Math.floor(coords[1] * scaleFactor.height); // (beginning) top
            const coordY2: number = Math.floor(coords[3] * scaleFactor.height); // (ending) top

            if (this.isRect) {
                newCoords = [coordX1, coordY1, coordX2, coordY2];

                this.areaSize.width = coordX2 - coordX1;
                this.areaSize.height = coordY2 - coordY1;
                this.areaSize.left = coordX1;
                this.areaSize.top = coordY1;
            } else if (this.isCircle) {
                newCoords = [coordX1, coordY1, coordX2];

                this.areaSize.width = coordX2 * 2;
                this.areaSize.height = coordX2 * 2;
                this.areaSize.left = coordX1 - coordX2;
                this.areaSize.top = coordY1 - coordX2;
            }

            this.newCoords = newCoords.join(',');
        }
    }
}
