import { OverlayBaseRenderPosition } from './overlay-base.type.private';

export enum POSITION {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
}

export enum ALIGNMENT {
    START = 'start',
    END = 'end',
    CENTER = 'center',
}

export enum POSITION_STRATEGY {
    FIXED = 'fixed',
    ABSOLUTE = 'absolute',
}

export const OVERLAY_BASE_DEFAULTS: Required<Omit<OverlayBaseConfig, 'trigger' | 'boundary'>> = {
    offsetSize: 5,
    fluidAlignment: false,
    fluidSize: true,
    position: [POSITION.TOP, ALIGNMENT.CENTER] as OverlayBasePositionInput,
    positionStrategy: POSITION_STRATEGY.FIXED,
    positionsAllowed: [POSITION.TOP, POSITION.BOTTOM, POSITION.LEFT, POSITION.RIGHT],
    alignmentsAllowed: [ALIGNMENT.CENTER, ALIGNMENT.START, ALIGNMENT.END],
    safeSpace: { top: 0, bottom: 0, left: 0, right: 0 },
    allowScrollListener: true,
};

export type OverlayBasePosition = `${POSITION}`;

export type OverlayBaseAlignment = `${ALIGNMENT}`;

export type OverlayBasePositionStrategy = `${POSITION_STRATEGY}`;

export type OverlayBaseSafeSpace = Partial<{ [key in POSITION]: number }>;

export type OverlayBaseMaxSize = Partial<{ width: number | null; height: number | null }>;

export type OverlayBasePositionInput =
    | OverlayBasePosition
    | `${POSITION}-${ALIGNMENT}`
    | [OverlayBasePosition, OverlayBaseAlignment];

export type OverlayBasePositionsAllowed = 'auto' | 'opposite' | string | OverlayBasePosition | OverlayBasePosition[];

export type OverlayBaseAlignmentsAllowed =
    | 'auto'
    | 'center'
    | 'edges'
    | string
    | OverlayBaseAlignment
    | OverlayBaseAlignment[];

export type OverlayBaseCalculatedPosition = {
    /** @description Returns the position (top, bottom, left, right). */
    position: OverlayBasePosition;
    /** @description Returns the alignment (start, end, center). */
    alignment: OverlayBaseAlignment;
    /** @description Returns the numeric value to position the overlay (top, bottom, left, right). */
    render: OverlayBaseRenderPosition;
    /** @description Returns the maximum size (width, height). */
    maxSize: OverlayBaseMaxSize;
};

export type OverlayBaseConfig = Partial<{
    /** @description The trigger to which the overlay will be attached. */
    trigger: HTMLElement | DOMRect;
    /** @description To define a custom boundary, such as wrappers with established overflow. @default <body> */
    boundary: HTMLElement;
    /** @description The desired position and alignment. @default 'top-center' */
    position: OverlayBasePositionInput;
    /** @description Whether a `fixed` or `absolute` position will be used. @default 'fixed' */
    positionStrategy: OverlayBasePositionStrategy;
    /** @description To establish which positions are allowed when repositioning is needed. @default 'auto' */
    positionsAllowed: OverlayBasePositionsAllowed;
    /** @description To establish which alignments are allowed when repositioning is needed. @default 'auto' */
    alignmentsAllowed: OverlayBaseAlignmentsAllowed;
    /** @description The space between the overlay and its trigger (translated to pixels). @default 5 */
    offsetSize: number;
    /** @description To establish extra safe space to the viewport's edges in case some fixed areas are present. @default { top: 0, bottom: 0, left: 0, right: 0 } */
    safeSpace: OverlayBaseSafeSpace;
    /** @description To establish whether the overlay alignment will stick to the edges of the viewport/boundary. @default false */
    fluidAlignment: boolean;
    /** @description To establish whether the overlay size will adjust to the free space or stay as its original size. @default true */
    fluidSize: boolean;
    /** @description To allow listening for page scrolling. @default true */
    allowScrollListener: boolean;
}>;
