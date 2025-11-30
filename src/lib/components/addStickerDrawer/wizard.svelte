<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Check } from 'lucide-svelte';

	interface Step {
		id: string;
		title: string;
		description?: string;
	}

	interface WizardProps {
		steps: Step[];
		currentStep?: number;
		children?: import('svelte').Snippet<
			[
				{
					currentStep: number;
					nextStep: () => void;
					previousStep: () => void;
					canGoNext: boolean;
					canGoBack: boolean;
					isLastStep: boolean;
				}
			]
		>;
	}

	let { steps, currentStep = $bindable(0), children }: WizardProps = $props();

	const dispatch = createEventDispatcher();

	function nextStep() {
		if (currentStep < steps.length - 1) {
			currentStep++;
			dispatch('stepChange', { step: currentStep });
		}
	}

	function previousStep() {
		if (currentStep > 0) {
			currentStep--;
			dispatch('stepChange', { step: currentStep });
		}
	}

	function goToStep(index: number) {
		currentStep = index;
		dispatch('stepChange', { step: currentStep });
	}

	let canGoBack = $derived(currentStep > 0);
	let canGoNext = $derived(currentStep < steps.length - 1);
	let isLastStep = $derived(currentStep === steps.length - 1);
</script>

<div class="wizard-container">
	<!-- Step Indicators -->
	<div class="mb-3 flex items-center justify-center gap-1">
		{#each steps as step, index}
			<div class="flex items-center gap-1">
				<div
					class="flex h-6 w-6 items-center justify-center rounded-full transition-all {index ===
					currentStep
						? 'bg-blue-500 text-white'
						: index < currentStep
							? 'bg-green-500 text-white'
							: 'bg-gray-200 text-gray-500'}"
				>
					{#if index < currentStep}
						<Check class="h-3 w-3" />
					{:else}
						<span class="text-xs font-semibold">{index + 1}</span>
					{/if}
				</div>
				{#if index < steps.length - 1}
					<div
						class="h-0.5 w-4 transition-all {index < currentStep ? 'bg-green-500' : 'bg-gray-200'}"
					></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Step Title and Description -->
	<div class="mb-3 text-center">
		<h3 class="text-base font-semibold text-gray-900">{steps[currentStep].title}</h3>
		{#if steps[currentStep].description}
			<p class="text-xs text-gray-600">{steps[currentStep].description}</p>
		{/if}
	</div>

	<!-- Step Content -->
	<div class="wizard-content">
		{@render children?.({ currentStep, nextStep, previousStep, canGoNext, canGoBack, isLastStep })}
	</div>
</div>

<style>
	.wizard-container {
		/* Mobile: 60vh minimum height */
		min-height: 60vh;
	}

	/* Desktop: 600px minimum height */
	@media (min-width: 768px) {
		.wizard-container {
			min-height: 600px;
		}
	}
</style>
