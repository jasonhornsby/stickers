<script lang="ts">
	import Canvas from '$lib/components/canvas/canvas.svelte';
	import type { Image } from '$lib/image';

	let selectedImage: Image | null = $state(null);

	function setSelectedImage(image: Image | null): void {
		selectedImage = image;
	}
</script>

<div class="relative h-dvh w-full overflow-hidden bg-green-100">
	<Canvas initialImages={[]} onSelectedImageChanged={setSelectedImage} />
</div>
