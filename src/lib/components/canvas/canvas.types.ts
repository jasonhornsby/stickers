

/**
 * LocalImageData is a type that represents the data for an image on the canvas.
 * All properties are scaled by the device pixel ratio
 */
export type LocalImageData =
    {
        isLoaded: false,
        img: HTMLImageElement,
    } | {
        isLoaded: true,
        img: HTMLImageElement,
        localX: number,
        localY: number,
        width: number,
        height: number,
    }

/**
 * UserViewport represents the user's current viewport position and dimensions.
 * All coordinates are in stored coordinates (logical CSS pixels, no DPI scaling).
 * This matches the coordinate system of stored images (img.x, img.y).
 */
export type UserViewport = {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}