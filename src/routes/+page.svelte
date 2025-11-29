<script lang="ts">
	import Canvas from '$lib/components/canvas/canvas.svelte';
	import type { StoredImage } from '$lib/image';

	const { data } = $props();

	let selectedImage: StoredImage | null = $state(null);

	function setSelectedImage(image: StoredImage | null): void {
		selectedImage = image;
	}

	$inspect('selectedImage:', selectedImage);
</script>

<div class="relative h-dvh w-full overflow-hidden bg-green-100">
	<Canvas initialImages={data.initialImages} onSelectedImageChanged={setSelectedImage} />
</div>
