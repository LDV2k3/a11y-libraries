import { Subject, BehaviorSubject, Observable, from } from 'rxjs';
import { debounceTime, mergeAll, map } from 'rxjs/operators';

import {
    OverlayBasePositionX,
    OverlayBasePositionY,
    OverlayBaseRenderPosition,
    OverlayBaseAllowed,
    OverlayBaseSquareAreas,
    BoundaryData,
    ViewportSize,
    ScrollSize,
} from './overlay-base.type.private';

import {
    OVERLAY_BASE_DEFAULTS as DEFAULTS,
    POSITION,
    ALIGNMENT,
    POSITION_STRATEGY,
    OverlayBaseConfig,
    OverlayBasePosition,
    OverlayBasePositionInput,
    OverlayBasePositionsAllowed,
    OverlayBaseAlignment,
    OverlayBaseAlignmentsAllowed,
    OverlayBasePositionStrategy,
    OverlayBaseCalculatedPosition,
    OverlayBaseSafeSpace,
    OverlayBaseMaxSize,
} from './overlay-base.type';

import { ERROR_NO_TRIGGER_PROVIDED } from './overlay-base.errors';

let uid: number = 0;

export abstract class OverlayBase {
    readonly uid: number = uid++;
    readonly overlayConfig: OverlayBaseConfig = {};

    private overlayMainElement!: HTMLElement;

    triggerRect!: DOMRect;
    virtualTriggerRect!: DOMRect;
    overlayRect!: DOMRect;
    overlayOriginalRect!: DOMRect;
    boundaryRect!: DOMRect;

    isDetached$!: Subject<void>;
    private isAttached: boolean = false;
    private forceUpdate$!: BehaviorSubject<void | undefined>;

    private resize$: Subject<void> = new Subject<void>();
    private resizeFn = (): void => this.resize$.next();

    private scroll$: Subject<void> = new Subject<void>();
    private scrollFn = (): void => this.scroll$.next();

    private boundaryScroll$: Subject<void> = new Subject<void>();
    private boundaryScrollFn = (): void => this.boundaryScroll$.next();

    /**
     * @description
     * Allowed Positions & Alignments provided by the user.
     */
    private allowed: OverlayBaseAllowed = {
        positions: DEFAULTS.positionsAllowed as OverlayBasePosition[],
        alignments: DEFAULTS.alignmentsAllowed as OverlayBaseAlignment[],
    };
    private allowedOpposite!: boolean;

    /**
     * @description
     * An array of the listeners (for repositioning purposes).
     */
    private listeners: Subject<void>[] = [];

    /**
     * @description
     * To allow listening on page scrolling for repositioning.
     */
    private allowScrollListener: boolean = true;

    /**
     * @description
     * Max `width` & `height` values allowed for the Overlay to perform
     * proper calculations in case `fluidSize` is active.
     */
    readonly maxSize: OverlayBaseMaxSize = {
        width: null,
        height: null,
    };

    /**
     * @description
     * Scrollbar size (`vertical` & `horizontal`) for a given custom Boundary.
     */
    private boundaryScrollSize!: ScrollSize;

    /**
     * @description
     * The Viewport size (without the scrollbars into consideration).
     */
    get viewportSize(): ViewportSize {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
    }

    /**
     * @description
     * The Viewport safe size.
     * This will return width/height values taking into consideration a given custom Boundary and/or Safe Space.
     */
    get viewportSizeSafe(): ViewportSize {
        return this.viewportSafe;
    }
    private viewportSafe!: ViewportSize;

    /**
     * @description
     * The chosen Position by the calculations.
     */
    get getCurrentPosition(): OverlayBasePosition {
        return this.currentPosition;
    }
    private currentPosition!: OverlayBasePosition;
    private desiredPosition!: OverlayBasePosition;

    /**
     * @description
     * The chosen Alignment by the calculations.
     */
    get getCurrentAlignment(): OverlayBaseAlignment {
        return this.currentAlignment;
    }
    private currentAlignment!: OverlayBaseAlignment;
    private desiredAlignment!: OverlayBaseAlignment;

    /**
     * @description
     * This will provide the side of the Viewport/Boundary where the Overlay would be out of
     * in case `fluidAlignment` is active and the Overlay, by the chosen alignment, is out of the visible area.
     */
    overlayOutside: OverlayBasePosition | undefined = undefined;

    /**
     * @description
     * Checks that either TOP or BOTTOM positions are inside or outside the visible area.
     *
     * @param { number } valueTop - The numeric value for TOP position.
     * @param { number } valueBottom - The numeric value for BOTTOM position.
     */
    private overlayOutsideCheckY(valueTop: number, valueBottom: number): void {
        this.overlayOutside = valueTop < 0 ? POSITION.TOP : valueBottom < 0 ? POSITION.BOTTOM : undefined;
    }

    /**
     * @description
     * Checks that either LEFT or RIGHT positions are inside or outside the visible area.
     *
     * @param { number } valueLeft - The numeric value for LEFT position.
     * @param { number } valueRight - The numeric value for RIGHT position.
     */
    private overlayOutsideCheckX(valueLeft: number, valueRight: number): void {
        this.overlayOutside = valueLeft < 0 ? POSITION.LEFT : valueRight < 0 ? POSITION.RIGHT : undefined;
    }

    /**
     * @description
     * Boundary information such as position (top, bottom, left, right) & size (width, height).
     */
    private boundaryData!: BoundaryData;

    /**
     * @description
     * The Trigger element to which the Overlay will be attached to.
     */
    get triggerElement(): HTMLElement {
        return this.overlayConfig.trigger as HTMLElement;
    }
    set triggerElement(triggerElement: HTMLElement) {
        this.overlayConfig.trigger = triggerElement as HTMLElement;
    }

    /**
     * @description
     * The Overlay element.
     */
    get overlayElement(): HTMLElement {
        return this.overlayMainElement;
    }
    set overlayElement(overlayElement: HTMLElement) {
        const overlayInnerElement: HTMLDivElement = overlayElement?.querySelector(
            '[overlay-wrapper]'
        ) as HTMLDivElement;

        this.overlayMainElement = (overlayInnerElement || overlayElement) as HTMLElement;
    }

    /**
     * @description
     * Process and save the desired position & alignment.
     */
    private set overlayPosition(position: OverlayBasePositionInput) {
        const defaultValues = DEFAULTS.position as [OverlayBasePosition, OverlayBaseAlignment];

        if (!position) position = [undefined, undefined] as unknown as OverlayBasePositionInput;

        if (typeof position === 'string') {
            position = position.split('-').map((pos) => pos.toLowerCase().trim()) as [
                OverlayBasePosition,
                OverlayBaseAlignment
            ];
        }

        if (!position[0]) position[0] = this.desiredPosition ?? this.allowed.positions[0] ?? defaultValues[0];
        if (!position[1]) position[1] = this.desiredAlignment ?? this.allowed.alignments[0] ?? defaultValues[1];

        const isValidPosition: boolean = this.isValidPosition(position[0]) && this.isPositionAllowed(position[0]);
        this.desiredPosition = isValidPosition ? position[0] : this.allowed.positions[0] ?? POSITION.TOP;

        const isValidAlignment: boolean = this.isValidAlignment(position[1]) && this.isAlignmentAllowed(position[1]);
        const defaultAlignment: OverlayBaseAlignment = this.isAlignmentCenterAllowed
            ? ALIGNMENT.CENTER
            : ALIGNMENT.START;

        this.desiredAlignment = isValidAlignment ? position[1] : this.allowed.alignments[0] ?? defaultAlignment;
    }

