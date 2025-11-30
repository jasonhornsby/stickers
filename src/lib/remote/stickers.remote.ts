import { command } from "$app/server";
import { z } from "zod";

export const uploadSticker = command(z.object({ x: z.number(), y: z.number() }), async (data) => {
    console.log(data);
    return {
        success: false
    }
});