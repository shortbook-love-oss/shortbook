<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconCheck from '~icons/mdi/check';
	import { enhance as kitEnhance } from '$app/forms';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import MessageError from '$lib/components/modules/information/message-error.svelte';
	import MessageSuccess from '$lib/components/modules/information/message-success.svelte';
	import MessageWarning from '$lib/components/modules/information/message-warning.svelte';

	type Props = {
		children: Snippet;
		submit?: Snippet;
		enhance: (el: HTMLFormElement) => ReturnType<typeof kitEnhance>;
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
	onMount(() => (isEnableJS = true));
</script>

<form use:enhance action={removeLanguageTagFromPath(action)} {...restProps}>
	<noscript>
		<MessageSuccess message={successMessage} className="mb-6" />
	</noscript>
	<MessageError message={errorMessage} className="mb-6" />
	<MessageWarning message={warnMessage} className="mb-6" />

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