    /**
     * @description
     * Verifies if the given position is a valid value.
     *
     * @param { string } position - A given position (top, bottom, left, right).
     * @returns { boolean }
     */
    private isValidPosition(position: OverlayBasePosition): boolean {
        return Object.values(POSITION).includes(position as POSITION);
    }

    /**
     * @description
     * Verifies if the given alignment is a valid value.
     *
     * @param { string } alignment - A given alignment (start, center, end).
     * @returns { boolean }
     */
    private isValidAlignment(alignment: OverlayBaseAlignment): boolean {
        return Object.values(ALIGNMENT).includes(alignment as ALIGNMENT);
    }

    /**
     * @description
     * The position strategy to use (Fixed or Absolute).
     */
    get positionStrategy(): OverlayBasePositionStrategy {
        return (this.overlayConfig.positionStrategy ?? DEFAULTS.positionStrategy) as OverlayBasePositionStrategy;
    }
    set positionStrategy(positionStrategy: OverlayBasePositionStrategy) {
        positionStrategy = positionStrategy?.toLowerCase().trim() as POSITION_STRATEGY;
        this.overlayConfig.positionStrategy = Object.values(POSITION_STRATEGY).includes(
            positionStrategy as POSITION_STRATEGY
        )
            ? positionStrategy
            : DEFAULTS.positionStrategy;
    }

    /**
     * @description
     * Sets the allowed positions.
     */
    private set positionsAllowed(allowed: OverlayBasePositionsAllowed) {
        if (typeof allowed === 'string') allowed = allowed.split(',') as OverlayBasePosition[];

        allowed = allowed
            .map((position) => position.toLowerCase().trim() as OverlayBasePosition)
            .filter(this.isValidPosition) as OverlayBasePosition[];

        this.allowed.positions = allowed.length
            ? (allowed as OverlayBasePosition[])
            : (DEFAULTS.positionsAllowed as OverlayBasePosition[]);
    }

    /**
     * @description
     * Sets the allowed opposite positions.
     */
    private set oppositePositionsAllowed(position: OverlayBasePositionInput | undefined) {
        position = position ?? this.desiredPosition ?? DEFAULTS.position;

        if (typeof position === 'string') position = position.split('-') as [OverlayBasePosition, OverlayBaseAlignment];
        if (!this.isValidPosition(position[0])) position[0] = this.desiredPosition ?? POSITION.TOP;

        const opposites: { [key in POSITION]: POSITION } = {
            top: POSITION.BOTTOM,
            bottom: POSITION.TOP,
            left: POSITION.RIGHT,
            right: POSITION.LEFT,
        };
        this.allowed.positions = [position[0], opposites[position[0]]];
    }

    /**
     * @description
     * Verifies if the given position is allowed.
     *
     * @param { string } position - A given position (top, bottom, left, right).
     * @returns { boolean }
     */
    private isPositionAllowed(position: OverlayBasePosition): boolean {
        return this.allowed.positions.includes(position);
    }

    /**
     * @description
     * Sets the allowed alignments.
     */
    private set alignmentsAllowed(allowed: OverlayBaseAlignmentsAllowed) {
        if (allowed === 'edges') {
            this.allowed.alignments = [ALIGNMENT.START, ALIGNMENT.END];
        } else if (allowed === 'center' && this.fluidAlignment) {
            this.allowed.alignments = [ALIGNMENT.CENTER];
        } else {
            if (typeof allowed === 'string') allowed = allowed.split(',') as OverlayBaseAlignment[];

            allowed = allowed
                .map((alignment) => alignment.toLowerCase().trim() as OverlayBaseAlignment)
                .filter(this.isValidAlignment) as OverlayBaseAlignment[];

            this.allowed.alignments = allowed.length
                ? (allowed as OverlayBaseAlignment[])
                : (DEFAULTS.alignmentsAllowed as OverlayBaseAlignment[]);
        }
    }

    /**
     * @description
     * Verifies if the given alignment is allowed.
     *
     * @param { string } alignment - A given alignment (start, center, end).
     * @returns { boolean }
     */
    private isAlignmentAllowed(alignment: OverlayBaseAlignment): boolean {
        return this.allowed.alignments.includes(alignment);
    }
    private get isAlignmentStartAllowed(): boolean {
        return this.isAlignmentAllowed(ALIGNMENT.START);
    }
    private get isAlignmentCenterAllowed(): boolean {
        return this.isAlignmentAllowed(ALIGNMENT.CENTER);
    }
    private get isAlignmentEndAllowed(): boolean {
        return this.isAlignmentAllowed(ALIGNMENT.END);
    }
    private get isAlignmentCenterOnly(): boolean {
        return this.allowed.alignments.length === 1 && this.allowed.alignments[0] === ALIGNMENT.CENTER;
    }
    private get isDesiredAlignmentStart(): boolean {
        return this.desiredAlignment === ALIGNMENT.START;
    }
    private get isDesiredAlignmentCenter(): boolean {
        return this.desiredAlignment === ALIGNMENT.CENTER;
    }
    private get isDesiredAlignmentEnd(): boolean {
        return this.desiredAlignment === ALIGNMENT.END;
    }

    /**
     * @description
     * Sets a custom Boundary element.
     *
     * @default <body>
     */
    get boundaryElement(): HTMLElement {
        return this.overlayConfig.boundary ?? document.body;
    }
    set boundaryElement(boundaryElement: HTMLElement) {
        this.overlayConfig.boundary = boundaryElement instanceof HTMLElement ? boundaryElement : document.body;
    }

    /**
     * @description
     * Checks if the Boundary is the `<body>` or not (custom).
     */
    private get isBoundaryCustom(): boolean {
        return this.boundaryElement.tagName !== 'BODY';
    }

    /**
     * @description
     * Considers an extra (safe) space for the Viewport.
     */
    get safeSpace(): OverlayBaseSafeSpace {
        return this.overlayConfig.safeSpace ?? DEFAULTS.safeSpace;
    }
    set safeSpace(safeSpace: OverlayBaseSafeSpace) {
        this.overlayConfig.safeSpace = { ...DEFAULTS.safeSpace, ...(safeSpace || {}) } as OverlayBaseSafeSpace;
    }

