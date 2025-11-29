<script lang="ts">
	import Canvas from '$lib/components/canvas/canvas.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const { data } = $props();

	// Initialize selectedImageId from URL parameter if available
	let selectedImageId: string | null = $state($page.url.searchParams.get('selectedImageId'));

	$inspect('selectedImage:', selectedImageId);

	// Update URL when selectedImageId changes
	$effect(() => {
		const url = new URL($page.url);

		if (selectedImageId) {
			url.searchParams.set('selectedImageId', selectedImageId);
		} else {
			url.searchParams.delete('selectedImageId');
		}

		// Only update if the URL actually changed
		if (url.toString() !== $page.url.toString()) {
			goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		}
	});
</script>

<div class="relative h-dvh w-full overflow-hidden bg-green-100">
	<Canvas initialImages={data.initialImages} bind:selectedImageId />
</div>
