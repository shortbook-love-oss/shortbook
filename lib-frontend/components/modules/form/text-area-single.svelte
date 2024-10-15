<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';

	type Props = {
		value: string;
		name: string;
		required?: boolean;
		errorMessages?: string[] | ValidationErrors<Record<string, unknown>>;
		className?: string;
		inputClass?: string;
		[key: string]: unknown;
	};
	let {
		value = $bindable(),
		name,
		required = false,
		errorMessages,
		className = '',
		inputClass = '',
		...restProps
	}: Props = $props();

	function removeBreak(event: InputEvent) {
		if (!event.isComposing) {
			value = value.replace(/\n/g, '');
		}
	}
</script>

<div class={className}>
	<div class="relative">
		<!-- "textarea" height is the same as inner content height -->
		<textarea
			{...restProps}
			{name}
			{required}
			bind:value
			class="overflow-none absolute start-0 top-0 block h-full w-full resize-none outline-none placeholder:text-stone-400 disabled:bg-stone-100 disabled:text-stone-500 [&:user-invalid]:border-b-2 [&:user-invalid]:border-red-700 {errorMessages?.length
				? 'border-b-2 border-red-700'
				: ''} {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
			oninput={(e) => removeBreak(e as unknown as InputEvent)}
		></textarea>
		<div
			class="select-none whitespace-pre-wrap break-words break-all {inputClass}"
			aria-hidden="true"
			translate="no"
		>
			{value + '\u200b'}
		</div>
	</div>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</div>
