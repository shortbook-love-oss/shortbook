<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user/currency-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import { getCurrencyData, type CurrencySupportKeys } from '$lib/utilities/currency';

	export let data;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema)
	});
	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	let isEnableJS = false;
	onMount(() => (isEnableJS = true));

	const currencyData = getCurrencyData(data.suggestCurrency);
	function setCurrency(currencyKey: CurrencySupportKeys) {
		$form.currencyKey = currencyKey;
	}
</script>

<svelte:head>
	<title>Change currency | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Change currency</h1>
<Form
	method="POST"
	action={$page.url.pathname}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Save currency"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<div class="mb-8 flex flex-wrap items-end gap-3">
		<Select
			bind:value={$form.currencyKey}
			name="currencyKey"
			list={data.currencyList}
			label="Payment currency"
			errorMessages={$errors.currencyKey}
			className="max-w-64"
		/>
		{#if isEnableJS && currencyData}
			<button
				type="button"
				class="rounded border border-primary-700 bg-primary-100 px-3 py-1.5 text-lg hover:bg-primary-200 focus:bg-primary-200"
				on:click={() => setCurrency(currencyData.key)}
			>
				Set to {currencyData.label}
			</button>
		{/if}
	</div>
</Form>
