<script lang="ts">
	import Canvas from '$lib/components/canvas/canvas.svelte';
	import type { StoredImage } from '$lib/image';

	const { data } = $props();

	let selectedImageId: string | null = $state(null);

	$inspect('selectedImage:', selectedImageId);
</script>

<div class="relative h-dvh w-full overflow-hidden bg-green-100">
	<Canvas initialImages={data.initialImages} bind:selectedImageId />
</div>
