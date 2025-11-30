<script lang="ts">
	import Wizard from './wizard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Check, CloudUpload } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);
	let imagePreviewUrl: string | null = $state(null);
	let currentStep = $state(0);

	const steps = [
		{
			id: 'upload',
			title: 'Upload Sticker',
			description: 'Select an image file to upload'
		},
		{
			id: 'customize',
			title: 'Customize',
			description: 'Adjust sticker settings (coming soon)'
		}
	];

	function handleUploadClick() {
		fileInput?.click();
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files && files.length > 0) {
			// Revoke the previous URL if it exists
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}

			selectedFile = files[0];
			imagePreviewUrl = URL.createObjectURL(selectedFile);
			console.log('Selected file:', selectedFile);
		}
	}

	onDestroy(() => {
		// Clean up the object URL when component is destroyed
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
		}
	});
</script>

<Wizard {steps} bind:currentStep>
	{#snippet children({ currentStep, nextStep }: { currentStep: number; nextStep: () => void })}
		{#if currentStep === 0}
			<input
				type="file"
				bind:this={fileInput}
				onchange={handleFileChange}
				accept="image/*"
				class="hidden"
			/>

			{#if selectedFile && imagePreviewUrl}
				<div class="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-center">
							<img
								src={imagePreviewUrl}
								alt="Selected sticker preview"
								class="max-h-40 rounded-lg object-contain"
							/>
						</div>
						<div class="flex items-center justify-center">
							<Button variant="link" onclick={handleUploadClick}>Change</Button>
						</div>
					</div>
				</div>
				<Button onclick={nextStep} class="mt-4 w-full" size="lg">Continue</Button>
			{:else}
				<button
					onclick={handleUploadClick}
					class="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 px-8 py-16 transition-colors hover:border-gray-400 hover:bg-gray-50"
				>
					<CloudUpload class="h-16 w-16 text-gray-400" />
					<span class="text-2xl font-semibold text-gray-700">Upload Sticker</span>
					<span class="text-sm text-gray-500">Click to select an image file</span>
				</button>
			{/if}
		{:else if currentStep === 1}
			<!-- Step 2: Customize (Placeholder) -->
			<div class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
				<p class="text-gray-600">Additional customization options will be added here.</p>
				<p class="mt-2 text-sm text-gray-500">You can add size, position, and other settings.</p>
			</div>
		{/if}
	{/snippet}
</Wizard>