    /**
     * @description
     * Distance between Trigger & Overlay.
     */
    get offsetSize(): number {
        return this.overlayConfig.offsetSize ?? DEFAULTS.offsetSize;
    }
    set offsetSize(offsetSize: number) {
        this.overlayConfig.offsetSize = this.getNumericValue(offsetSize) ?? undefined;
    }

    /**
     * @description
     * Overlay alignment is fluid, it doesn't make jumps between Start, Center or End.
     * The Overlay will stick to the edges of the Viewport/Boundary when reaches any of them.
     */
    get fluidAlignment(): boolean {
        return !!this.overlayConfig.fluidAlignment;
    }
    set fluidAlignment(fluidAlignment: boolean) {
        this.overlayConfig.fluidAlignment = fluidAlignment;
    }

    /**
     * @description
     * Overlay size is fluid, it will adapt its width (for `left`/`right` positions) or
     * height (for `top`/`bottom` positions) to the available free space.
     *
     * Hand in hand with this, would be good to establish `maxSize` values.
     */
    get fluidSize(): boolean {
        return this.overlayConfig.fluidSize ?? DEFAULTS.fluidSize;
    }
    set fluidSize(fluidSize: boolean) {
        this.overlayConfig.fluidSize = fluidSize;
    }

    get isTop(): boolean {
        return this.currentPosition === POSITION.TOP;
    }
    get isBottom(): boolean {
        return this.currentPosition === POSITION.BOTTOM;
    }
    get isLeft(): boolean {
        return this.currentPosition === POSITION.LEFT;
    }
    get isRight(): boolean {
        return this.currentPosition === POSITION.RIGHT;
    }

    get isStart(): boolean {
        return this.currentAlignment === ALIGNMENT.START;
    }
    get isCenter(): boolean {
        return this.currentAlignment === ALIGNMENT.CENTER;
    }
    get isEnd(): boolean {
        return this.currentAlignment === ALIGNMENT.END;
    }

    get isTopBottom(): boolean {
        return this.isTop || this.isBottom;
    }

    /**
     * @description
     * Distance between Trigger & Overlay.
     */
    private get triggerOverlayDistance(): number {
        return this.offsetSize;
    }

    /**
     * @description
     * Real Width difference between Trigger & Overlay.
     *
     * Positive value means the Overlay is wider than the Trigger.
     */
    private get triggerOverlayDifferenceWidth(): number {
        return this.overlayRect.width - this.triggerRect.width;
    }

    /**
     * @description
     * Real Height difference between Trigger & Overlay.
     *
     * Positive value means the Overlay is higher than the Trigger.
     */
    private get triggerOverlayDifferenceHeight(): number {
        return this.overlayRect.height - this.triggerRect.height;
    }

    /**
     * @description
     * Original Width difference between Trigger & Overlay.
     *
     * Positive value means the Overlay is wider than the Trigger.
     */
    private get triggerOverlayOriginalDifferenceWidth(): number {
        return this.overlayOriginalRect.width - this.triggerRect.width;
    }

    /**
     * @description
     * Original Height difference between Trigger & Overlay.
     *
     * Positive value means the Overlay is higher than the Trigger.
     */
    private get triggerOverlayOriginalDifferenceHeight(): number {
        return this.overlayOriginalRect.height - this.triggerRect.height;
    }

    /**
     * @description
     * Distance between Boundary & Viewport for the given Position.
     *
     * @param { OverlayBasePosition } position - A given position (top, bottom, left, right).
     * @returns { number } The number of pixels between both elements.
     */
    private boundaryViewportDistance(position: OverlayBasePosition): number {
        const boundarySide: number = this.boundaryData[position];
        if (position === POSITION.TOP || position === POSITION.LEFT) return boundarySide;
        if (position === POSITION.BOTTOM) return this.viewportSize.height - boundarySide;
        return this.viewportSize.width - boundarySide; // right
    }

    /**
     * @description
     * Distance between Trigger & Boundary for the given Position.
     * This will take into consideration a given custom Boundary and/or Safe Space.
     *
     * @param { OverlayBasePosition } position - A given position (top, bottom, left, right).
     * @returns { number } The number of pixels between both elements.
     */
    triggerBoundaryDistance(position: OverlayBasePosition): number {
        const safeSpace: number = this.isBoundaryCustom
            ? Math.min(this.boundaryViewportDistance(position) - Number(this.safeSpace[position]), 0) * -1
            : Number(this.safeSpace[position]);
        const triggerPos: number = this.triggerRect[position];
        const boundaryPos: number = this.boundaryData[position];
        const distance: number =
            position === POSITION.TOP || position === POSITION.LEFT
                ? triggerPos - boundaryPos
                : boundaryPos - triggerPos;
        return distance - safeSpace;
    }

    /**
     * @description
     * Verifies if there is enough vertical/horizontal available space for the Overlay to fit.
     */
    private enoughAlignmentSpace(position: OverlayBasePosition): boolean {
        const isTopBottom: boolean = position === POSITION.TOP || position === POSITION.BOTTOM;
        return isTopBottom ? this.overlayFitsHorizontally : this.overlayFitsVertically;
    }

    /**
     * @description
     * Verifies if there is enough horizontal available space (horizontal scrolling)
     * for the Overlay to fit.
     */
    private get overlayFitsHorizontally(): boolean {
        const triggerOverlayDifferenceWidth: number = this.triggerOverlayOriginalDifferenceWidth;
        const distanceLeft: number = this.triggerBoundaryDistance(POSITION.LEFT);
        const distanceRight: number = this.triggerBoundaryDistance(POSITION.RIGHT);

        if (triggerOverlayDifferenceWidth >= 0) {
            return (distanceLeft >= 0 && distanceRight >= 0) || this.allowedOpposite;
        }

        const overlayTriggerDiff: number = triggerOverlayDifferenceWidth * -1;
        const overlayTriggerDiffHalf: number = overlayTriggerDiff / 2;

        const canBeStart: boolean = distanceLeft > 0 && distanceRight + overlayTriggerDiff > 0;
        const canBeCenter: boolean =
            distanceLeft + overlayTriggerDiffHalf > 0 && distanceRight + overlayTriggerDiffHalf > 0;
        const canBeEnd: boolean = distanceLeft + overlayTriggerDiff > 0 && distanceRight > 0;

        const fitsHorizontally: boolean =
            (this.isAlignmentStartAllowed && canBeStart) ||
            (this.isAlignmentCenterAllowed && canBeCenter) ||
            (this.isAlignmentEndAllowed && canBeEnd);

        return fitsHorizontally || this.allowedOpposite;
    }

