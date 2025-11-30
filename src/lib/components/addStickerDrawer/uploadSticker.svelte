<script lang="ts">
	import Wizard from './wizard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CloudUpload } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { removeBackground } from '@imgly/background-removal';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { uploadSticker } from '$lib/remote/stickers.remote';

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);
	let imagePreviewUrl: string | null = $state(null);
	let currentStep = $state(0);

	let removeBackgroundLoading: boolean = $state(false);
	let removedBackgroundImageUrl: string | null = $state(null);

	let uploadStickerLoading: boolean = $state(false);

	const steps = [
		{
			id: 'upload',
			title: 'Upload Sticker',
			description: 'Select an image file to upload'
		},
		{
			id: 'cleanup',
			title: 'Remove Background',
			description: 'Remove the background of the sticker'
		},
		{
			id: 'info',
			title: 'Info',
			description: 'Add sticker information'
		},
		{
			id: 'upload',
			title: 'Upload',
			description: 'Time to upload your sticker to the canvas'
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
		}
	}

	function doRemoveBackground() {
		removeBackgroundLoading = true;
		removeBackground(selectedFile)
			.then((result) => {
				removeBackgroundLoading = false;
				const imageUrl = URL.createObjectURL(result);
				removedBackgroundImageUrl = imageUrl;
				console.log('Background removed', result);
			})
			.catch((error) => {
				removeBackgroundLoading = false;
				console.error('Error removing background', error);
			});
		console.log('Removing background');
	}

	async function doUploadSticker() {
		let uploadStickerLoading = true;
		const result = await uploadSticker({ x: 0, y: 0 });
		uploadStickerLoading = false;
		console.log('Upload sticker result', result);
	}

	onDestroy(() => {
		// Clean up the object URL when component is destroyed
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
		}
		if (removedBackgroundImageUrl) {
			URL.revokeObjectURL(removedBackgroundImageUrl);
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

			{#if selectedFile && imagePreviewUrl && !removeBackgroundLoading}
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
				<Button
					onclick={() => {
						nextStep();
						doRemoveBackground();
					}}
					disabled={!selectedFile}
					class="mt-4 w-full"
					size="lg">Continue</Button
				>
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
			{#if removeBackgroundLoading}
				<Spinner />
			{:else}
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-center">
						<img
							src={removedBackgroundImageUrl}
							alt="Removed background"
							class="max-h-96 w-full rounded-lg object-contain"
						/>
					</div>
					<Button onclick={() => nextStep()} class="w-full" size="lg">Continue</Button>
				</div>
			{/if}
		{:else if currentStep === 2}
			<!-- Info step content goes here -->
			<div class="flex flex-col gap-4">
				<p class="text-center text-gray-500">Info step content coming soon...</p>
				<Button onclick={() => nextStep()}>Continue</Button>
			</div>
		{:else if currentStep === 3}
			<!-- Upload step content goes here -->
			<div class="flex flex-col gap-4">
				<p class="text-center text-gray-500">
					<Button onclick={() => doUploadSticker()}>Upload</Button>
				</p>
			</div>
		{/if}
	{/snippet}
</Wizard>
