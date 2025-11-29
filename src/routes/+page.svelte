<script>
	import Canvas from '$lib/components/canvas/canvas.svelte';
</script>

<div class="relative h-dvh w-full overflow-hidden bg-green-100">
	<Canvas />

	<div class="absolute bottom-0 left-0 p-2">
		<button class="rounded-md bg-red-200 p-2">Reset</button>
	</div>
</div>
