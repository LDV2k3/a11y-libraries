import { TestBed, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import { A11yResponsiveImageMapsModule } from './responsive-image-map.module';
import { ResponsiveImageMapDirective } from './responsive-image-map.directive';

import { AreaSize, MapSize } from './responsive-image-map.type';

const coordsDefault: string[] = ['20,20,50,50', '100,200,50', '150,200,220,400,100,450'];
const widthDefault: number = 600;
const heightDefault: number = 400;

@Component({
    template: `
        <img width="{{ widthDefault }}" height="{{ heightDefault }}" src="" usemap="#test-map" />
        <map name="test-map" #map="responsiveImageMap">
            <area shape="rect" coords="{{ coordsDefault[0] }}" />
            <area shape="circle" coords="{{ coordsDefault[1] }}" />
            <area shape="poly" coords="{{ coordsDefault[2] }}" />
        </map>
    `,
    styles: [
        `
            img {
                position: fixed;
                top: 0;
                left: 0;
            }
        `,
    ],
})
class ResponsiveImageMapTestComponent {
    @ViewChild('map', { static: true }) map: ResponsiveImageMapDirective;

    coordsDefault = coordsDefault;
    widthDefault = widthDefault;
    heightDefault = heightDefault;
}

describe('Responsive Image Map Directive', () => {
    let component: ResponsiveImageMapTestComponent;
    let fixture: ComponentFixture<ResponsiveImageMapTestComponent>;

    const loadImage = (multiplyBy: number = 1): void => {
        Object.defineProperty(component.map.imageElement, 'naturalWidth', {
            writable: true,
            configurable: true,
            value: widthDefault * multiplyBy,
        });
        Object.defineProperty(component.map.imageElement, 'naturalHeight', {
            writable: true,
            configurable: true,
            value: heightDefault * multiplyBy,
        });
        component.map.imageElement.dispatchEvent(new Event('load'));
    };

    const originalSize: MapSize = {
        left: 0,
        top: 0,
        width: widthDefault,
        height: heightDefault,
        fullWidth: widthDefault,
        fullHeight: heightDefault,
    };

    beforeAll(() => (jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ResponsiveImageMapTestComponent],
            imports: [A11yResponsiveImageMapsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ResponsiveImageMapTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    afterEach(() => {
        fixture.nativeElement.remove();
        fixture.destroy();
    });

    describe('The Map Directive', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('Check the "update()" Method', () => {
            it('should been called when window resizes', fakeAsync(() => {
                const spyOnUpdate = spyOn(component.map, 'update');
                const spyOnUpdateCoordsAreaRect = spyOn(component.map.areas.get(0), 'updateCoords');
                const spyOnUpdateCoordsAreaCircle = spyOn(component.map.areas.get(1), 'updateCoords');
                const spyOnUpdateCoordsAreaPoly = spyOn(component.map.areas.get(2), 'updateCoords');

                loadImage();

                expect(spyOnUpdateCoordsAreaRect).toHaveBeenCalled();
                expect(spyOnUpdateCoordsAreaCircle).toHaveBeenCalled();
                expect(spyOnUpdateCoordsAreaPoly).toHaveBeenCalled();

                window.dispatchEvent(new Event('resize'));
                tick(100);
                expect(spyOnUpdate).toHaveBeenCalled();
            }));
        });

        describe('Check the "sizeChanged" Output', () => {
            it('should emit the first time the image has been loaded from the directive', () => {
                const spyOnLoad = spyOn(component.map.sizeChanged, 'emit');
                loadImage();
                expect(spyOnLoad).toHaveBeenCalledWith(originalSize);
            });

            it('should emit when window resizes', fakeAsync(() => {
                const spyOnResize = spyOn(component.map.sizeChanged, 'emit');

                loadImage();
                expect(spyOnResize).toHaveBeenCalledTimes(1);

                // Image was not resize, should not trigger `sizeChanged`.
                window.dispatchEvent(new Event('resize'));
                tick(100);
                expect(spyOnResize).toHaveBeenCalledTimes(1);

                component.map.imageElement.style.width = '300px';
                window.dispatchEvent(new Event('resize'));
                tick(100);
                expect(spyOnResize).toHaveBeenCalledWith({ ...originalSize, width: 300 });
                expect(spyOnResize).toHaveBeenCalledTimes(2);

                component.map.imageElement.style.height = '200px';
                window.dispatchEvent(new Event('resize'));
                tick(100);
                expect(spyOnResize).toHaveBeenCalledWith({ ...originalSize, width: 300, height: 200 });
                expect(spyOnResize).toHaveBeenCalledTimes(3);
            }));
        });
    });

    describe('The Area Directive', () => {
        it('should create', () => {
            component.map.areas.forEach((area) => expect(area).toBeTruthy());
            expect(component.map.areas.length).toBe(3);
        });

        describe('Check the "areaSize"', () => {
            it('should be initiated all at zero by default', () => {
                component.map.areas.forEach((area) => {
                    expect(area.areaSize).toEqual({ width: 0, height: 0, left: 0, top: 0 });
                });
            });

            it('should update accordingly when image loads', () => {
                loadImage(2);

                const areaSizeNew: AreaSize[] = [
                    { width: 15, height: 15, left: 10, top: 10 }, // rect
                    { width: 50, height: 50, left: 25, top: 75 }, // circle
                    { width: 60, height: 125, left: 50, top: 100 }, // poly
                ];

                component.map.areas.forEach((area, idx) => {
                    expect(area.areaSize).toEqual(areaSizeNew[idx]);
                });
            });
        });

        describe('Check the "coords"', () => {
            it('should be initiated all with their defaults', () => {
                component.map.areas.forEach((area, idx) => {
                    expect(area.coords).toEqual(coordsDefault[idx]);
                });
            });

            const imageSizeMultiplier: number[] = [2, 2.1, 7, 4, 1.5];

            imageSizeMultiplier.forEach((multiplier) => {
                const imageSize: string = `${widthDefault * multiplier}x${heightDefault * multiplier}`;
                it(`should update accordingly on an image size of "${imageSize}" when image loads`, () => {
                    loadImage(multiplier);

                    component.map.areas.forEach((area, idx) => {
                        const coordsNew: string = coordsDefault[idx]
                            .split(',')
                            .map((coord) => Math.round(Number(coord) / multiplier))
                            .join(',');

                        expect(area.coords).toEqual(coordsNew);
                    });
                });
            });
        });

        describe('Check the "getBoundingClientRect()"', () => {
            it('should update accordingly when image changes position', () => {
                loadImage();

                component.map.imageElement.style.top = '20px';
                component.map.imageElement.style.left = '50px';

                component.map.areas.forEach((area, idx) => {
                    const coords = coordsDefault[idx].split(',').map(Number);
                    let currentTop: number;
                    let currentLeft: number;

                    if (area.shape === 'circle') {
                        // should subtract the radius
                        currentTop = coords[1] - coords[2];
                        currentLeft = coords[0] - coords[2];
                    } else {
                        currentTop = Math.min(...coords.filter((_, i) => i % 2 !== 0));
                        currentLeft = Math.min(...coords.filter((_, i) => i % 2 === 0));
                    }

                    const areaDOMRect: DOMRect = area.getBoundingClientRect();

                    expect(areaDOMRect.top).toEqual(currentTop + 20);
                    expect(areaDOMRect.left).toEqual(currentLeft + 50);
                });
            });
        });
    });
});
