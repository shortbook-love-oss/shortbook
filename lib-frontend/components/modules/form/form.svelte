<script lang="ts">
	import IconCheck from '~icons/mdi/check';
	import IconError from '~icons/mdi/warning-circle';
	import SubmitButton from './submit-button.svelte';

	export let enhance: Function;
	export let isLoading = false;
	export let submitLabel = 'Save';
	export let successMessage = '';
	export let errorMessage = '';
</script>

<form use:enhance {...$$restProps}>
	{#if successMessage}
		<noscript>
			<div
				class="mb-6 flex items-center gap-1 rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 text-emerald-950"
			>
				<IconCheck width="24" height="24" class="shrink-0" />
				<p class="text-lg leading-snug">
					{successMessage}
				</p>
			</div>
		</noscript>
	{/if}
	{#if errorMessage}
		<div
			class="mb-6 flex items-center gap-1 rounded-lg border-2 border-primary-700 bg-red-100 p-4 text-red-900"
		>
			<IconError width="24" height="24" class="shrink-0" />
			<p class="text-lg leading-snug">
				{errorMessage}
			</p>
		</div>
	{/if}
	<fieldset disabled={isLoading ? true : undefined}>
		<slot />
	</fieldset>
	<slot name="submit">
		<div class="flex flex-col items-center gap-4 sm:flex-row">
			<SubmitButton {isLoading} className="shrink-0">{submitLabel}</SubmitButton>
			{#if successMessage}
				<div class="animate-hide-delay flex items-center gap-1 text-emerald-900">
					<IconCheck width="28" height="28" class="shrink-0" />
					<p class="text-lg leading-snug">{successMessage}</p>
				</div>
			{/if}
		</div>
	</slot>
</form>
