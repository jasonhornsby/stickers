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

export const load: PageServerLoad = async () => {
    const initialImages: StoredImage[] = [logoImage];

    return {
        initialImages
    }
}