import { POSITION, OverlayBasePosition, OverlayBaseAlignment } from './overlay-base.type';

export type BoundaryData = { [key in POSITION]: number } & { width: number; height: number };

export type OverlayBaseRenderPosition = OverlayBasePositionX & OverlayBasePositionY;

export type ScrollSize = { horizontal: number; vertical: number };

export type ViewportSize = { width: number; height: number };

export type OverlayBaseAllowed = {
    positions: OverlayBasePosition[];
    alignments: OverlayBaseAlignment[];
};

export type OverlayBaseSquareAreas = { [key in POSITION]: number };

export type OverlayBasePositionY = {
    top: number | null;
    bottom: number | null;
};

export type OverlayBasePositionX = {
    left: number | null;
    right: number | null;
};
