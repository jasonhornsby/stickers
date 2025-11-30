import type { Handle } from "@sveltejs/kit";
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./lib/pocketbase-types";

export const pocketbase: Handle = async ({ event, resolve }) => {
    // TODO: Add PocketBase URL to environment variables
    event.locals.pb = new PocketBase('http://localhost:8090') as TypedPocketBase;
    return resolve(event);
}