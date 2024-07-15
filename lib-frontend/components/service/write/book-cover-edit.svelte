<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IconEdit from '~icons/mdi/edit-outline';
	import { bookFontSizeSelect, bookTextAlignSelect } from '$lib/utilities/book';
	import type { BookCover as BookCoverProp } from '$lib/utilities/book';
	import Select from '$lib/components/modules/form/select.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Color from '$lib/components/modules/form/color.svelte';
	import Range from '$lib/components/modules/form/range.svelte';
	import NavLinkSmall from '../navigation/nav-link-small.svelte';

	type PropErrors = { [P in keyof BookCoverProp]: string[] | undefined };
	interface Errors extends Partial<PropErrors> {
		_errors?: string[] | undefined;
	}

	export let book: BookCoverProp;
	export let penName: string;
	export let errors: Errors = {};
	export let className = '';

	let previewWidth = 256;

	const dispatch = createEventDispatcher();
	function applyChanges() {
		requestAnimationFrame(() => {
			dispatch('input', { book });
		});
	}
</script>

<Dialog name="book-preview" title="Cover editor" dialogSizeClass="max-w-3xl">
	<div
		slot="opener"
		class="flex flex-col items-center gap-4 p-4 sm:flex-row lg:flex-col {className}"
	>
		<div class="mx-auto" aria-hidden="true">
			<BookCover {book} {penName} width={160} />
		</div>
		<div class="mx-auto w-fit rounded-lg border-2 border-primary-700">
			<NavLinkSmall name="Edit cover">
				<IconEdit width="24" height="24" class="-me-1" />
			</NavLinkSmall>
		</div>
	</div>

	<div class="flex flex-col gap-8 sm:flex-row">
		<div
			class="w-64 flex-1 md:w-96 lg:w-[32rem]"
			bind:clientWidth={previewWidth}
			aria-hidden="true"
		>
			<BookCover {book} {penName} width={previewWidth} />
		</div>
		<div>
			<!-- Background -->
			<Range
				min="0"
				max="360"
				step="3"
				bind:value={book.baseColorDirection}
				name="baseColorDirection"
				label="Gradation direction"
				errorMessages={errors.baseColorDirection}
				className="mb-4"
				inputClass="min-w-60"
				on:input={applyChanges}
			/>
			<Color
				bind:value={book.baseColorStart}
				name="baseColorStart"
				label="Background color start"
				errorMessages={errors.baseColorStart}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Color
				bind:value={book.baseColorEnd}
				name="baseColorEnd"
				label="Background color end"
				errorMessages={errors.baseColorEnd}
				className="mb-4"
				on:input={applyChanges}
			/>
			<!-- Title -->
			<Select
				bind:value={book.titleFontSize}
				name="titleFontSize"
				list={bookFontSizeSelect}
				label="Title font size"
				errorMessages={errors.titleFontSize}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Select
				bind:value={book.titleAlign}
				name="titleAlign"
				list={bookTextAlignSelect}
				label="Title align"
				errorMessages={errors.titleAlign}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Color
				bind:value={book.titleColor}
				name="titleColor"
				label="Title text color"
				errorMessages={errors.titleColor}
				className="mb-4"
				on:input={applyChanges}
			/>
			<!-- Subtitle -->
			<Select
				bind:value={book.subtitleFontSize}
				name="subtitleFontSize"
				list={bookFontSizeSelect}
				label="Subtitle font size"
				errorMessages={errors.subtitleFontSize}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Select
				bind:value={book.subtitleAlign}
				name="subtitleAlign"
				list={bookTextAlignSelect}
				label="Subtitle align"
				errorMessages={errors.subtitleAlign}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Color
				bind:value={book.subtitleColor}
				name="subtitleColor"
				label="Subtitle text color"
				errorMessages={errors.subtitleColor}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Select
				bind:value={book.writerAlign}
				name="writerAlign"
				list={bookTextAlignSelect}
				label="Pen name align"
				errorMessages={errors.writerAlign}
				className="mb-4"
				on:input={applyChanges}
			/>
			<Color
				bind:value={book.writerColor}
				name="writerColor"
				label="Pen name text color"
				errorMessages={errors.writerColor}
				className="mb-4"
				on:input={applyChanges}
			/>
		</div>
	</div>
</Dialog>
