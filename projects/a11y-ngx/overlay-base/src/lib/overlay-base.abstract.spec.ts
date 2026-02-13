import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OverlayBase } from './overlay-base.abstract';

import {
    OVERLAY_BASE_DEFAULTS,
    OverlayBaseConfig,
    OverlayBaseAlignment,
    OverlayBaseAlignmentsAllowed,
    OverlayBasePosition,
    OverlayBasePositionInput,
    OverlayBasePositionsAllowed,
    OverlayBasePositionStrategy,
} from './overlay-base.type';

import { ERROR_NO_TRIGGER_PROVIDED } from './overlay-base.errors';

import { forceElementsCleanup } from '../test';

@Component({
    selector: 'a11y-test-overlay-abstract-class',
    template: `
        <div class="safe-space" #safeSpace>
            <div class="top-bottom"></div>
            <div class="left-right"></div>
        </div>
        <div class="scroll-generator" *ngIf="generateScroll"></div>

        <div #boundaryEl class="boundary {{ activeBoundary ? activeBoundary : '' }}" [class.active]="activeBoundary">
            <div
                class="overlay overlay1"
                #overlay
                [style.display]="isOverlay(1) && isVisible ? 'inline-flex' : 'none'"
                [style.opacity]="isOverlay(1) && isOpaque ? '1' : '0'"
                [style.transform]="'scale(' + customScaleFactor + ')'">
                <div *ngFor="let item of [1, 2, 3, 4, 5]">some content to test the overlay</div>
            </div>

            <div
                class="overlay overlay2"
                #overlay
                [style.display]="isOverlay(2) && isVisible ? 'inline-flex' : 'none'"
                [style.opacity]="isOverlay(2) && isOpaque ? '1' : '0'">
                <div *ngFor="let item of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, eos dolorum maxime, facere
                    eligendi reprehenderit, excepturi officiis repudiandae dignissimos provident corporis iure maiores
                    officia dolor non ipsum rem ad! Consequatur!
                </div>
            </div>

            <div
                class="overlay overlay3"
                #overlay
                [style.display]="isOverlay(3) && isVisible ? 'inline-flex' : 'none'"
                [style.opacity]="isOverlay(3) && isOpaque ? '1' : '0'">
                :)
            </div>

            <div
                class="overlay overlay4"
                #overlay
                [style.display]="isOverlay(4) && isVisible ? 'inline-flex' : 'none'"
                [style.opacity]="isOverlay(4) && isOpaque ? '1' : '0'">
                :)
            </div>

            <button type="button" class="trigger" #trigger (click)="toggle()">trigger</button>
        </div>
    `,
    styles: [
        `
            .safe-space {
                position: fixed;
                inset: 0;
                z-index: 0;
            }
            .safe-space.hide {
                display: none;
            }
            .safe-space .top-bottom::before,
            .safe-space .top-bottom::after,
            .safe-space .left-right::before,
            .safe-space .left-right::after {
                content: '';
                position: fixed;
                background-color: rgb(0 70 255 / 40%);
            }

            .safe-space .top-bottom::before {
                inset: 0 0 auto 0;
                width: 100%;
                height: var(--top, 0);
            }
            .safe-space .top-bottom::after {
                inset: auto 0 0 0;
                width: 100%;
                height: var(--bottom, 0);
            }
            .safe-space .left-right::before {
                inset: var(--top, 0) auto 0 0;
                height: calc(100% - var(--top, 0) - var(--bottom, 0));
                width: var(--left);
            }
            .safe-space .left-right::after {
                inset: var(--top, 0) 0 0 auto;
                height: calc(100% - var(--top, 0) - var(--bottom, 0));
                width: var(--right, 0);
            }
            .scroll-generator {
                position: absolute;
                inset: 0 auto auto 0;
            }
            .scroll-generator::before {
                content: '';
                position: absolute;
                inset: 0 auto auto 0;
                width: 3000px;
                height: 1px;
                background-color: red;
            }
            .scroll-generator::after {
                content: '';
                position: absolute;
                inset: 0 auto auto 0;
                width: 1px;
                height: 3000px;
                background-color: red;
            }
            .trigger {
                position: absolute;
                inset: 50% auto auto 50%;
                transform: translate(-50%, -50%);
                border: 1px solid;
                background-color: #8cdb62;
                padding: 0;
                width: 50px;
                height: 30px;
            }
            .overlay {
                position: fixed;
                background-color: rgb(18 34 135 / 85%);
                color: #fff;
                border: 1px solid #000;
                z-index: 100;
                overflow: auto;
            }
            .overlay1 {
                width: 200px;
                height: 150px;
            }
            .overlay2 {
                width: calc(100vw * 0.7);
                height: calc(100vh * 0.3);
            }
            .overlay3 {
                width: 25px;
                height: 25px;
                align-items: center;
                justify-content: center;
            }
            .overlay4 {
                position: absolute;
                width: 100px;
                height: 100px;
                align-items: center;
                justify-content: center;
            }
            .boundary.active {
                overflow: auto;
                box-sizing: border-box;
            }
            .boundary.active::before {
                content: '';
                position: absolute;
                inset: 0 auto auto 0;
                width: 1px;
                height: 300%;
            }
            .boundary.active::after {
                content: '';
                position: absolute;
                inset: 0 auto auto 0;
                width: 300%;
                height: 1px;
            }
            .boundary1 {
                position: fixed;
                inset: 25%;
            }
            .boundary2 {
                position: absolute;
                inset: 50px;
            }
        `,
    ],
})
class OverlayComponent extends OverlayBase implements AfterViewInit, OnDestroy {
    @ViewChildren('overlay') overlays: QueryList<ElementRef<HTMLDivElement>>;
    @ViewChild('boundaryEl') boundaryEl: ElementRef<HTMLDivElement>;
    @ViewChild('safeSpace') safeSpaceEl: ElementRef<HTMLDivElement>;
    @ViewChild('trigger') trigger: ElementRef<HTMLButtonElement>;

    overlay: HTMLDivElement;
    boundary: HTMLDivElement;

    customScaleFactor: number = 1;

    readonly destroy$: Subject<void> = new Subject<void>();

    private activeOverlay: string = 'overlay1';
    private activeBoundary: string | undefined;
    private scrollGenerator: boolean = false;

    isOverlay(num: number): boolean {
        return this.activeOverlay === `overlay${num}`;
    }

    set selectOverlay(overlay: number) {
        this.activeOverlay = `overlay${overlay}`;
        this.overlay = this.overlays.get(overlay - 1).nativeElement;
    }

    set selectBoundary(boundary: number) {
        this.activeBoundary = `boundary${boundary}`;
        this.boundary = this.boundaryEl.nativeElement;
    }

    get generateScroll(): boolean {
        return this.scrollGenerator;
    }
    set generateScroll(generateScroll: boolean) {
        this.scrollGenerator = generateScroll;
    }

    isVisible: boolean = false;
    isOpaque: boolean = false;
    debounceTime: number = 10;

    constructor(private r2: Renderer2) {
        super();
    }

