

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