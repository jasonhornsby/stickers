import type { StoredImage } from "$lib/image";
import type { PageServerLoad } from "./$types";

const logoImage: StoredImage = {
    id: 'logo',
    x: 0,
    y: 0,
    src: '/logo.png',
    width: 100,
    height: 100,
    type: 'logo'
};

const testSticker: StoredImage = {
    id: 'test-sticker',
    x: 100,
    y: 100,
    src: '/logo.png',
    width: 100,
    height: 100,
    type: 'sticker'
};

const testSticker2: StoredImage = {
    id: 'test-sticker-2',
    x: -100,
    y: 100,
    src: '/logo.png',
    width: 100,
    height: 100,
    type: 'sticker'
};
const testSticker3: StoredImage = {
    id: 'test-sticker-3',
    x: 100,
    y: -100,
    src: '/logo.png',
    width: 100,
    height: 100,
    type: 'sticker'
};

export const load: PageServerLoad = async () => {
    const initialImages: StoredImage[] = [logoImage, testSticker, testSticker2, testSticker3];

    return {
        initialImages
    }
}