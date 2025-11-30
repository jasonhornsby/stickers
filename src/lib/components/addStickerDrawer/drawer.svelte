<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import UploadSticker from './uploadSticker.svelte';

	let { isOpen = $bindable(false) }: { isOpen: boolean } = $props();

	function handleClose() {
		isOpen = false;
	}
</script>

<Drawer.Root open={isOpen} onClose={handleClose}>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content class="mx-auto max-w-md">
			<Drawer.Header>
				<Drawer.Title>Add Sticker</Drawer.Title>
				<Drawer.Description>Choose a sticker to add to your canvas</Drawer.Description>
			</Drawer.Header>
			<div class="p-4">
				<UploadSticker />
			</div>
			<Drawer.Footer>
				<p class="text-xs text-muted-foreground">Click outside to close</p>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