    ngAfterViewInit(): void {
        this.overlay = this.overlays.get(0).nativeElement;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    show(debounceTime: number = this.debounceTime): void {
        if (this.isVisible) return;

        this.isVisible = true;

        this.attachOverlay(this.overlay, debounceTime)
            .pipe(takeUntil(merge(this.isDetached$, this.destroy$)))
            .subscribe((data) => {
                const top: string | null = data.render.top !== null ? `${data.render.top}px` : null;
                const left: string | null = data.render.left !== null ? `${data.render.left}px` : null;
                const bottom: string | null = data.render.bottom !== null ? `${data.render.bottom}px` : null;
                const right: string | null = data.render.right !== null ? `${data.render.right}px` : null;

                this.overlay.style.top = top;
                this.overlay.style.left = left;
                this.overlay.style.bottom = bottom;
                this.overlay.style.right = right;

                this.isOpaque = true;
            });
    }

    hide(): void {
        this.detachOverlay();
        this.isVisible = false;
        this.isOpaque = false;
    }

    checkSafeSpace(): void {
        if (this.isVisible) {
            const safeSpaceTop: string | null = this.safeSpace.top ? `${this.safeSpace.top}px` : null;
            const safeSpaceBottom: string | null = this.safeSpace.bottom ? `${this.safeSpace.bottom}px` : null;
            const safeSpaceLeft: string | null = this.safeSpace.left ? `${this.safeSpace.left}px` : null;
            const safeSpaceRight: string | null = this.safeSpace.right ? `${this.safeSpace.right}px` : null;

            if (safeSpaceTop || safeSpaceBottom || safeSpaceLeft || safeSpaceRight) {
                this.r2.removeClass(this.safeSpaceEl.nativeElement, 'hide');
                this.r2.setStyle(this.safeSpaceEl.nativeElement, '--top', safeSpaceTop, 2);
                this.r2.setStyle(this.safeSpaceEl.nativeElement, '--bottom', safeSpaceBottom, 2);
                this.r2.setStyle(this.safeSpaceEl.nativeElement, '--left', safeSpaceLeft, 2);
                this.r2.setStyle(this.safeSpaceEl.nativeElement, '--right', safeSpaceRight, 2);
            } else {
                this.r2.addClass(this.safeSpaceEl.nativeElement, 'hide');
            }
            return;
        }

        this.r2.addClass(this.safeSpaceEl.nativeElement, 'hide');
        this.r2.setStyle(this.safeSpaceEl.nativeElement, '--top', null, 2);
        this.r2.setStyle(this.safeSpaceEl.nativeElement, '--bottom', null, 2);
        this.r2.setStyle(this.safeSpaceEl.nativeElement, '--left', null, 2);
        this.r2.setStyle(this.safeSpaceEl.nativeElement, '--right', null, 2);
    }
}

describe('Abstract Overlay Base', () => {
    let component: OverlayComponent;
    let fixture: ComponentFixture<OverlayComponent>;

    let overlayRect: DOMRect;

    const debounceTimeMs: number = 10;

    const overlayWidth: number = 200 + 2;
    const overlayHeight: number = 150 + 2;

    const triggerWidth: number = 50;
    //const triggerHeight: number = 30;

    const debounceTime = (debounceTime: number = debounceTimeMs): void => {
        tick(debounceTime);
    };

    const toggleOverlay = (config?: OverlayBaseConfig): void => {
        if (!component.isVisible) {
            component.setBaseConfig({ trigger: component.trigger.nativeElement, ...config });
            component.show(debounceTimeMs);
            component.checkSafeSpace();
            fixture.detectChanges();
            debounceTime(debounceTimeMs);
            fixture.detectChanges();
            return;
        }

        component.hide();
        component.checkSafeSpace();
        fixture.detectChanges();
    };

    const recalculateOverlay = (config?: Partial<OverlayBaseConfig>): void => {
        if (config) component.setBaseConfig(config);
        component.recalculate();
        component.checkSafeSpace();
        debounceTime(debounceTimeMs);
        fixture.detectChanges();
    };

    const documentWidth = (): number => document.documentElement.clientWidth;
    const documentHeight = (): number => document.documentElement.clientHeight;

    const getOverlayRect = (): DOMRect => (overlayRect = component.overlayElement.getBoundingClientRect());

    const scrollTo = (left: number, top: number) => {
        window.scrollTo(left, top);
        window.dispatchEvent(new Event('scroll'));
        debounceTime();
    };

    const scrollBoundaryTo = (left: number, top: number) => {
        component.boundary.scrollTo(left, top);
        component.boundary.dispatchEvent(new Event('scroll'));
        debounceTime();
    };

    const isVisible = (element: HTMLElement): boolean => {
        const elementRects: DOMRectList | undefined = element.getClientRects?.();

        return (
            !!(elementRects?.length && elementRects?.[0]?.width && elementRects?.[0]?.height) &&
            getComputedStyle(element).visibility === 'visible'
        );
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OverlayComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        if (!forceElementsCleanup) return;

        fixture.nativeElement.remove();
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should throw an error if no trigger was provided', () => {
        expect(() => component['getTriggerClientRect']()).toThrowError(Error, ERROR_NO_TRIGGER_PROVIDED());
    });

    it('should properly set "isAttached" when attach/detach', fakeAsync(() => {
        expect(component['isAttached']).toBe(false);

        toggleOverlay();
        expect(component['isAttached']).toBe(true);

        toggleOverlay();
        expect(component['isAttached']).toBe(false);
    }));

    describe('Should check the "listeners" array', () => {
        it('should verify it only contains 4 (scroll, resize, boundary scroll and force update) by default', fakeAsync(() => {
            toggleOverlay();
            expect(component['listeners'].length).toBe(4);
        }));

        it('should verify it only contains 3 (resize, boundary scroll and force update) when a DOMRect is passed as a trigger', fakeAsync(() => {
            toggleOverlay({ trigger: new DOMRect(10, 10, 0, 0) });

            expect(component['listeners'].length).toBe(3);
        }));

        it('should verify to be reset after detach the overlay', fakeAsync(() => {
            expect(component['listeners'].length).toBe(0);
            toggleOverlay();
            expect(component['listeners'].length).toBe(4);
            toggleOverlay();
            expect(component['listeners'].length).toBe(0);
        }));
    });

    describe('Should check all the Subject / BehaviorSubject', () => {
        it('should verify "forceUpdate$" is called when "recalculate()" is invoked', fakeAsync(() => {
            expect(component['forceUpdate$']).toBe(undefined);

            toggleOverlay();

            const spyOnForceUpdate = spyOn(component['forceUpdate$'], 'next');
            const spyOnForceUpdateComplete = spyOn(component['forceUpdate$'], 'complete');

            expect(spyOnForceUpdate).not.toHaveBeenCalled();
            expect(component['forceUpdate$'].value).toBe(undefined);

            recalculateOverlay();
            expect(spyOnForceUpdate).toHaveBeenCalledWith();
            expect(spyOnForceUpdateComplete).not.toHaveBeenCalledWith();

            toggleOverlay();
            expect(spyOnForceUpdateComplete).toHaveBeenCalledWith();
        }));

        it('should verify "isDetached$" is called when "detachOverlay()" is invoked', fakeAsync(() => {
            expect(component.isDetached$).toBe(undefined);

            toggleOverlay();

            const spyOnIsDetached = spyOn(component.isDetached$, 'next');
            const spyOnIsDetachedComplete = spyOn(component.isDetached$, 'complete');

            expect(spyOnIsDetached).not.toHaveBeenCalled();
            expect(spyOnIsDetachedComplete).not.toHaveBeenCalled();

            toggleOverlay();
            expect(spyOnIsDetached).toHaveBeenCalledWith();
            expect(spyOnIsDetachedComplete).toHaveBeenCalledWith();
        }));

        it('should verify "resize$" is called when the window gets resized', fakeAsync(() => {
            const spyOnResize = spyOn(component['resize$'], 'next');
            expect(component['resize$']).not.toBe(undefined);

            toggleOverlay();
            expect(spyOnResize).not.toHaveBeenCalled();

            window.dispatchEvent(new Event('resize'));
            expect(spyOnResize).toHaveBeenCalledWith();
        }));

        it('should verify "scroll$" is called when the page gets scrolled', fakeAsync(() => {
            const spyOnScroll = spyOn(component['scroll$'], 'next');
            expect(component['scroll$']).not.toBe(undefined);

            toggleOverlay();
            expect(spyOnScroll).not.toHaveBeenCalled();

            scrollTo(0, 1);
            expect(spyOnScroll).toHaveBeenCalledWith();
        }));

        it('should verify "scroll$" is not called when "allowScrollListener" is set to false and the page gets scrolled', fakeAsync(() => {
            const spyOnScroll = spyOn(component['scroll$'], 'next');

            toggleOverlay({ allowScrollListener: false });

            scrollTo(0, 1);
            expect(spyOnScroll).not.toHaveBeenCalledWith();
        }));

        it('should verify "scroll$" is not called when "allowScrollListener" is set to true, a DOMRect is passed as a trigger and the page gets scrolled', fakeAsync(() => {
            const spyOnScroll = spyOn(component['scroll$'], 'next');

            toggleOverlay({ allowScrollListener: true, trigger: new DOMRect(10, 10, 0, 0) });

            scrollTo(0, 1);
            expect(spyOnScroll).not.toHaveBeenCalledWith();
        }));

        it('should verify "boundaryScroll$" is called when the boundary element gets scrolled', fakeAsync(() => {
            component.selectBoundary = 1;
            const spyOnBoundaryScroll = spyOn(component['boundaryScroll$'], 'next');
            expect(component['boundaryScroll$']).not.toBe(undefined);

            toggleOverlay({ boundary: component.boundary });
            expect(spyOnBoundaryScroll).not.toHaveBeenCalled();

            scrollBoundaryTo(0, 1);
            expect(spyOnBoundaryScroll).toHaveBeenCalledWith();

            // For coverage: To cover the removal of the boundary "scroll" listener when detached
            toggleOverlay();
        }));
    });

    it('should verify "detachOverlay()" is not invoked twice if the overlay is not currently attached', fakeAsync(() => {
        toggleOverlay();

        const spyOnIsDetached = spyOn(component.isDetached$, 'next');
        const spyOnIsDetachedComplete = spyOn(component.isDetached$, 'complete');

        expect(spyOnIsDetached).toHaveBeenCalledTimes(0);
        expect(spyOnIsDetachedComplete).toHaveBeenCalledTimes(0);

        component.detachOverlay();

        expect(spyOnIsDetached).toHaveBeenCalledTimes(1);
        expect(spyOnIsDetachedComplete).toHaveBeenCalledTimes(1);

        component.detachOverlay();

        expect(spyOnIsDetached).toHaveBeenCalledTimes(1);
        expect(spyOnIsDetachedComplete).toHaveBeenCalledTimes(1);
    }));

    it('should verify "attachOverlay()" is not invoked twice if the overlay is currently attached', fakeAsync(() => {
        toggleOverlay();

        expect(component.overlayElement).toEqual(component.overlay);

        const newOverlayElement: HTMLDivElement = document.createElement('div');
        const overlaySubscription: Subscription = component.attachOverlay(newOverlayElement).subscribe((data) => data);

        expect(component.overlayElement).toEqual(component.overlay);

        overlaySubscription.unsubscribe();
    }));

    it('should update the overlay DOMRect when "updateOverlaySize()" method is invoked', fakeAsync(() => {
        toggleOverlay();
        getOverlayRect();

        expect(overlayRect.width).toEqual(overlayWidth);
        expect(overlayRect.height).toEqual(overlayHeight);

        // Subtract 2 for the border
        component.overlayElement.style.width = `${overlayWidth - 2 + 20}px`;
        component.overlayElement.style.height = `${overlayHeight - 2 + 10}px`;

        component.updateOverlaySize();
        debounceTime();
        getOverlayRect();

        expect(overlayRect.width).toEqual(overlayWidth + 20);
        expect(overlayRect.height).toEqual(overlayHeight + 10);
    }));

    it('should have the entire configuration with their defaults', () => {
        expect(component.triggerElement).toEqual(undefined);
        expect(component.virtualTriggerRect).toEqual(undefined);
        expect(component.fluidAlignment).toEqual(OVERLAY_BASE_DEFAULTS.fluidAlignment);
        expect(component.fluidSize).toEqual(OVERLAY_BASE_DEFAULTS.fluidSize);
        expect(component['allowed'].alignments).toEqual(
            OVERLAY_BASE_DEFAULTS.alignmentsAllowed as OverlayBaseAlignment[]
        );
        expect(component['allowed'].positions).toEqual(OVERLAY_BASE_DEFAULTS.positionsAllowed as OverlayBasePosition[]);
        expect(component.getCurrentPosition).toEqual(undefined);
        expect(component.getCurrentAlignment).toEqual(undefined);
        expect(component.positionStrategy).toEqual(OVERLAY_BASE_DEFAULTS.positionStrategy);
        expect(component.boundaryElement).toEqual(document.body);
        expect(component.safeSpace).toEqual(OVERLAY_BASE_DEFAULTS.safeSpace);
        expect(component.offsetSize).toEqual(OVERLAY_BASE_DEFAULTS.offsetSize);
        expect(component.scaleFactor).toEqual(OVERLAY_BASE_DEFAULTS.initialScale);
        expect(component['allowScrollListener']).toEqual(OVERLAY_BASE_DEFAULTS.allowScrollListener);

        expect(component.maxSize).toEqual({ width: 0, height: 0 });
        expect(component.overlayOutside).toEqual(undefined);
        expect(component.overlayElement).toEqual(undefined);
    });

    it('should open the overlay and be visible, then close it and be hidden', fakeAsync(() => {
        toggleOverlay();
        expect(isVisible(component.overlayElement)).toBe(true);

        toggleOverlay();
        expect(isVisible(component.overlayElement)).toBe(false);
    }));

    describe('Should check the "setBaseConfig()" method', () => {
        it('should have the position & alignment not defined when undefined config is sent (early return)', fakeAsync(() => {
            component.setBaseConfig(undefined);
            expect(component.getCurrentPosition).toBe(undefined);
            expect(component.getCurrentAlignment).toBe(undefined);
        }));

        describe('Should check the "position" property', () => {
            const getTopBottomEndLeft = (): number =>
                component.triggerRect.left - (overlayRect.width - component.triggerRect.width);
            const getTopBottomEndTop = (): number =>
                component.triggerRect.top - overlayRect.height + component.triggerRect.height;
            const getTopBottomCenterLeft = (): number =>
                component.triggerRect.left - (overlayRect.width - component.triggerRect.width) / 2;

            const getLeftRightCenterTop = (): number =>
                component.triggerRect.top - (overlayRect.height - component.triggerRect.height) / 2;

            describe('Should check the opposite positions', () => {
                beforeEach(() => component.setBaseConfig({ positionsAllowed: 'opposite' }));

                it('should set the opposite position for "top" as "bottom"', fakeAsync(() => {
                    component.setBaseConfig({ position: 'top' });
                    expect(component['allowed'].positions).toEqual(['top', 'bottom']);
                }));

                it('should set the opposite position for "left" as "right"', fakeAsync(() => {
                    component.setBaseConfig({ position: 'left' });
                    expect(component['allowed'].positions).toEqual(['left', 'right']);
                }));

                it('should set the opposite position for "bottom" as "top"', fakeAsync(() => {
                    component.setBaseConfig({ position: 'bottom' });
                    expect(component['allowed'].positions).toEqual(['bottom', 'top']);
                }));

                it('should set the opposite position for "right" as "left"', fakeAsync(() => {
                    component.setBaseConfig({ position: 'right' });
                    expect(component['allowed'].positions).toEqual(['right', 'left']);
                }));

                it('should set the opposite position for a wrong value position as the defaults "top" & "bottom"', fakeAsync(() => {
                    component.setBaseConfig({ position: 'x' as OverlayBasePositionInput });
                    component['desiredPosition'] = undefined;
                    component.setBaseConfig({ position: 'x' as OverlayBasePositionInput });
                    expect(component['allowed'].positions).toEqual(['top', 'bottom']);
                }));
            });

            it('should set the default position/alignment ("top-start") when undefined values are found somehow', fakeAsync(() => {
                toggleOverlay();

                component['allowed'].positions = [];
                component['allowed'].alignments = [];
                component['desiredPosition'] = undefined;
                component['desiredAlignment'] = undefined;
                component.setBaseConfig({ position: undefined });

                expect(component['desiredPosition']).toEqual('top');
                // When no "allowed alignments" are found,
                // "start" will be set as default since "center" does not exist
                expect(component['desiredAlignment']).toEqual('start');
            }));

            describe('Should check the position TOP', () => {
                const getTop = (): number => component.triggerRect.top - overlayRect.height - component.offsetSize;

                it('should open the overlay in the position "top-center" (default)', fakeAsync(() => {
                    toggleOverlay();
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('top');
                    expect(component.getCurrentAlignment).toEqual('center');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getTopBottomCenterLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));

                it('should open the overlay in the position "top-start"', fakeAsync(() => {
                    toggleOverlay({ position: 'top-start' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('top');
                    expect(component.getCurrentAlignment).toEqual('start');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(component.triggerRect.left));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));

                it('should open the overlay in the position "top-end"', fakeAsync(() => {
                    toggleOverlay({ position: 'top-end' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('top');
                    expect(component.getCurrentAlignment).toEqual('end');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getTopBottomEndLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));
            });

            describe('Should check the position BOTTOM', () => {
                const getTop = (): number =>
                    component.triggerRect.top + component.triggerRect.height + component.offsetSize;

                it('should open the overlay in the position "bottom-center"', fakeAsync(() => {
                    toggleOverlay({ position: 'bottom-center' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('bottom');
                    expect(component.getCurrentAlignment).toEqual('center');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getTopBottomCenterLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));

                it('should open the overlay in the position "bottom-start"', fakeAsync(() => {
                    toggleOverlay({ position: 'bottom-start' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('bottom');
                    expect(component.getCurrentAlignment).toEqual('start');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(component.triggerRect.left));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));

                it('should open the overlay in the position "bottom-end"', fakeAsync(() => {
                    toggleOverlay({ position: 'bottom-end' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('bottom');
                    expect(component.getCurrentAlignment).toEqual('end');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getTopBottomEndLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTop()));
                }));
            });

            describe('Should check the position LEFT', () => {
                const getLeft = (): number => component.triggerRect.left - overlayRect.width - component.offsetSize;

                it('should open the overlay in the position "left-center"', fakeAsync(() => {
                    toggleOverlay({ position: 'left-center' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('left');
                    expect(component.getCurrentAlignment).toEqual('center');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getLeftRightCenterTop()));
                }));

                it('should open the overlay in the position "left-start"', fakeAsync(() => {
                    toggleOverlay({ position: 'left-start' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('left');
                    expect(component.getCurrentAlignment).toEqual('start');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(component.triggerRect.top));
                }));

                it('should open the overlay in the position "left-end"', fakeAsync(() => {
                    toggleOverlay({ position: 'left-end' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('left');
                    expect(component.getCurrentAlignment).toEqual('end');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTopBottomEndTop()));
                }));
            });

            describe('Should check the position RIGHT', () => {
                const getLeft = (): number =>
                    component.triggerRect.left + component.triggerRect.width + component.offsetSize;

                it('should open the overlay in the position "right-center"', fakeAsync(() => {
                    toggleOverlay({ position: 'right-center' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('right');
                    expect(component.getCurrentAlignment).toEqual('center');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getLeftRightCenterTop()));
                }));

                it('should open the overlay in the position "right-start"', fakeAsync(() => {
                    toggleOverlay({ position: 'right-start' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('right');
                    expect(component.getCurrentAlignment).toEqual('start');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(component.triggerRect.top));
                }));

                it('should open the overlay in the position "right-end"', fakeAsync(() => {
                    toggleOverlay({ position: 'right-end' });
                    getOverlayRect();

                    expect(component.getCurrentPosition).toEqual('right');
                    expect(component.getCurrentAlignment).toEqual('end');

                    expect(Math.round(overlayRect.left)).toEqual(Math.round(getLeft()));
                    expect(Math.round(overlayRect.top)).toEqual(Math.round(getTopBottomEndTop()));
                }));
            });

            it('should open the overlay in the default position/alignment if a non-valid value is passed', fakeAsync(() => {
                toggleOverlay({ position: 'x' as unknown as OverlayBasePositionInput });
                getOverlayRect();

                expect(component.getCurrentPosition).toEqual('top');
                expect(component.getCurrentAlignment).toEqual('center');

                recalculateOverlay({ position: 'left-x' as unknown as OverlayBasePositionInput });
                expect(component.getCurrentPosition).toEqual('left');
                expect(component.getCurrentAlignment).toEqual('center');

                recalculateOverlay({ position: 'x-end' as unknown as OverlayBasePositionInput });
                expect(component.getCurrentPosition).toEqual('top');
                expect(component.getCurrentAlignment).toEqual('end');

                recalculateOverlay({ position: 'bottom-x' as unknown as OverlayBasePositionInput });
                expect(component.getCurrentPosition).toEqual('bottom');
                expect(component.getCurrentAlignment).toEqual('center');

                recalculateOverlay({
                    alignmentsAllowed: 'edges',
                    position: 'bottom-x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentPosition).toEqual('bottom');
                expect(component.getCurrentAlignment).toEqual('start');

                recalculateOverlay({
                    alignmentsAllowed: 'end',
                    position: 'x-x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentPosition).toEqual('top');
                expect(component.getCurrentAlignment).toEqual('end');
            }));
        });

        describe('Should check the "safeSpace" property', () => {
            it('should establish the defaults when undefined is sent', fakeAsync(() => {
                component.setBaseConfig({ safeSpace: undefined });
                expect(component.safeSpace).toEqual(OVERLAY_BASE_DEFAULTS.safeSpace);
            }));

            it('should establish the defaults when wrong values are sent', fakeAsync(() => {
                component.setBaseConfig({ safeSpace: { top: undefined, bottom: -20, left: -1, right: null } });
                expect(component.safeSpace).toEqual(OVERLAY_BASE_DEFAULTS.safeSpace);
            }));

            it('should establish the right values when some are right and some wrong', fakeAsync(() => {
                component.setBaseConfig({ safeSpace: { top: 15, bottom: 20, left: undefined, right: -5 } });
                expect(component.safeSpace).toEqual({ right: 0, bottom: 20, left: 0, top: 15 });
            }));

            it('should establish the values sent', fakeAsync(() => {
                component.setBaseConfig({ safeSpace: { right: 5, left: 2 } });
                expect(component.safeSpace).toEqual({ right: 5, bottom: 0, left: 2, top: 0 });
            }));
        });

        describe('Should check the "offsetSize" property', () => {
            it('should establish the right value', fakeAsync(() => {
                component.setBaseConfig({ offsetSize: 10 });
                expect(component.offsetSize).toEqual(10);

                component.setBaseConfig({ offsetSize: 'x' as unknown as number });
                expect(component.offsetSize).toEqual(OVERLAY_BASE_DEFAULTS.offsetSize);

                component.setBaseConfig({ offsetSize: -5 });
                expect(component.offsetSize).toEqual(-5);

                component.setBaseConfig({ offsetSize: '15' as unknown as number });
                expect(component.offsetSize).toEqual(15);
            }));

            it('should open the overlay in the right distance of its trigger with an offset of 25px', fakeAsync(() => {
                const newOffsetSize: number = 25;
                toggleOverlay({ offsetSize: newOffsetSize });
                getOverlayRect();

                expect(Math.round(overlayRect.top)).toEqual(
                    Math.round(component.triggerRect.top - overlayRect.height - newOffsetSize)
                );
            }));

            it('should open the overlay in the right distance of its trigger with no offset', fakeAsync(() => {
                toggleOverlay({ offsetSize: 0, position: 'right' });
                getOverlayRect();

                expect(Math.round(overlayRect.left)).toEqual(
                    Math.round(component.triggerRect.left + component.triggerRect.width)
                );
            }));
        });

        describe('Should check the "scaleFactor" property', () => {
            const expectedCommon = (): void => {
                const triggerRect: DOMRect = component.trigger.nativeElement.getBoundingClientRect();

                toggleOverlay();

                expect(component.scaleFactor).toEqual(1);

                component.customScaleFactor = 1;
                fixture.detectChanges();
                getOverlayRect();

                expect(overlayRect.top).toEqual(triggerRect.top - overlayHeight - component.offsetSize);
                expect(overlayRect.left).toEqual(triggerRect.left - overlayWidth / 2 + triggerWidth / 2);
            };

            it('should set the overlay in the right "top-center" position when the initial scale factor is above normal', fakeAsync(() => {
                component.customScaleFactor = 1.5;
                fixture.detectChanges();

                component.setBaseConfig({ initialScale: 1.5 });
                expect(component.scaleFactor).toEqual(1.5);

                expectedCommon();
            }));

            it('should set the overlay in the right "top-center" position when the initial scale factor is below normal', fakeAsync(() => {
                component.customScaleFactor = 0.7;
                fixture.detectChanges();

                component.setBaseConfig({ initialScale: 0.7 });
                expect(component.scaleFactor).toEqual(0.7);

                expectedCommon();
            }));

            it('should set the scale factor to 1 when it is not a valid value', () => {
                component.setBaseConfig({ initialScale: 'invalid-value' as unknown as number });
                expect(component.overlayConfig.initialScale).toEqual(1);

                component.setBaseConfig({ initialScale: undefined });
                expect(component.overlayConfig.initialScale).toEqual(1);

                component.setBaseConfig({ initialScale: 0 });
                expect(component.overlayConfig.initialScale).toEqual(1);
            });

            it('should set the scale factor to the minimum (0.1) when it is a valid value but below the minimum', () => {
                component.setBaseConfig({ initialScale: 0.009 });
                expect(component.overlayConfig.initialScale).toEqual(0.1);

                component.setBaseConfig({ initialScale: 0.09 });
                expect(component.overlayConfig.initialScale).toEqual(0.1);

                component.setBaseConfig({ initialScale: 0.099 });
                expect(component.overlayConfig.initialScale).toEqual(0.1);
            });

            it('should update the overlay original rect when reposition', fakeAsync(() => {
                const customScaleFactor: number = 1.44;
                component.customScaleFactor = customScaleFactor;

                toggleOverlay({ initialScale: customScaleFactor });

                let originalRect: DOMRect = component['overlayOriginalRect'];
                expect(+originalRect.width.toFixed(2)).toEqual(overlayWidth * customScaleFactor);
                expect(+originalRect.height.toFixed(2)).toEqual(overlayHeight * customScaleFactor);

                component.customScaleFactor = 1;
                fixture.detectChanges();
                recalculateOverlay();

                originalRect = component['overlayOriginalRect'];
                expect(+originalRect.width.toFixed(2)).toEqual(overlayWidth);
                expect(+originalRect.height.toFixed(2)).toEqual(overlayHeight);
            }));
        });

        describe('Should check the "positionsAllowed" property', () => {
            it('should open the overlay in the allowed position despite of the one desired', fakeAsync(() => {
                toggleOverlay({ positionsAllowed: ['right'], position: 'left' });
                expect(component.getCurrentPosition).toEqual('right');

                recalculateOverlay({ positionsAllowed: ['bottom'], position: 'right' });
                expect(component.getCurrentPosition).toEqual('bottom');

                recalculateOverlay({ positionsAllowed: ['left'], position: 'bottom' });
                expect(component.getCurrentPosition).toEqual('left');
            }));

            it('should open the overlay in the first allowed position if a non-valid position value is passed', fakeAsync(() => {
                toggleOverlay({
                    positionsAllowed: ['left', 'right'],
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentPosition).toEqual('left');

                recalculateOverlay({
                    positionsAllowed: ['right'],
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentPosition).toEqual('right');

                recalculateOverlay({
                    positionsAllowed: ['bottom', 'top'],
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentPosition).toEqual('bottom');
            }));

            describe('Should check positions for "opposite"', () => {
                it('should have "allowedOpposite" properly defined', fakeAsync(() => {
                    expect(component['allowedOpposite']).toBe(undefined);

                    component.setBaseConfig({ positionsAllowed: 'left' });
                    expect(component['allowedOpposite']).toBe(false);

                    component.setBaseConfig({ positionsAllowed: 'opposite' });
                    expect(component['allowedOpposite']).toBe(true);

                    component.setBaseConfig({ positionsAllowed: 'bottom' });
                    expect(component['allowedOpposite']).toBe(false);

                    component.setBaseConfig({ positionsAllowed: 'OPPOSITE' });
                    expect(component['allowedOpposite']).toBe(true);
                }));

                it('should save the right allowed positions when "opposite" is set from the beginning', fakeAsync(() => {
                    component.setBaseConfig({ positionsAllowed: 'opposite' });
                    expect(component['desiredPosition']).toEqual('top');
                    expect(component['allowed'].positions).toEqual(['top', 'bottom']);

                    component.setBaseConfig({ position: 'right' });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(['right', 'left']);

                    component.setBaseConfig({ position: 'bottom' });
                    expect(component['desiredPosition']).toEqual('bottom');
                    expect(component['allowed'].positions).toEqual(['bottom', 'top']);

                    component.setBaseConfig({ position: 'left' });
                    expect(component['desiredPosition']).toEqual('left');
                    expect(component['allowed'].positions).toEqual(['left', 'right']);

                    component.setBaseConfig({ position: 'top' });
                    expect(component['desiredPosition']).toEqual('top');
                    expect(component['allowed'].positions).toEqual(['top', 'bottom']);
                }));

                it('should save the right allowed positions when "opposite" is set or reset at some point', fakeAsync(() => {
                    const defaultPositionsAllowed = OVERLAY_BASE_DEFAULTS.positionsAllowed as OverlayBasePosition[];

                    component.setBaseConfig({});
                    expect(component['desiredPosition']).toEqual('top');
                    expect(component['allowed'].positions).toEqual(defaultPositionsAllowed);

                    component.setBaseConfig({ position: 'right' });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(defaultPositionsAllowed);

                    component.setBaseConfig({ positionsAllowed: 'opposite' });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(['right', 'left']);

                    component.setBaseConfig({ positionsAllowed: 'auto' });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(defaultPositionsAllowed);

                    component.setBaseConfig({ positionsAllowed: 'opposite', position: 'bottom' });
                    expect(component['desiredPosition']).toEqual('bottom');
                    expect(component['allowed'].positions).toEqual(['bottom', 'top']);

                    component.setBaseConfig({ position: 'left' });
                    expect(component['desiredPosition']).toEqual('left');
                    expect(component['allowed'].positions).toEqual(['left', 'right']);

                    component.setBaseConfig({ positionsAllowed: 'top' });
                    expect(component['desiredPosition']).toEqual('top');
                    expect(component['allowed'].positions).toEqual(['top']);

                    component.setBaseConfig({ positionsAllowed: 'opposite' });
                    expect(component['desiredPosition']).toEqual('top');
                    expect(component['allowed'].positions).toEqual(['top', 'bottom']);

                    component.setBaseConfig({ position: 'right' });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(['right', 'left']);

                    component.setBaseConfig({ position: 'x' as unknown as OverlayBasePositionInput });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(['right', 'left']);

                    component.setBaseConfig({ positionsAllowed: 'x' as unknown as OverlayBasePositionsAllowed });
                    expect(component['desiredPosition']).toEqual('right');
                    expect(component['allowed'].positions).toEqual(defaultPositionsAllowed);
                }));
            });
        });

        describe('Should check the "alignmentOrder" property', () => {
            it('should set the default alignment order when the wrong value is sent', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: ['x'] as unknown as OverlayBaseAlignment[] });
                expect(component['allowed'].alignmentOrder).toEqual(OVERLAY_BASE_DEFAULTS.alignmentOrder);
            }));

            it('should set the default alignment order when an undefined value is sent', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: undefined });
                expect(component['allowed'].alignmentOrder).toEqual(OVERLAY_BASE_DEFAULTS.alignmentOrder);
            }));

            it('should set the alignment order to "center"', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: ['center'] });
                expect(component['allowed'].alignmentOrder).toEqual(['center']);
            }));

            it('should set the alignment order to "start" even when several values are sent', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: ['start', 'start', 'start'] });
                expect(component['allowed'].alignmentOrder).toEqual(['start']);
            }));

            it('should set the alignment order to "start"/"center"/"end"', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: ['start', 'center', 'end'] });
                expect(component['allowed'].alignmentOrder).toEqual(['start', 'center', 'end']);
            }));

            it('should set the alignment order to "end"/"start"/"center"', fakeAsync(() => {
                component.setBaseConfig({ alignmentOrder: ['end', 'start', 'center'] });
                expect(component['allowed'].alignmentOrder).toEqual(['end', 'start', 'center']);
            }));
        });

        describe('Should check the "alignmentsAllowed" property', () => {
            it('should open the overlay in the allowed alignment despite of the one desired', fakeAsync(() => {
                toggleOverlay({ alignmentsAllowed: ['start'], position: 'left-end' });
                expect(component.getCurrentAlignment).toEqual('start');

                recalculateOverlay({ alignmentsAllowed: 'edges', position: 'bottom-center' });
                expect(component.getCurrentAlignment).toEqual('start');

                recalculateOverlay({ alignmentsAllowed: 'end', position: 'right-start' });
                expect(component.getCurrentAlignment).toEqual('end');

                recalculateOverlay({ alignmentsAllowed: 'start, center', position: 'right-start' });
                expect(component.getCurrentAlignment).toEqual('start');

                recalculateOverlay({ alignmentsAllowed: ['center', 'end'], position: 'bottom-end' });
                expect(component.getCurrentAlignment).toEqual('end');
            }));

            it('should open the overlay in the first allowed alignment if a non-valid alignment value is passed', fakeAsync(() => {
                toggleOverlay({
                    alignmentsAllowed: ['end', 'center'],
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentAlignment).toEqual('end');

                recalculateOverlay({
                    alignmentsAllowed: ['end', 'start'],
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentAlignment).toEqual('end');

                recalculateOverlay({
                    alignmentsAllowed: 'center, start',
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentAlignment).toEqual('center');

                recalculateOverlay({
                    alignmentsAllowed: 'start',
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentAlignment).toEqual('start');

                recalculateOverlay({
                    alignmentsAllowed: 'edges',
                    position: 'x' as unknown as OverlayBasePositionInput,
                });
                expect(component.getCurrentAlignment).toEqual('start');
            }));

            it('should save the right allowed alignments', fakeAsync(() => {
                const defaultAlignmentsAllowed = OVERLAY_BASE_DEFAULTS.alignmentsAllowed as OverlayBaseAlignment[];

                component.setBaseConfig({});
                expect(component['desiredAlignment']).toEqual('center');
                expect(component['allowed'].alignments).toEqual(defaultAlignmentsAllowed);

                component.setBaseConfig({ position: 'top-start' });
                expect(component['desiredAlignment']).toEqual('start');
                expect(component['allowed'].alignments).toEqual(defaultAlignmentsAllowed);

                component.setBaseConfig({ alignmentsAllowed: 'end' });
                expect(component['desiredAlignment']).toEqual('end');
                expect(component['allowed'].alignments).toEqual(['end']);

                component.setBaseConfig({ alignmentsAllowed: 'auto' });
                expect(component['desiredAlignment']).toEqual('end');
                expect(component['allowed'].alignments).toEqual(defaultAlignmentsAllowed);

                component.setBaseConfig({ alignmentsAllowed: 'end,start', position: 'bottom-start' });
                expect(component['desiredAlignment']).toEqual('start');
                expect(component['allowed'].alignments).toEqual(['end', 'start']);

                component.setBaseConfig({ position: 'left' });
                expect(component['desiredAlignment']).toEqual('start'); // last known accepted alignment
                expect(component['allowed'].alignments).toEqual(['end', 'start']);

                // This will be ignored since "center" only works when "fluidAlignment=true"
                component.setBaseConfig({ alignmentsAllowed: 'center' });
                expect(component['desiredAlignment']).toEqual('start'); // last known accepted alignment
                expect(component['allowed'].alignments).toEqual(['center', 'start', 'end']);

                component.setBaseConfig({ alignmentsAllowed: 'center', fluidAlignment: true });
                expect(component['desiredAlignment']).toEqual('center');
                expect(component['allowed'].alignments).toEqual(['center']);

                component.setBaseConfig({ alignmentsAllowed: ['end', 'center'] });
                expect(component['desiredAlignment']).toEqual('center');
                expect(component['allowed'].alignments).toEqual(['end', 'center']);

                component.setBaseConfig({ position: 'right-end' });
                expect(component['desiredAlignment']).toEqual('end');
                expect(component['allowed'].alignments).toEqual(['end', 'center']);

                component.setBaseConfig({ position: 'x' as unknown as OverlayBasePositionInput });
                expect(component['desiredAlignment']).toEqual('end');
                expect(component['allowed'].alignments).toEqual(['end', 'center']);

                component.setBaseConfig({ alignmentsAllowed: 'x' as unknown as OverlayBaseAlignmentsAllowed });
                expect(component['desiredAlignment']).toEqual('end');
                expect(component['allowed'].alignments).toEqual(defaultAlignmentsAllowed);
            }));
        });

        it('should check the "fluidAlignment" property', () => {
            expect(component.fluidAlignment).toBe(false);

            component.setBaseConfig({ fluidAlignment: true });
            expect(component.fluidAlignment).toEqual(true);

            component.setBaseConfig({ fluidAlignment: 'x' as unknown as boolean });
            expect(component.fluidAlignment).toEqual(false);

            component.setBaseConfig({ fluidAlignment: '  true' as unknown as boolean });
            expect(component.fluidAlignment).toEqual(true);

            component.setBaseConfig({ fluidAlignment: undefined });
            expect(component.fluidAlignment).toEqual(false);
        });

        it('should check the "fluidSize" property', () => {
            expect(component.fluidSize).toBe(true);

            component.setBaseConfig({ fluidSize: false });
            expect(component.fluidSize).toEqual(false);

            component.setBaseConfig({ fluidSize: 'x' as unknown as boolean });
            expect(component.fluidSize).toEqual(true);

            component.setBaseConfig({ fluidSize: ' false ' as unknown as boolean });
            expect(component.fluidSize).toEqual(false);

            component.setBaseConfig({ fluidSize: undefined });
            expect(component.fluidSize).toEqual(true);
        });

        it('should check the "allowScrollListener" property', () => {
            expect(component['allowScrollListener']).toBe(true);

            component.setBaseConfig({ allowScrollListener: false });
            expect(component['allowScrollListener']).toEqual(false);

            component.setBaseConfig({ allowScrollListener: 'x' as unknown as boolean });
            expect(component['allowScrollListener']).toEqual(true);

            component.setBaseConfig({ allowScrollListener: 'false  ' as unknown as boolean });
            expect(component['allowScrollListener']).toEqual(false);

            component.setBaseConfig({ allowScrollListener: undefined });
            expect(component['allowScrollListener']).toEqual(true);
        });

        it('should check the "positionStrategy" property', fakeAsync(() => {
            expect(component.positionStrategy).toEqual('fixed');

            component.setBaseConfig({ positionStrategy: 'absolute' });
            expect(component.positionStrategy).toEqual('absolute');

            component.setBaseConfig({ positionStrategy: 'x' as OverlayBasePositionStrategy });
            expect(component.positionStrategy).toEqual('fixed');

            component.setBaseConfig({ positionStrategy: undefined });
            expect(component.positionStrategy).toEqual('fixed');

            component.setBaseConfig({ positionStrategy: 'ABSOLUTE' as OverlayBasePositionStrategy });
            expect(component.positionStrategy).toEqual('absolute');

            component.setBaseConfig({ positionStrategy: 'FIXED' as OverlayBasePositionStrategy });
            expect(component.positionStrategy).toEqual('fixed');
        }));

        describe('Check the "boundary" property', () => {
            it('should assign the right boundary element when using a string selector', fakeAsync(() => {
                toggleOverlay({ boundary: 'div.safe-space' });
                expect(component.overlayConfig.boundary).toHaveClass('safe-space');
            }));

            it('should keep the default boundary element when using an unexisting string selector', fakeAsync(() => {
                toggleOverlay({ boundary: '.non-existing-selector' });
                expect(component.boundaryElement).toEqual(document.body);
            }));
        });
    });

    describe('Should check the "absolute" position strategy', () => {
        let trigger: HTMLButtonElement;
        let triggerRect: DOMRect;

        const setTriggerPosition = (left?: number, top?: number): void => {
            trigger = component.trigger.nativeElement;

            trigger.style.position = 'absolute';
            trigger.style.transform = 'initial';

            trigger.style.top = `${top ?? 200}px`;
            trigger.style.left = `${left ?? 200}px`;
        };

        const getTriggerRect = (): void => {
            triggerRect = trigger.getBoundingClientRect();
        };

        beforeEach(() => {
            component.generateScroll = true;
            component.selectOverlay = 4;

            component.setBaseConfig({ positionStrategy: 'absolute' });
        });

        it('should open the overlay at the right distance for "top" position and reposition to "bottom" when scroll', fakeAsync(() => {
            setTriggerPosition();
            toggleOverlay();
            getOverlayRect();
            getTriggerRect();

            expect(component.getCurrentPosition).toEqual('top');
            expect(component.getCurrentAlignment).toEqual('center');
            expect(Math.round(overlayRect.top)).toEqual(
                Math.round(triggerRect.top - overlayRect.height - component.offsetSize)
            );

            const scrollTop: number = 100;

            scrollTo(0, scrollTop);
            getOverlayRect();

            expect(component.getCurrentPosition).toEqual('bottom');
            expect(component.getCurrentAlignment).toEqual('center');
            expect(Math.round(overlayRect.top)).toEqual(
                Math.round(triggerRect.top + triggerRect.height + component.offsetSize - scrollTop)
            );
        }));

        it('should open the overlay at the right distance for "left" position and reposition to "right" when scroll', fakeAsync(() => {
            setTriggerPosition();
            toggleOverlay({ position: 'left' });
            getOverlayRect();
            getTriggerRect();

            expect(component.getCurrentPosition).toEqual('left');
            expect(component.getCurrentAlignment).toEqual('center');
            expect(Math.round(overlayRect.left)).toEqual(
                Math.round(triggerRect.left - overlayRect.width - component.offsetSize)
            );

            const scrollLeft: number = 100;

            scrollTo(scrollLeft, 0);
            getOverlayRect();

            expect(component.getCurrentPosition).toEqual('right');
            expect(component.getCurrentAlignment).toEqual('center');
            expect(Math.round(overlayRect.left)).toEqual(
                Math.round(triggerRect.left + triggerRect.width + component.offsetSize - scrollLeft)
            );
        }));

        it('should stick the overlay to the top of the screen when "fluidAlignment" is set to true and scrolling a bit down', fakeAsync(() => {
            setTriggerPosition(undefined, 200);
            toggleOverlay({ position: 'right', fluidAlignment: true });

            scrollTo(0, 200);
            getOverlayRect();

            expect(overlayRect.top).toEqual(0);
        }));
    });

    describe('Should check the "viewportSizeSafe"', () => {
        const customBoundaryPosition: number = 0.25; // 25% (set in the styles)
        let top: number;
        let bottom: number;
        let left: number;
        let right: number;

        beforeEach(() => {
            component.generateScroll = true;
            top = 20;
            bottom = 50;
            left = 10;
            right = 75;
        });

        it('should have "width" and "height" with the same values as the viewport (default)', fakeAsync(() => {
            toggleOverlay();
            expect(component.viewportSizeSafe).toEqual({
                width: component.viewportSize.width,
                height: component.viewportSize.height,
            });
        }));

        it('should have "width" and "height" with the proper values when a custom boundary is established', fakeAsync(() => {
            component.selectBoundary = 1;
            toggleOverlay({ boundary: component.boundary });

            const verticalScroll: number = component['boundaryScrollSize'].vertical;
            const horizontalScroll: number = component['boundaryScrollSize'].horizontal;

            expect(component.viewportSizeSafe).toEqual({
                width: component.viewportSize.width * (customBoundaryPosition * 2) - verticalScroll,
                height: component.viewportSize.height * (customBoundaryPosition * 2) - horizontalScroll,
            });
        }));

        it('should have "width" and "height" with the proper values when a custom safe space is established', fakeAsync(() => {
            toggleOverlay({ safeSpace: { top, bottom, left, right } });

            expect(component.viewportSizeSafe).toEqual({
                width: component.viewportSize.width - left - right,
                height: component.viewportSize.height - top - bottom,
            });
        }));

        it('should have "width" and "height" with the proper values when a custom boundary and safe space (lower than boundary) are established', fakeAsync(() => {
            component.selectBoundary = 1;
            toggleOverlay({ boundary: component.boundary, safeSpace: { top, bottom, left, right } });

            const verticalScroll: number = component['boundaryScrollSize'].vertical;
            const horizontalScroll: number = component['boundaryScrollSize'].horizontal;

            expect(component.viewportSizeSafe).toEqual({
                width: component.viewportSize.width * (customBoundaryPosition * 2) - verticalScroll,
                height: component.viewportSize.height * (customBoundaryPosition * 2) - horizontalScroll,
            });
        }));

        it('should have "width" and "height" with the proper values when a custom boundary and safe space (bigger than boundary) are established', fakeAsync(() => {
            component.selectBoundary = 1;
            toggleOverlay({ boundary: component.boundary, safeSpace: { top, bottom, left, right } });

            top += component.viewportSize.height * customBoundaryPosition;
            bottom += component.viewportSize.height * customBoundaryPosition;
            left += component.viewportSize.width * customBoundaryPosition;
            right += component.viewportSize.width * customBoundaryPosition;

            recalculateOverlay({ safeSpace: { top, bottom, left, right } });

            expect(component.viewportSizeSafe).toEqual({
                width: component.viewportSize.width - left - right,
                height: component.viewportSize.height - top - bottom,
            });
        }));
    });

    describe('Should check the "overlayOutside', () => {
        beforeEach(() => {
            component.setBaseConfig({ fluidAlignment: true, positionsAllowed: 'opposite' });
            component.generateScroll = true;
            component.selectOverlay = 2;
        });

        afterEach(() => {
            window.scrollTo(0, 0);
            component.trigger.nativeElement.style.left = null;
            component.trigger.nativeElement.style.top = null;
        });

        it('should have the right value on scroll left', fakeAsync(() => {
            component.trigger.nativeElement.style.left = `100%`;

            toggleOverlay({ position: 'bottom' });
            expect(component.overlayOutside).toEqual('right');

            scrollTo(component.viewportSize.width / 2, 0);
            expect(component.overlayOutside).toEqual(undefined);

            scrollTo(component.viewportSize.width, 0);
            expect(component.overlayOutside).toEqual('left');
        }));

        it('should have the right value on scroll down', fakeAsync(() => {
            component.trigger.nativeElement.style.left = `100%`;
            component.trigger.nativeElement.style.top = `100%`;

            toggleOverlay({ position: 'left' });
            expect(component.overlayOutside).toEqual('bottom');

            scrollTo(0, component.viewportSize.height / 2);
            expect(component.overlayOutside).toEqual(undefined);

            scrollTo(0, component.viewportSize.height);
            expect(component.overlayOutside).toEqual('top');
        }));
    });

    describe('Should check when the overlay is bigger than trigger', () => {
        describe('Should reposition correctly on scroll', () => {
            beforeEach(() => {
                component.generateScroll = true;
                component.selectOverlay = 2;
            });

            afterEach(() => {
                window.scrollTo(0, 0);
                component.trigger.nativeElement.style.left = null;
                component.trigger.nativeElement.style.top = null;
            });

            describe('Should check positions TOP and BOTTOM', () => {
                it('should open at TOP (default) and reposition to BOTTOM on scroll down', fakeAsync(() => {
                    toggleOverlay();
                    expect(component.getCurrentPosition).toEqual('top');

                    scrollTo(0, getOverlayRect().top + 10);
                    expect(component.getCurrentPosition).toEqual('bottom');
                }));

                it('should open at TOP and reposition to BOTTOM (default) on scroll down', fakeAsync(() => {
                    component.trigger.nativeElement.style.top = '75%';
                    toggleOverlay({ position: 'bottom' });
                    expect(component.getCurrentPosition).toEqual('top');

                    scrollTo(0, getOverlayRect().top);
                    expect(component.getCurrentPosition).toEqual('bottom');
                }));

                describe('Should have the right alignment on scrolling left', () => {
                    beforeEach(() => (component.trigger.nativeElement.style.left = '75%'));

                    it('should realign with no restrictions on scroll left', fakeAsync(() => {
                        toggleOverlay();
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth() * 0.1, 0);
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth() * 0.6, 0);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should realign only to EDGES on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'edges' });
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth() * 0.1, 0);
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() * 0.6, 0);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should be aligned only to START on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'start' });
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() * 0.1, 0);
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() * 0.6, 0);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should be aligned only to END on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'end' });
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth() * 0.1, 0);
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth() * 0.6, 0);
                        expect(component.getCurrentAlignment).toBe('end');
                    }));

                    it('should be aligned only to CENTER on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'center', fluidAlignment: true });
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth() * 0.1, 0);
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth() * 0.6, 0);
                        expect(component.getCurrentAlignment).toBe('center');
                    }));
                });
            });

            describe('Should check positions LEFT and RIGHT', () => {
                beforeEach(() => (component.overlay.style.height = '90vh'));

                it('should open at LEFT (default) and reposition to RIGHT on scroll down', fakeAsync(() => {
                    component.trigger.nativeElement.style.left = '75%';
                    toggleOverlay();
                    expect(component.getCurrentPosition).toEqual('left');

                    scrollTo(documentWidth() * 0.6, 0);
                    expect(component.getCurrentPosition).toEqual('right');
                }));

                it('should open at LEFT and reposition to RIGHT (default) on scroll down', fakeAsync(() => {
                    component.trigger.nativeElement.style.left = '75%';
                    toggleOverlay({ position: 'right' });
                    expect(component.getCurrentPosition).toEqual('left');

                    scrollTo(documentWidth() * 0.6, 0);
                    expect(component.getCurrentPosition).toEqual('right');
                }));

                describe('Should have the right alignment on scrolling down', () => {
                    beforeEach(() => {
                        component.overlay.style.height = null;
                        component.overlay.style.width = '80vw';
                        component.trigger.nativeElement.style.left = '95%';
                        component.trigger.nativeElement.style.top = '95%';
                    });

                    it('should realign with no restrictions on scroll down', fakeAsync(() => {
                        toggleOverlay({ position: 'right' });
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(0, documentHeight() / 2);
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(0, documentHeight() - 100);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should realign only to EDGES on scroll down', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'edges', position: 'right' });
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(0, documentHeight() / 2);
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(0, documentHeight() - 100);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should be aligned only to START on scroll down', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'start', position: 'right' });
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(0, documentHeight() / 2);
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(0, documentHeight() - 100);
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should be aligned only to END on scroll down', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'end', position: 'right' });
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(0, documentHeight() / 2);
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(0, documentHeight() - 100);
                        expect(component.getCurrentAlignment).toBe('end');
                    }));

                    it('should be aligned only to CENTER on scroll down', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'center', position: 'right', fluidAlignment: true });
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(0, documentHeight() / 2);
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(0, documentHeight() - 100);
                        expect(component.getCurrentAlignment).toBe('center');
                    }));
                });
            });
        });
    });

    describe('Should check when the overlay is smaller than trigger', () => {
        describe('Should reposition correctly on scroll', () => {
            beforeEach(() => {
                component.generateScroll = true;
                component.selectOverlay = 3;
                component.trigger.nativeElement.style.width = '100px';
                component.trigger.nativeElement.style.height = '100px';
            });

            afterEach(() => {
                window.scrollTo(0, 0);
                component.trigger.nativeElement.style.left = null;
                component.trigger.nativeElement.style.top = null;
            });

            describe('Should check positions TOP and BOTTOM', () => {
                it('should open at TOP (default) and reposition to BOTTOM on scroll down', fakeAsync(() => {
                    toggleOverlay();
                    expect(component.getCurrentPosition).toEqual('top');

                    scrollTo(0, getOverlayRect().top + 10);
                    expect(component.getCurrentPosition).toEqual('bottom');
                }));

                it('should open at TOP and reposition to BOTTOM (default) on scroll down', fakeAsync(() => {
                    component.trigger.nativeElement.style.top = '95%';
                    toggleOverlay({ position: 'bottom' });
                    expect(component.getCurrentPosition).toEqual('top');

                    scrollTo(0, getOverlayRect().top);
                    expect(component.getCurrentPosition).toEqual('bottom');
                }));

                describe('Should have the right alignment on scrolling left', () => {
                    beforeEach(() => (component.trigger.nativeElement.style.left = `${documentWidth()}px`));

                    it('should realign with no restrictions on scroll left', fakeAsync(() => {
                        toggleOverlay();
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth(), 0);
                        expect(component.getCurrentAlignment).toBe('end');
                    }));

                    it('should realign only to EDGES on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'edges' });
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth(), 0);
                        expect(component.getCurrentAlignment).toBe('end');
                    }));

                    it('should be aligned only to START on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'start' });
                        expect(component.getCurrentPosition).toEqual('top');
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentPosition).toEqual('top');
                        expect(component.getCurrentAlignment).toBe('start');

                        scrollTo(documentWidth(), 0);
                        expect(component.getCurrentPosition).toEqual('right');
                        expect(component.getCurrentAlignment).toBe('start');
                    }));

                    it('should be aligned only to END on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'end' });
                        expect(component.getCurrentPosition).toEqual('left');
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentPosition).toEqual('top');
                        expect(component.getCurrentAlignment).toBe('end');

                        scrollTo(documentWidth(), 0);
                        expect(component.getCurrentPosition).toEqual('top');
                        expect(component.getCurrentAlignment).toBe('end');
                    }));

                    it('should be aligned only to CENTER on scroll left', fakeAsync(() => {
                        toggleOverlay({ alignmentsAllowed: 'center', fluidAlignment: true });
                        expect(component.getCurrentPosition).toEqual('left');
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentPosition).toEqual('top');
                        expect(component.getCurrentAlignment).toBe('center');

                        scrollTo(documentWidth(), 0);
                        expect(component.getCurrentPosition).toEqual('right');
                        expect(component.getCurrentAlignment).toBe('center');
                    }));
                });

                describe('Should check positions LEFT and RIGHT', () => {
                    beforeEach(() => (component.trigger.nativeElement.style.left = `${documentWidth() + 40}px`));

                    it('should open at LEFT (default) and reposition to RIGHT on scroll down', fakeAsync(() => {
                        toggleOverlay();
                        expect(component.getCurrentPosition).toEqual('left');

                        scrollTo(documentWidth() + 70, 0);
                        expect(component.getCurrentPosition).toEqual('right');
                    }));

                    it('should open at LEFT and reposition to RIGHT (default) on scroll down', fakeAsync(() => {
                        toggleOverlay({ position: 'right' });
                        expect(component.getCurrentPosition).toEqual('left');

                        scrollTo(documentWidth() / 2, 0);
                        expect(component.getCurrentPosition).toEqual('right');
                    }));

                    describe('Should have the right alignment on scrolling down', () => {
                        beforeEach(() => (component.trigger.nativeElement.style.top = `${documentHeight()}px`));

                        it('should realign with no restrictions on scroll down', fakeAsync(() => {
                            toggleOverlay({ position: 'right' });
                            expect(component.getCurrentAlignment).toBe('start');

                            scrollTo(0, documentHeight() / 2);
                            expect(component.getCurrentAlignment).toBe('center');

                            scrollTo(0, documentHeight());
                            expect(component.getCurrentAlignment).toBe('end');
                        }));

                        it('should realign only to EDGES on scroll down', fakeAsync(() => {
                            toggleOverlay({ alignmentsAllowed: 'edges', position: 'right' });
                            expect(component.getCurrentAlignment).toBe('start');

                            scrollTo(0, documentHeight() / 2);
                            expect(component.getCurrentAlignment).toBe('start');

                            scrollTo(0, documentHeight());
                            expect(component.getCurrentAlignment).toBe('end');
                        }));

                        it('should be aligned only to START on scroll down', fakeAsync(() => {
                            toggleOverlay({ alignmentsAllowed: 'start', position: 'right' });
                            expect(component.getCurrentAlignment).toBe('start');

                            scrollTo(0, documentHeight() / 2);
                            expect(component.getCurrentAlignment).toBe('start');

                            scrollTo(0, documentHeight());
                            expect(component.getCurrentAlignment).toBe('start');
                        }));

                        it('should be aligned only to END on scroll down', fakeAsync(() => {
                            toggleOverlay({ alignmentsAllowed: 'end', position: 'right' });
                            expect(component.getCurrentAlignment).toBe('end');

                            scrollTo(0, documentHeight() / 2);
                            expect(component.getCurrentAlignment).toBe('end');

                            scrollTo(0, documentHeight());
                            expect(component.getCurrentAlignment).toBe('end');
                        }));

                        it('should be aligned only to CENTER on scroll down', fakeAsync(() => {
                            toggleOverlay({ alignmentsAllowed: 'center', position: 'right', fluidAlignment: true });
                            expect(component.getCurrentAlignment).toBe('center');

                            scrollTo(0, documentHeight() / 2);
                            expect(component.getCurrentAlignment).toBe('center');

                            scrollTo(0, documentHeight());
                            expect(component.getCurrentAlignment).toBe('center');
                        }));
                    });
                });
            });
        });
    });

    describe('Should check the overlay inside a custom boundary', () => {
        it('should verify the boundary element is set to <body> when an undefined value is sent', fakeAsync(() => {
            toggleOverlay({ boundary: undefined });
            expect(component.boundaryElement).toEqual(document.body);
        }));

        describe('Should check without safe space', () => {
            beforeEach(() => {
                component.selectBoundary = 1;
                component.setBaseConfig({ boundary: component.boundary });
            });

            it('should verify the boundary element has been properly defined', fakeAsync(() => {
                toggleOverlay();
                expect(component.boundaryElement).toEqual(component.boundary);
            }));

            describe('should check "boundaryScroll$" Subject', () => {
                it('should verify "boundaryScroll$" is called when the boundary element gets scrolled', fakeAsync(() => {
                    const spyOnBoundaryScroll = spyOn(component['boundaryScroll$'], 'next');
                    expect(component['boundaryScroll$']).not.toBe(undefined);

                    toggleOverlay();
                    expect(spyOnBoundaryScroll).not.toHaveBeenCalled();

                    scrollBoundaryTo(0, 1);
                    expect(spyOnBoundaryScroll).toHaveBeenCalledWith();
                }));

                it('should verify "boundaryScroll$" is not called when the boundary element was not defined but gets scrolled', fakeAsync(() => {
                    const spyOnBoundaryScroll = spyOn(component['boundaryScroll$'], 'next');
                    expect(component['boundaryScroll$']).not.toBe(undefined);

                    toggleOverlay({ boundary: document.body });
                    scrollBoundaryTo(0, 1);
                    expect(spyOnBoundaryScroll).not.toHaveBeenCalledWith();
                }));
            });

            describe('Should check the "boundaryScrollSize"', () => {
                it('should have "vertical" and "horizontal" set to zero by default (<body> as a boundary)', fakeAsync(() => {
                    toggleOverlay({ boundary: document.body });
                    expect(component['boundaryScrollSize']).toEqual({ vertical: 0, horizontal: 0 });
                }));

                it('should have "vertical" and "horizontal" properly set (custom boundary)', fakeAsync(() => {
                    toggleOverlay();

                    const vertical: number = component.boundary.offsetWidth - component.boundary.clientWidth;
                    const horizontal: number = component.boundary.offsetHeight - component.boundary.clientHeight;
                    expect(component['boundaryScrollSize']).toEqual({ vertical, horizontal });
                }));
            });
        });

        describe('Should check with safe space', () => {
            beforeEach(() => {
                component.trigger.nativeElement.style.left = null;
                component.trigger.nativeElement.style.transform = 'translate(0, -50%)';
                component.generateScroll = true;
                component.selectBoundary = 2;
                component.setBaseConfig({ boundary: component.boundary });
                fixture.detectChanges();
            });

            afterEach(() => {
                component.trigger.nativeElement.style.transform = null;
            });

            describe('Should check on scroll left', () => {
                let triggerRect: DOMRect;
                const positions: OverlayBasePosition[] = ['top', 'bottom'];

                beforeEach(() => (triggerRect = component.trigger.nativeElement.getBoundingClientRect()));

                positions.forEach((pos) => {
                    it('should check the overlay with safe space left', fakeAsync(() => {
                        const safeSpaceLeft: number = 100;
                        const safeSpaceTop: number =
                            pos === 'top' ? 0 : triggerRect.top - OVERLAY_BASE_DEFAULTS.offsetSize - overlayHeight + 20;

                        component.trigger.nativeElement.style.left = `calc(100% - ${triggerWidth}px - 10px)`;
                        toggleOverlay({ safeSpace: { left: safeSpaceLeft, top: safeSpaceTop } });

                        expect(component.getCurrentPosition).toEqual(pos);
                        expect(component.getCurrentAlignment).toEqual('end');

                        getOverlayRect();
                        scrollBoundaryTo(component.triggerRect.left / 2 - triggerWidth / 2, 0);
                        expect(component.getCurrentAlignment).toEqual('center');

                        getOverlayRect();
                        scrollBoundaryTo(
                            component.boundary.scrollLeft + component.triggerRect.left - (safeSpaceLeft + 10),
                            0
                        );
                        expect(component.getCurrentAlignment).toEqual('start');

                        scrollTo(safeSpaceLeft, 0);
                        scrollBoundaryTo(0, 0);
                        getOverlayRect();
                        scrollBoundaryTo(overlayRect.left - (overlayRect.width - triggerWidth), 0);
                        expect(component.getCurrentAlignment).toEqual('center');

                        getOverlayRect();
                        scrollTo(window.document.documentElement.scrollLeft + overlayRect.left - triggerWidth, 0);
                        expect(component.getCurrentAlignment).toEqual('start');
                    }));
                });

                positions.forEach((pos) => {
                    it('should check the overlay with safe space right', fakeAsync(() => {
                        const safeSpaceRight: number = 200;
                        const safeSpaceTop: number =
                            pos === 'top' ? 0 : triggerRect.top - OVERLAY_BASE_DEFAULTS.offsetSize - overlayHeight + 20;

                        component.trigger.nativeElement.style.left = `calc(100% - ${triggerWidth}px - 10px)`;
                        toggleOverlay({ safeSpace: { right: safeSpaceRight, top: safeSpaceTop } });

                        expect(component.getCurrentPosition).toEqual('left');
                        expect(component.getCurrentAlignment).toEqual('center');

                        scrollBoundaryTo(safeSpaceRight - triggerWidth / 2, 0);
                        expect(component.getCurrentPosition).toEqual(pos);
                        expect(component.getCurrentAlignment).toEqual('end');

                        getOverlayRect();
                        scrollBoundaryTo(component.boundary.scrollLeft + component.triggerRect.left / 2, 0);
                        expect(component.getCurrentAlignment).toEqual('center');

                        getOverlayRect();
                        scrollBoundaryTo(component.boundary.scrollLeft + component.triggerRect.left - 50 - 10, 0);
                        expect(component.getCurrentAlignment).toEqual('start');

                        scrollBoundaryTo(component.boundary.scrollLeft + 20, 0);
                        expect(component.getCurrentPosition).toEqual('right');
                        expect(component.getCurrentAlignment).toEqual('center');

                        scrollBoundaryTo(safeSpaceRight - triggerWidth / 2, 0);
                        expect(component.getCurrentPosition).toEqual(pos);
                        expect(component.getCurrentAlignment).toEqual('end');

                        scrollTo(50, 0);
                        expect(component.getCurrentAlignment).toEqual('center');

                        getOverlayRect();
                        scrollTo(window.document.documentElement.scrollLeft + overlayRect.left + 10, 0);
                        expect(component.getCurrentAlignment).toEqual('start');
                    }));
                });
            });
        });
    });

    describe('Should check the overlay when a DOMRect is passed as a trigger', () => {
        const defaultOffset: number = OVERLAY_BASE_DEFAULTS.offsetSize;

        it('should have the "triggerElement" not defined and "virtualTriggerRect" defined with the DOMRect', fakeAsync(() => {
            const trigger: DOMRect = new DOMRect(10, 10, 0, 0);
            toggleOverlay({ trigger });
            expect(component.triggerElement).toBe(undefined);
            expect(component.virtualTriggerRect).toEqual(trigger);
        }));

        it('should open the overlay to the BOTTOM', fakeAsync(() => {
            toggleOverlay({ trigger: new DOMRect(10, 10, 0, 0) });

            const overlayRect = getOverlayRect();
            expect(component.getCurrentPosition).toEqual('bottom');
            expect(overlayRect.x).toEqual(10);
            expect(overlayRect.y).toEqual(10 + defaultOffset);
        }));

        it('should open the overlay to the TOP', fakeAsync(() => {
            toggleOverlay({ trigger: new DOMRect(10, overlayHeight + 10, 0, 0) });

            const overlayRect = getOverlayRect();
            expect(component.getCurrentPosition).toEqual('top');
            expect(overlayRect.x).toEqual(10);
            expect(overlayRect.y).toEqual(defaultOffset);
        }));

        it('should open the overlay to the RIGHT', fakeAsync(() => {
            toggleOverlay({ trigger: new DOMRect(10, 10, 0, 0), position: 'left', positionsAllowed: 'opposite' });

            const overlayRect = getOverlayRect();
            expect(component.getCurrentPosition).toEqual('right');
            expect(overlayRect.x).toEqual(10 + defaultOffset);
            expect(overlayRect.y).toEqual(10);
        }));

        it('should open the overlay to the LEFT', fakeAsync(() => {
            toggleOverlay({ trigger: new DOMRect(overlayWidth + 10, 10, 0, 0), position: 'left' });

            const overlayRect = getOverlayRect();
            expect(component.getCurrentPosition).toEqual('left');
            expect(overlayRect.x).toEqual(defaultOffset);
            expect(overlayRect.y).toEqual(10);
        }));
    });

    describe('Should check the "maxSize"', () => {
        const getTriggerBoundaryDistance = (position: OverlayBasePosition): number =>
            component.triggerBoundaryDistance(position) - OVERLAY_BASE_DEFAULTS.offsetSize;

        it('should have "width" and "height" set to null by default if "fluidSize" is set to false', fakeAsync(() => {
            toggleOverlay({ fluidSize: false });
            expect(component['getMaxSize']).toBe(undefined);
        }));

        it('should have "width" and "height" properly set if "maxSize" was not established', fakeAsync(() => {
            toggleOverlay();

            const { width: viewPortWidth, height: viewportHeight } = component.viewportSizeSafe;

            expect(component['getMaxSize']).toEqual({
                width: viewPortWidth,
                height: getTriggerBoundaryDistance('top'),
            });

            recalculateOverlay({ position: 'right' });
            expect(component['getMaxSize']).toEqual({
                width: getTriggerBoundaryDistance('right'),
                height: viewportHeight,
            });

            recalculateOverlay({ position: 'bottom' });
            expect(component['getMaxSize']).toEqual({
                width: viewPortWidth,
                height: getTriggerBoundaryDistance('bottom'),
            });

            recalculateOverlay({ position: 'left' });
            expect(component['getMaxSize']).toEqual({
                width: getTriggerBoundaryDistance('left'),
                height: viewportHeight,
            });
        }));

        it('should have "width" and "height" properly set if "maxSize" values were established', fakeAsync(() => {
            component.maxSize.width = 75;
            component.maxSize.height = 50;

            toggleOverlay();
            expect(component['getMaxSize']).toEqual({ width: 75, height: 50 });

            recalculateOverlay({ position: 'right' });
            expect(component['getMaxSize']).toEqual({ width: 75, height: 50 });

            recalculateOverlay({ position: 'bottom' });
            expect(component['getMaxSize']).toEqual({ width: 75, height: 50 });

            recalculateOverlay({ position: 'left' });
            expect(component['getMaxSize']).toEqual({ width: 75, height: 50 });
        }));
    });
});
