<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconCheck from '~icons/mdi/check';
	import IconWarning from '~icons/mdi/warning';
	import IconError from '~icons/mdi/warning-circle';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import SubmitButton from './submit-button.svelte';

	type Props = {
		children: Snippet;
		submit?: Snippet;
		enhance: Function;
		action: string;
		hasInvalid?: boolean;
		isLoading?: boolean;
		submitLabel?: string;
		warnMessage?: string;
		successMessage?: string;
		errorMessage?: string;
		className?: string;
		[key: string]: unknown;
	};
	let {
		children,
		submit,
		enhance,
		action,
		hasInvalid = false,
		isLoading = false,
		submitLabel = '',
		warnMessage = '',
		successMessage = '',
		errorMessage = '',
		className = '',
		...restProps
	}: Props = $props();

	let isEnableJS = $state(false);
	onMount(() => {
		isEnableJS = true;
	});
</script>

<form use:enhance action={removeLanguageTagFromPath(action)} {...restProps}>
	{#if warnMessage}
		<div
			class="mb-6 flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-100 p-4 text-amber-950"
		>
			<IconWarning width="24" height="24" class="shrink-0" />
			<p class="text-lg leading-snug">
				{warnMessage}
			</p>
		</div>
	{/if}
	{#if successMessage}
		<noscript>
			<div
				class="mb-6 flex items-center gap-2 rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 text-emerald-950"
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
			class="mb-6 flex items-center gap-2 rounded-lg border-2 border-red-700 bg-red-100 p-4 text-red-900"
		>
			<IconError width="24" height="24" class="shrink-0" />
			<p class="text-lg leading-snug">
				{errorMessage}
			</p>
		</div>
	{/if}

	<fieldset class="w-full {className}" disabled={isLoading ? true : undefined}>
		{@render children()}
	</fieldset>

	{#if submit}
		{@render submit()}
	{:else}
		<div class="flex flex-col items-center gap-4 sm:flex-row">
			<SubmitButton hasInvalid={hasInvalid && isEnableJS} {isLoading} className="shrink-0">
				{submitLabel}
			</SubmitButton>
			{#if successMessage}
				<div class="flex animate-hide-delay items-center gap-1 text-emerald-900">
					<IconCheck width="28" height="28" class="shrink-0" />
					<p class="text-lg leading-snug">{successMessage}</p>
				</div>
			{/if}
		</div>
	{/if}
</form>