    /**
     * @description
     * Verifies if there is enough vertical available space (vertical scrolling)
     * for the Overlay to fit.
     */
    private get overlayFitsVertically(): boolean {
        const triggerOverlayDifferenceHeight: number = this.triggerOverlayOriginalDifferenceHeight;
        const distanceTop: number = this.triggerBoundaryDistance(POSITION.TOP);
        const distanceBottom: number = this.triggerBoundaryDistance(POSITION.BOTTOM);

        if (triggerOverlayDifferenceHeight >= 0) {
            return (distanceTop >= 0 && distanceBottom >= 0) || this.allowedOpposite;
        }

        const overlayTriggerDiff: number = triggerOverlayDifferenceHeight * -1;
        const overlayTriggerDiffHalf: number = overlayTriggerDiff / 2;

        const canBeStart: boolean = distanceTop > 0 && distanceBottom + overlayTriggerDiff > 0;
        const canBeCenter: boolean =
            distanceTop + overlayTriggerDiffHalf > 0 && distanceBottom + overlayTriggerDiffHalf > 0;
        const canBeEnd: boolean = distanceTop + overlayTriggerDiff > 0 && distanceBottom > 0;

        const fitsVertically: boolean =
            (this.isAlignmentStartAllowed && canBeStart) ||
            (this.isAlignmentCenterAllowed && canBeCenter) ||
            (this.isAlignmentEndAllowed && canBeEnd);

        return fitsVertically || this.allowedOpposite;
    }

    /**
     * @description
     * Verifies if there is enough free space at the given position for the Overlay to fit.
     *
     * @param { OverlayBasePosition } position - A given position (top, bottom, left, right).
     * @returns { boolean }
     */
    private enoughBoundarySpace(position: OverlayBasePosition): boolean {
        let enoughSpace: number = this.triggerBoundaryDistance(position);

        if (position === POSITION.TOP || position === POSITION.BOTTOM) {
            enoughSpace -= this.overlayOriginalRect.height + this.triggerOverlayDistance;
        } else {
            enoughSpace -= this.overlayOriginalRect.width + this.triggerOverlayDistance;
        }

        return enoughSpace - 2 >= 0;
    }

    /**
     * @description
     * Returns if the given Position is allowed and has enough space for the Overlay to fit.
     */
    private canPositionAt(position: OverlayBasePosition): OverlayBasePosition | undefined {
        const canPositionAt: boolean =
            this.isPositionAllowed(position) &&
            this.enoughBoundarySpace(position) &&
            this.enoughAlignmentSpace(position);
        return canPositionAt ? position : undefined;
    }

    /**
     * @description
     * Calculates and returns the vertical alignment (for `left`/`right` positions).
     */
    private get getAlignmentVertically(): OverlayBaseAlignment {
        let overlayTriggerDiff: number = this.triggerOverlayOriginalDifferenceHeight;
        let overlayTriggerDiffHalf: number = overlayTriggerDiff / 2;

        if (this.fluidAlignment && overlayTriggerDiff > 0) return this.desiredAlignment;

        const distanceTop = this.triggerBoundaryDistance(POSITION.TOP);
        const distanceBottom = this.triggerBoundaryDistance(POSITION.BOTTOM);

        let canBeStart!: boolean;
        let canBeCentered!: boolean;
        let canBeEnd!: boolean;

        if (overlayTriggerDiff > 0) {
            // Overlay is higher than Trigger
            const topSpaceCentered = distanceTop - overlayTriggerDiffHalf > 0 ? distanceTop : 0;
            const bottomSpaceCentered = distanceBottom - overlayTriggerDiffHalf > 0 ? distanceBottom : 0;

            canBeStart = overlayTriggerDiff <= bottomSpaceCentered;
            canBeCentered = overlayTriggerDiffHalf <= topSpaceCentered && overlayTriggerDiffHalf <= bottomSpaceCentered;
            canBeEnd = overlayTriggerDiff <= topSpaceCentered;
        } else {
            // Overlay is shorter than Trigger
            overlayTriggerDiff = overlayTriggerDiff * -1;
            overlayTriggerDiffHalf = overlayTriggerDiffHalf * -1;
            canBeStart = distanceTop > 0 && distanceBottom + overlayTriggerDiff > 0;
            canBeCentered = distanceTop + overlayTriggerDiffHalf > 0 && distanceBottom + overlayTriggerDiffHalf > 0;
            canBeEnd = distanceTop + overlayTriggerDiff > 0 && distanceBottom > 0;
        }

        return this.getFinalAlignment(distanceTop, canBeCentered, canBeStart, canBeEnd);
    }

    /**
     * @description
     * Calculates and return the horizontal alignment (for `top`/`bottom` positions).
     */
    private get getAlignmentHorizontally(): OverlayBaseAlignment {
        let overlayTriggerDiff: number = this.triggerOverlayOriginalDifferenceWidth;
        let overlayTriggerDiffHalf: number = overlayTriggerDiff / 2;

        if (this.fluidAlignment && overlayTriggerDiff > 0) return this.desiredAlignment;

        const distanceLeft = this.triggerBoundaryDistance(POSITION.LEFT);
        const distanceRight = this.triggerBoundaryDistance(POSITION.RIGHT);

        let canBeStart!: boolean;
        let canBeCentered!: boolean;
        let canBeEnd!: boolean;

        if (overlayTriggerDiff > 0) {
            // Overlay is wider than Trigger
            const leftSpaceCentered = distanceLeft - overlayTriggerDiffHalf > 0 ? distanceLeft : 0;
            const rightSpaceCentered = distanceRight - overlayTriggerDiffHalf > 0 ? distanceRight : 0;

            canBeStart = overlayTriggerDiff <= rightSpaceCentered;
            canBeCentered = overlayTriggerDiffHalf <= leftSpaceCentered && overlayTriggerDiffHalf <= rightSpaceCentered;
            canBeEnd = overlayTriggerDiff <= leftSpaceCentered;
        } else {
            // Overlay is narrower than Trigger
            overlayTriggerDiff = overlayTriggerDiff * -1;
            overlayTriggerDiffHalf = overlayTriggerDiffHalf * -1;

            canBeStart = distanceLeft > 0 && distanceRight + overlayTriggerDiff > 0;
            canBeCentered = distanceLeft + overlayTriggerDiffHalf > 0 && distanceRight + overlayTriggerDiffHalf > 0;
            canBeEnd = distanceLeft + overlayTriggerDiff > 0 && distanceRight > 0;
        }

        return this.getFinalAlignment(distanceLeft, canBeCentered, canBeStart, canBeEnd);
    }

