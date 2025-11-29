
export type StoredImage = {
    id: string;
    x: number;
    y: number;
    src: string;
    width: number;
    height: number;
    type: 'sticker' | 'logo';
}