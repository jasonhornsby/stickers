<script lang="ts">
	import { Canvas, type UserViewport } from '$lib/components/canvas';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Drawer from '$lib/components/drawer/drawer.svelte';

	const { data } = $props();

	const GET_PARAMETER_NAME = 'sticker';

	// Initialize selectedImageId from URL parameter if available
	let selectedImageId: string | null = $state($page.url.searchParams.get(GET_PARAMETER_NAME));
	let canvasContainer: HTMLCanvasElement | null = $state(null);
	let previousSelectedId: string | null = $state(null);
	let userViewport = $state<UserViewport | null>(null);

	$inspect('selectedImage:', selectedImageId);
	$inspect('userViewport:', userViewport);

	function handleUserPositionChange(viewport: UserViewport): void {
		userViewport = viewport;
	}

	// Update URL when selectedImageId changes
	$effect(() => {
		const url = new URL($page.url);

		if (selectedImageId) {
			url.searchParams.set(GET_PARAMETER_NAME, selectedImageId);
		} else {
			url.searchParams.delete(GET_PARAMETER_NAME);
		}

		// Only update if the URL actually changed
		if (url.toString() !== $page.url.toString()) {
			goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		}
	});

	// Focus canvas when drawer closes
	$effect(() => {
		if (previousSelectedId !== null && selectedImageId === null && canvasContainer) {
			// Drawer just closed, focus the canvas container
			canvasContainer.focus();
		}
		previousSelectedId = selectedImageId;
	});
</script>

<div
	tabindex="-1"
	class="relative h-dvh w-full overflow-hidden bg-green-100 outline-none"
	style="touch-action: none; overscroll-behavior: none;"
>
	<Canvas
		bind:canvas={canvasContainer}
		initialImages={data.initialImages}
		bind:selectedImageId
		onUserPositionChange={handleUserPositionChange}
	/>
</div>

<Drawer bind:selectedImageId />
