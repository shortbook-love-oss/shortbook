<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user/currency-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import { getCurrencyData, type CurrencySupportCodes } from '$lib/utilities/currency';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema)
	});
	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	const currencyData = getCurrencyData(data.suggestCurrency);
	function setCurrency(currencyCode: CurrencySupportCodes) {
		$form.currencyCode = currencyCode;
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
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
>
	<div class="mb-8 flex flex-col items-start gap-4">
		<Select
			bind:value={$form.currencyCode as string}
			name="currencyCode"
			list={data.currencyList}
			label="Payment currency"
			errorMessages={$errors.currencyCode}
			className="max-w-96"
		/>
		{#if isEnableJS && currencyData}
			<button
				type="button"
				class="text-lg underline"
				onclick={() => setCurrency(currencyData.value)}
			>
				Suggest: set to {currencyData.label}
			</button>
		{/if}
	</div>
</Form>
