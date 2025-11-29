


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
        isSelected: boolean,
    }