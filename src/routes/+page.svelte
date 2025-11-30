<script lang="ts">
	import { Canvas, type UserViewport } from '$lib/components/canvas';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { StickerDrawer } from '$lib/components/stickerDrawer';
	import { AddStickerDrawer } from '$lib/components/addStickerDrawer';
	import { Plus, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { data } = $props();

	const GET_PARAMETER_NAME = 'sticker';

	// Initialize selectedImageId from URL parameter if available
	let selectedImageId: string | null = $state($page.url.searchParams.get(GET_PARAMETER_NAME));
	let canvasContainer: HTMLCanvasElement | null = $state(null);
	let previousSelectedId: string | null = $state(null);
	let addStickerMode: boolean = $state(false);
	let addStickerOpen: boolean = $state(false);
	let userViewport = $state<UserViewport | null>(null);

	$inspect('selectedImage:', selectedImageId);
	$inspect('userViewport:', userViewport);

	function handleUserPositionChange(viewport: UserViewport): void {
		userViewport = viewport;
	}

	function handleBackgroundClick(x: number, y: number): void {
		if (!addStickerMode) return;

		addStickerOpen = true;
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
	<div class="absolute bottom-0 left-[50%] z-10 flex w-fit -translate-x-1/2 justify-center p-4">
		{#if addStickerMode}
			<Button onclick={() => (addStickerMode = false)}><X /></Button>
		{:else}
			<Button onclick={() => (addStickerMode = true)}><Plus /></Button>
		{/if}
	</div>
	<Canvas
		bind:canvas={canvasContainer}
		initialImages={data.initialImages}
		bind:selectedImageId
		onUserPositionChange={handleUserPositionChange}
		onBackgroundClick={handleBackgroundClick}
	/>
</div>

<StickerDrawer bind:selectedImageId />
<AddStickerDrawer bind:isOpen={addStickerOpen} />
