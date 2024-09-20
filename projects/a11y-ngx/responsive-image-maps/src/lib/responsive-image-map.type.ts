export type MapSize = ImageSize &
    ImagePosition & {
        fullWidth: number;
        fullHeight: number;
    };

export type AreaSize = ImageSize & ImagePosition;

export type ImageSize = {
    width: number;
    height: number;
};

export type ImagePosition = {
    top: number;
    left: number;
};