    /**
     * @description
     * Calculates the right alignment based on the
     *
     * @param { number } distance - The main distance (`top` for vertical alignment, `left` for horizontal alignment).
     * @param { boolean } canBeCentered - If the Overlay can be aligned to the center.
     * @param { boolean } canBeStart - If the Overlay can be aligned to the start.
     * @param { boolean } canBeEnd - If the Overlay can be aligned to the end.
     * @returns { OverlayBaseAlignment } The alignment.
     */
    private getFinalAlignment(
        distance: number,
        canBeCentered: boolean,
        canBeStart: boolean,
        canBeEnd: boolean
    ): OverlayBaseAlignment {
        const isAlignmentStartAllowed: boolean = this.isAlignmentStartAllowed;
        const isAlignmentCenterAllowed: boolean = this.isAlignmentCenterAllowed;
        const isAlignmentEndAllowed: boolean = this.isAlignmentEndAllowed;
        const isDesiredAllowedAlignmentStart: boolean = isAlignmentStartAllowed && this.isDesiredAlignmentStart;
        const isDesiredAllowedAlignmentCenter: boolean = isAlignmentCenterAllowed && this.isDesiredAlignmentCenter;
        const isDesiredAllowedAlignmentEnd: boolean = isAlignmentEndAllowed && this.isDesiredAlignmentEnd;

        // Check for desired alignment
        if (isDesiredAllowedAlignmentCenter && canBeCentered) return ALIGNMENT.CENTER;
        if (isDesiredAllowedAlignmentStart && canBeStart) return ALIGNMENT.START;
        if (isDesiredAllowedAlignmentEnd && canBeEnd) return ALIGNMENT.END;

        // Check for allowed alignment
        if (isAlignmentCenterAllowed && canBeCentered) return ALIGNMENT.CENTER;
        if (isAlignmentStartAllowed && canBeStart) return ALIGNMENT.START;
        if (isAlignmentEndAllowed && canBeEnd) return ALIGNMENT.END;

        // Check for which edge has more free space
        if (!isAlignmentCenterAllowed && isAlignmentStartAllowed && isAlignmentEndAllowed) {
            return distance > 0 ? ALIGNMENT.START : ALIGNMENT.END;
        }

        // Check the defaults
        if (isAlignmentStartAllowed && !isAlignmentEndAllowed && !isAlignmentCenterAllowed) return ALIGNMENT.START;
        if (isAlignmentEndAllowed && !isAlignmentStartAllowed && !isAlignmentCenterAllowed) return ALIGNMENT.END;

        return ALIGNMENT.CENTER;
    }

    /**
     * @description
     * Calculates maximum size (`width` or `height`) in case the overlay does not fit in the screen.
     */
    private get getMaxSize(): OverlayBaseMaxSize {
        const maxSize: OverlayBaseMaxSize = { width: null, height: null };

        if (this.fluidSize) {
            const size: number = this.triggerBoundaryDistance(this.currentPosition) - this.triggerOverlayDistance;

            if (this.isTopBottom) {
                maxSize.height = Math.min(this.maxSize.height || Infinity, size);
            } else {
                maxSize.width = Math.min(this.maxSize.width || Infinity, size);
            }
        }

        return maxSize;
    }

    /**
     * @description
     * Returns the final Position, Alignment, Render and MaxSize.
     */
    private get getCalculatedPosition(): OverlayBaseCalculatedPosition {
        this.getElementsSizeInfo();

        const isPositionFixed: boolean = this.positionStrategy === POSITION_STRATEGY.FIXED;

        const position: OverlayBasePosition = this.getPosition;
        this.currentPosition = position;

        const alignment: OverlayBaseAlignment = this.getAlignment;
        this.currentAlignment = alignment;

        const render: OverlayBaseRenderPosition = {
            ...(isPositionFixed ? this.getFixedY : this.getAbsoluteY),
            ...(isPositionFixed ? this.getFixedX : this.getAbsoluteX),
        };

        const maxSize: OverlayBaseMaxSize = this.getMaxSize;

        return { position, alignment, render, maxSize };
    }

    /**
     * @description
     * Returns the Overlay's `top` or `bottom` render Position/Alignment for the Strategy FIXED.
     */
    private get getFixedY(): OverlayBasePositionY {
        const posY: OverlayBasePositionY = { top: null, bottom: null };

        if (this.isTop) {
            posY.bottom = this.viewportSize.height - this.triggerRect.top + this.triggerOverlayDistance;
        } else if (this.isBottom) {
            posY.top = this.triggerRect.bottom + this.triggerOverlayDistance;
        } else {
            const triggerOverlayDifferenceHeight = this.triggerOverlayDifferenceHeight;
            const triggerOverlayDifferenceHalf = triggerOverlayDifferenceHeight / 2;

            // Fluid Alignment only works for Overlays that are higher than the Trigger
            if (this.fluidAlignment && triggerOverlayDifferenceHeight > 0) {
                const distanceTop: number = this.triggerBoundaryDistance(POSITION.TOP);
                const distanceBottom: number = this.triggerBoundaryDistance(POSITION.BOTTOM);
                let overlayTop!: number;
                let posTop!: number;
                let posBottom!: number;

                if (this.isAlignmentCenterOnly || (this.isAlignmentCenterAllowed && this.isCenter)) {
                    overlayTop = distanceTop - triggerOverlayDifferenceHalf;
                    posTop = this.triggerRect.top - triggerOverlayDifferenceHalf;
                    posBottom = distanceBottom - triggerOverlayDifferenceHalf;
                } else if (this.isStart) {
                    overlayTop = distanceTop;
                    posTop = this.triggerRect.top;
                    posBottom = distanceBottom - triggerOverlayDifferenceHeight;
                } else if (this.isEnd) {
                    overlayTop = distanceTop - triggerOverlayDifferenceHeight;
                    posTop = this.triggerRect.top - triggerOverlayDifferenceHeight;
                    posBottom = distanceBottom;
                }

                this.overlayOutsideCheckY(overlayTop, posBottom);

                if (posBottom > 0) {
                    posY.top = Math.max(
                        posTop,
                        this.boundaryViewportDistance(POSITION.TOP),
                        Number(this.safeSpace.top)
                    );
                } else {
                    posY.bottom = Math.max(
                        posBottom,
                        this.boundaryViewportDistance(POSITION.BOTTOM),
                        Number(this.safeSpace.bottom)
                    );
                }
            } else {
                if (this.isStart) {
                    posY.top = this.triggerRect.top;
                } else if (this.isEnd) {
                    posY.bottom = this.viewportSize.height - this.triggerRect.bottom;
                } else {
                    posY.top = this.triggerRect.top - triggerOverlayDifferenceHalf;
                }
            }
        }

        return posY;
    }

