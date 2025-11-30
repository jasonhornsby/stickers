<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';

	let { selectedImageId = $bindable(null) }: { selectedImageId: string | null } = $props();

	$inspect('selectedImageId:', selectedImageId);
	let isOpen = $state(false);

	$effect(() => {
		if (selectedImageId !== null) {
			isOpen = true;
		} else {
			isOpen = false;
		}
	});
</script>

<Drawer.Root open={isOpen} onClose={() => (selectedImageId = null)}>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content class="mx-auto max-w-md">
			<Drawer.Header>
				<Drawer.Title>Image Details</Drawer.Title>
				<Drawer.Description>ID: {selectedImageId || 'None'}</Drawer.Description>
			</Drawer.Header>
			<div class="p-4">
				<p class="text-sm text-muted-foreground">
					This is placeholder content for the drawer. You can add more details about the selected
					image here.
				</p>
			</div>
			<Drawer.Footer>
				<p class="text-xs text-muted-foreground">Selected ID: {selectedImageId}</p>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