    /**
     * @description
     * Returns the Overlay's `left` or `right` render Position/Alignment for the Strategy FIXED.
     */
    private get getFixedX(): OverlayBasePositionX {
        const posX: OverlayBasePositionX = { left: null, right: null };

        if (this.isLeft) {
            posX.right = this.viewportSize.width - this.triggerRect.left + this.triggerOverlayDistance;
        } else if (this.isRight) {
            posX.left = this.triggerRect.right + this.triggerOverlayDistance;
        } else {
            const triggerOverlayDifferenceWidth = this.triggerOverlayDifferenceWidth;
            const triggerOverlayDifferenceHalf = triggerOverlayDifferenceWidth / 2;

            // Fluid Alignment only works for Overlays that are wider than the Trigger
            if (this.fluidAlignment && triggerOverlayDifferenceWidth > 0) {
                const distanceLeft: number = this.triggerBoundaryDistance(POSITION.LEFT);
                const distanceRight: number = this.triggerBoundaryDistance(POSITION.RIGHT);
                let overlayLeft!: number;
                let posLeft!: number;
                let posRight!: number;

                if (this.isAlignmentCenterOnly || (this.isAlignmentCenterAllowed && this.isCenter)) {
                    overlayLeft = distanceLeft - triggerOverlayDifferenceHalf;
                    posLeft = this.triggerRect.left - triggerOverlayDifferenceHalf;
                    posRight = distanceRight - triggerOverlayDifferenceHalf;
                } else if (this.isStart) {
                    overlayLeft = distanceLeft;
                    posLeft = this.triggerRect.left;
                    posRight = distanceRight - triggerOverlayDifferenceWidth;
                } else if (this.isEnd) {
                    overlayLeft = distanceLeft - triggerOverlayDifferenceWidth;
                    posLeft = this.triggerRect.left - triggerOverlayDifferenceWidth;
                    posRight = distanceRight;
                }

                this.overlayOutsideCheckX(overlayLeft, posRight);

                if (posRight > 0) {
                    posX.left = Math.max(
                        posLeft,
                        this.boundaryViewportDistance(POSITION.LEFT),
                        Number(this.safeSpace.left)
                    );
                } else {
                    posX.right = Math.max(
                        posRight,
                        this.boundaryViewportDistance(POSITION.RIGHT),
                        Number(this.safeSpace.right)
                    );
                }
            } else {
                if (this.isStart) {
                    posX.left = this.triggerRect.left;
                } else if (this.isEnd) {
                    posX.right = this.viewportSize.width - this.triggerRect.right;
                } else {
                    posX.left = this.triggerRect.left - triggerOverlayDifferenceHalf;
                }
            }
        }

        return posX;
    }

    /**
     * @description
     * Returns the absolute offset distance for the given position.
     *
     * @param { 'left' | 'top' } position - A given position (left, top).
     * @returns { number } The number of pixels between the chosen side and the Boundary.
     */
    private getAbsoluteOffset(position: 'left' | 'top'): number {
        let currentEl: HTMLElement = this.triggerElement;
        let offset: number = 0;

        do {
            offset += position === 'top' ? currentEl.offsetTop : currentEl.offsetLeft;
            currentEl = currentEl.offsetParent as HTMLElement;
        } while (this.boundaryElement.contains(currentEl?.offsetParent));

        return offset;
    }

    /**
     * @description
     * Returns the scroll distance for the given position.
     *
     * @param { 'left' | 'top' } position - A given position (left, top).
     * @returns { number } The number of pixels scrolled on the chosen side for the Boundary.
     */
    private getAbsoluteScroll(position: 'left' | 'top'): number {
        const scrollElement: HTMLElement = !this.isBoundaryCustom ? document.documentElement : this.boundaryElement;
        return position === 'top' ? scrollElement.scrollTop : scrollElement.scrollLeft;
    }

    /**
     * @description
     * Returns the Overlay's `top` or `bottom` render Position/Alignment for the Strategy ABSOLUTE.
     */
    private get getAbsoluteY(): OverlayBasePositionY {
        const posY: OverlayBasePositionY = { top: null, bottom: null };
        const offsetPosition = this.getAbsoluteOffset('top');

        if (this.isTop) {
            posY.bottom = this.boundaryData.height - offsetPosition + this.triggerOverlayDistance;
        } else if (this.isBottom) {
            posY.top = offsetPosition + this.triggerRect.height + this.triggerOverlayDistance;
        } else {
            const triggerOverlayDifferenceHeight = this.triggerOverlayDifferenceHeight;
            const triggerOverlayDifferenceHalf = triggerOverlayDifferenceHeight / 2;

            // Fluid Alignment only works for Overlays that are higher than the Trigger
            if (this.fluidAlignment && triggerOverlayDifferenceHeight > 0) {
                const scrollTop: number = this.getAbsoluteScroll('top');
                const distanceTop: number = this.triggerBoundaryDistance(POSITION.TOP);
                const distanceBottom: number = this.triggerBoundaryDistance(POSITION.BOTTOM);
                const boundaryTop: number = this.isBoundaryCustom ? this.boundaryRect.top : 0;
                const boundaryBottom: number = this.isBoundaryCustom
                    ? this.viewportSize.height - this.boundaryRect.bottom + this.boundaryScrollSize.horizontal
                    : 0;
                let posTop!: number;
                let posBottom!: number;

                if (this.isAlignmentCenterOnly || (this.isAlignmentCenterAllowed && this.isCenter)) {
                    posTop = distanceTop - triggerOverlayDifferenceHalf;
                    posBottom = distanceBottom - triggerOverlayDifferenceHalf;
                } else if (this.isStart) {
                    posTop = distanceTop;
                    posBottom = distanceBottom - triggerOverlayDifferenceHeight;
                } else if (this.isEnd) {
                    posTop = distanceTop - triggerOverlayDifferenceHeight;
                    posBottom = distanceBottom;
                }

                this.overlayOutsideCheckY(posTop, posBottom);

                if (posBottom > 0) {
                    posY.top =
                        Math.max(posTop + scrollTop, scrollTop) - Math.min(boundaryTop - Number(this.safeSpace.top), 0);
                } else {
                    posY.bottom = scrollTop * -1 - Math.min(boundaryBottom - Number(this.safeSpace.bottom), 0);
                }
            } else {
                if (this.isStart) {
                    posY.top = offsetPosition;
                } else if (this.isEnd) {
                    posY.top = offsetPosition - triggerOverlayDifferenceHeight;
                } else {
                    posY.top = offsetPosition - triggerOverlayDifferenceHalf;
                }
            }
        }

        return posY;
    }

    /**
     * @description
     * Returns the Overlay's `left` or `right` render Position/Alignment for the Strategy ABSOLUTE.
     */
    private get getAbsoluteX(): OverlayBasePositionX {
        const posX: OverlayBasePositionX = { left: null, right: null };
        const offsetPosition = this.getAbsoluteOffset('left');

        if (this.isLeft) {
            posX.right = this.boundaryData.width - offsetPosition + this.triggerOverlayDistance;
        } else if (this.isRight) {
            posX.left = offsetPosition + this.triggerRect.width + this.triggerOverlayDistance;
        } else {
            const triggerOverlayDifferenceWidth = this.triggerOverlayDifferenceWidth;
            const triggerOverlayDifferenceHalf = triggerOverlayDifferenceWidth / 2;

            // Fluid Alignment only works for Overlays that are wider than the Trigger
            if (this.fluidAlignment && triggerOverlayDifferenceWidth > 0) {
                const scrollLeft: number = this.getAbsoluteScroll('left');
                const distanceLeft: number = this.triggerBoundaryDistance(POSITION.LEFT);
                const distanceRight: number = this.triggerBoundaryDistance(POSITION.RIGHT);
                const boundaryLeft: number = this.isBoundaryCustom ? this.boundaryRect.left : 0;
                const boundaryRight: number = this.isBoundaryCustom
                    ? this.viewportSize.width - this.boundaryRect.right + this.boundaryScrollSize.vertical
                    : 0;
                let posLeft!: number;
                let posRight!: number;

                if (this.isAlignmentCenterOnly || (this.isAlignmentCenterAllowed && this.isCenter)) {
                    posLeft = distanceLeft - triggerOverlayDifferenceHalf;
                    posRight = distanceRight - triggerOverlayDifferenceHalf;
                } else if (this.isStart) {
                    posLeft = distanceLeft;
                    posRight = distanceRight - triggerOverlayDifferenceWidth;
                } else if (this.isEnd) {
                    posLeft = distanceLeft - triggerOverlayDifferenceWidth;
                    posRight = distanceRight;
                }

                this.overlayOutsideCheckX(posLeft, posRight);

                if (posRight > 0) {
                    posX.left =
                        Math.max(posLeft + scrollLeft, scrollLeft) -
                        Math.min(boundaryLeft - Number(this.safeSpace.left), 0);
                } else {
                    posX.right = scrollLeft * -1 - Math.min(boundaryRight - Number(this.safeSpace.right), 0);
                }
            } else {
                if (this.isStart) {
                    posX.left = offsetPosition;
                } else if (this.isEnd) {
                    posX.left = offsetPosition - triggerOverlayDifferenceWidth;
                } else {
                    posX.left = offsetPosition - triggerOverlayDifferenceHalf;
                }
            }
        }

        return posX;
    }

    /**
     * @description
     * If the Trigger is (at least partially) outside of the Boundary on one or both of its axes
     * and the viewport size is not big enough to fit the overlay,
     * it'll choose the side with more available space.
     */
    private get getAutoPosition(): OverlayBasePosition {
        const viewport: ViewportSize = this.viewportSizeSafe;
        const squareAreas: OverlayBaseSquareAreas = {
            [POSITION.TOP]: this.triggerBoundaryDistance(POSITION.TOP) * viewport.width,
            [POSITION.BOTTOM]: this.triggerBoundaryDistance(POSITION.BOTTOM) * viewport.width,
            [POSITION.LEFT]: this.triggerBoundaryDistance(POSITION.LEFT) * viewport.height,
            [POSITION.RIGHT]: this.triggerBoundaryDistance(POSITION.RIGHT) * viewport.height,
        };

        let maxVisibleArea: number = -Infinity;
        let availablePosition!: OverlayBasePosition;

        for (const theArea in squareAreas) {
            const area: OverlayBasePosition = theArea as OverlayBasePosition;
            const squareArea: number = squareAreas[area];

            if (this.isPositionAllowed(area) && squareArea > maxVisibleArea) {
                maxVisibleArea = squareArea;
                availablePosition = area;
            }
        }

        return availablePosition;
    }

    /**
     * @description
     * Returns the final position.
     */
    private get getPosition(): OverlayBasePosition {
        let position: OverlayBasePosition | undefined = undefined;
        let order!: OverlayBasePosition[];

        if (this.desiredPosition === POSITION.TOP) {
            order = [POSITION.TOP, POSITION.BOTTOM, POSITION.LEFT, POSITION.RIGHT];
        } else if (this.desiredPosition === POSITION.BOTTOM) {
            order = [POSITION.BOTTOM, POSITION.TOP, POSITION.LEFT, POSITION.RIGHT];
        } else if (this.desiredPosition === POSITION.LEFT) {
            order = [POSITION.LEFT, POSITION.RIGHT, POSITION.TOP, POSITION.BOTTOM];
        } else if (this.desiredPosition === POSITION.RIGHT) {
            order = [POSITION.RIGHT, POSITION.LEFT, POSITION.TOP, POSITION.BOTTOM];
        }

        for (let pos = 0; pos < order.length; pos++) {
            position = this.canPositionAt(order[pos]);
            if (position) break;
        }

        // If no position found, check for best option based on free space
        return position || this.getAutoPosition;
    }

    /**
     * @description
     * Returns the final alignment.
     */
    private get getAlignment(): OverlayBaseAlignment {
        if (this.isTopBottom) return this.getAlignmentHorizontally;

        return this.getAlignmentVertically;
    }

    /**
     * @description
     * Base listeners for Page Scroll, Page Resize, Boundary Scroll & Update on demand.
     */
    get overlayListeners$(): Observable<void> {
        return from(this.listeners).pipe(mergeAll());
    }

    constructor() {
        // To init `boundaryRect` and avoid SSR (Server Side Rendering) to crash
        if (typeof DOMRect !== 'undefined')
            this.boundaryRect = new DOMRect(0, 0, this.viewportSize.width, this.viewportSize.height);
    }

    /**
     * @description
     * Update on demand to return recalculated position/alignment data.
     */
    recalculate(): void {
        this.forceUpdate$.next();
    }

    /**
     * @description
     * Update Overlay ClientRect data on demand in case its content changes.
     *
     * This will force recalculations.
     */
    updateOverlaySize(): void {
        this.getOverlayOriginalClientRect(true);
        this.recalculate();
    }

    /**
     * @description
     * Sets / updates the basic config.
     */
    setBaseConfig(customConfig?: OverlayBaseConfig): void {
        if (!customConfig) return;

        if ('trigger' in customConfig) {
            if (customConfig.trigger instanceof HTMLElement) {
                this.triggerElement = customConfig.trigger;
            } else {
                this.virtualTriggerRect = customConfig.trigger as DOMRect;
            }
        }

        if ('fluidAlignment' in customConfig)
            this.fluidAlignment = this.getBooleanValue(customConfig.fluidAlignment) ?? DEFAULTS.fluidAlignment;
        if ('fluidSize' in customConfig)
            this.fluidSize = this.getBooleanValue(customConfig.fluidSize) ?? DEFAULTS.fluidSize;

        if ('alignmentsAllowed' in customConfig)
            this.alignmentsAllowed = customConfig.alignmentsAllowed as OverlayBaseAlignmentsAllowed;
        if ('positionsAllowed' in customConfig) {
            const positionsAllowed = customConfig.positionsAllowed as OverlayBasePositionsAllowed;
            this.allowedOpposite =
                typeof positionsAllowed === 'string' && positionsAllowed.toLowerCase().trim() === 'opposite';
            if (!this.allowedOpposite) this.positionsAllowed = positionsAllowed;
        }

        // First input will not have desired position nor alignment.
        const noDefaultPositionOrAlignment: boolean = !this.desiredPosition && !this.desiredAlignment;
        if (noDefaultPositionOrAlignment || 'position' in customConfig) {
            if (this.allowedOpposite) this.oppositePositionsAllowed = customConfig.position as OverlayBasePositionInput;
            this.overlayPosition = customConfig.position as OverlayBasePositionInput;
        } else {
            if (this.allowedOpposite) {
                this.oppositePositionsAllowed = undefined;
            } else {
                this.overlayPosition = undefined as unknown as OverlayBasePositionInput;
            }
        }

        if ('positionStrategy' in customConfig)
            this.positionStrategy = customConfig.positionStrategy as OverlayBasePositionStrategy;
        if ('boundary' in customConfig) this.boundaryElement = customConfig.boundary as HTMLElement;
        if ('safeSpace' in customConfig) this.safeSpace = customConfig.safeSpace as OverlayBaseSafeSpace;
        if ('offsetSize' in customConfig) this.offsetSize = customConfig.offsetSize as number;
        if ('allowScrollListener' in customConfig)
            this.allowScrollListener =
                this.getBooleanValue(customConfig.allowScrollListener) ?? DEFAULTS.allowScrollListener;
    }

    /**
     * @description
     * Assigns the provided overlay element and starts listening to the scroll & resize to calculate and return the best position for it.
     *
     * @param { HTMLElement } overlayElement - The `overlay` HTML element to base all calculation on.
     * @param { number } debounceTimeMs - Delay between emissions.
     * @returns { Observable<OverlayBaseCalculatedPosition> } An `observable` with
     *  - the `position` (top, bottom, left, right),
     *  - the `alignment` (start, center, end),
     *  - the position to `render` (top, bottom, left, right) based on the chosen `position strategy` and
     *  - the `max size` (if "`fluidSize`" is active) that'll provide max width/height so the overlay is always visible on screen.
     */
    attachOverlay(overlayElement: HTMLElement, debounceTimeMs: number = 10): Observable<OverlayBaseCalculatedPosition> {
        if (!this.isAttached) {
            this.overlayElement = overlayElement;

            if (this.isBoundaryCustom) {
                this.boundaryElement.addEventListener('scroll', this.boundaryScrollFn);
            }

            this.forceUpdate$ = new BehaviorSubject<void | undefined>(undefined);
            this.isDetached$ = new Subject();
            this.isAttached = true;

            if (this.allowScrollListener && this.triggerElement) {
                window.addEventListener('scroll', this.scrollFn);
                this.listeners.push(this.scroll$);
            }

            window.addEventListener('resize', this.resizeFn);
            this.listeners.push(this.resize$, this.boundaryScroll$, this.forceUpdate$);
        }

        return this.overlayListeners$.pipe(
            debounceTime(debounceTimeMs),
            map(() => this.getCalculatedPosition)
        );
    }

    /**
     * @description
     * Detaches the Overlay and removes the scroll listener for custom Boundary.
     */
    detachOverlay(): void {
        if (!this.isAttached) return;

        this.isAttached = false;

        this.isDetached$.next();
        this.isDetached$.complete();
        this.forceUpdate$.complete();

        window.removeEventListener('scroll', this.scrollFn);
        window.removeEventListener('resize', this.resizeFn);

        this.listeners.length = 0;

        if (this.isBoundaryCustom) {
            this.boundaryElement.removeEventListener('scroll', this.boundaryScrollFn);
        }
    }

    /**
     * @description
     * Gets all the necessary ClientRect, Boundary and Viewport data.
     */
    private getElementsSizeInfo(): void {
        this.getTriggerClientRect();
        this.getOverlayClientRect();
        this.getBoundaryClientRect();
        this.getBoundaryScrollSize();
        this.getBoundaryCalculatedRect();
        this.getViewportSizeSafe();
    }

    private getTriggerClientRect(): void {
        this.triggerRect = this.virtualTriggerRect || this.triggerElement?.getBoundingClientRect();
        if (!this.triggerRect) throw new Error(ERROR_NO_TRIGGER_PROVIDED());
    }

    private getOverlayClientRect(): void {
        this.overlayRect = this.overlayElement.getBoundingClientRect();
        this.getOverlayOriginalClientRect();
    }

    private getOverlayOriginalClientRect(forceUpdate?: boolean): void {
        if (!this.overlayOriginalRect || forceUpdate) {
            this.overlayOriginalRect = this.overlayElement.getBoundingClientRect();
        }
    }

    private getBoundaryClientRect(): void {
        this.boundaryRect = this.boundaryElement?.getBoundingClientRect();
    }

    private getBoundaryCalculatedRect(): void {
        const viewportSize = this.viewportSize;
        let top: number = 0;
        let bottom: number = viewportSize.height;
        let left: number = 0;
        let right: number = viewportSize.width;
        let width: number = viewportSize.width;
        let height: number = viewportSize.height;

        if (this.isBoundaryCustom) {
            const boundaryBottom: number = this.boundaryRect.bottom - this.boundaryScrollSize.horizontal;
            const boundaryRight: number = this.boundaryRect.right - this.boundaryScrollSize.vertical;

            height = boundaryBottom - this.boundaryRect.top;
            width = boundaryRight - this.boundaryRect.left;

            top = this.boundaryRect.top;
            left = this.boundaryRect.left;
            bottom = boundaryBottom;
            right = boundaryRight;
        }

        this.boundaryData = { top, bottom, left, right, width, height };
    }

    private getBoundaryScrollSize(): void {
        const vertical: number = this.isBoundaryCustom
            ? this.boundaryElement.offsetWidth - this.boundaryElement.clientWidth
            : 0;
        const horizontal: number = this.isBoundaryCustom
            ? this.boundaryElement.offsetHeight - this.boundaryElement.clientHeight
            : 0;

        this.boundaryScrollSize = { vertical, horizontal };
    }

    private getViewportSizeSafe(): void {
        const viewportSize = this.viewportSize;
        this.viewportSafe = {
            width:
                viewportSize.width -
                Math.max(this.boundaryViewportDistance(POSITION.LEFT), Number(this.safeSpace.left)) -
                Math.max(this.boundaryViewportDistance(POSITION.RIGHT), Number(this.safeSpace.right)),
            height:
                viewportSize.height -
                Math.max(this.boundaryViewportDistance(POSITION.TOP), Number(this.safeSpace.top)) -
                Math.max(this.boundaryViewportDistance(POSITION.BOTTOM), Number(this.safeSpace.bottom)),
        };
    }

    private getNumericValue(value: unknown): number | null {
        const isNumeric = (val: unknown): boolean => {
            return String(val)?.trim().length > 0 && !isNaN(Number(val ?? '!'));
        };

        const numericValue: number = parseFloat(String(value ?? ''));
        if (!isNumeric(value) || isNaN(numericValue)) return null;

        return numericValue;
    }

    private getBooleanValue(value: unknown): boolean | null {
        const isBoolean = (val: unknown): boolean => {
            const valueStr: string = String(val).trim();
            return ['true', 'false'].indexOf(valueStr) !== -1;
        };

        try {
            return isBoolean(value) ? JSON.parse(String(value)) : null;
        } catch {
            return null;
        }
    }
}
