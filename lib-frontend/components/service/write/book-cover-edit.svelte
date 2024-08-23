<script lang="ts">
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

	type Props = {
		oninput: Function;
		book: BookCoverProp;
		penName: string;
		errors?: Errors;
		className?: string;
	};
	let { oninput, book, penName, errors = {}, className = '' }: Props = $props();

	let previewWidth = $state(256);

	function applyChanges() {
		requestAnimationFrame(() => {
			oninput(book);
		});
	}
</script>

<Dialog name="book-preview" title="Cover editor" dialogSizeClass="max-w-3xl">
	{#snippet opener()}
		<div class="flex flex-col items-center gap-4 p-4 sm:flex-row lg:flex-col {className}">
			<div class="mx-auto" aria-hidden="true">
				<BookCover {book} {penName} width={160} />
			</div>
			<div class="mx-auto w-fit rounded-lg border-2 border-primary-700">
				<NavLinkSmall name="Edit cover">
					<IconEdit width="24" height="24" class="-me-1" />
				</NavLinkSmall>
			</div>
		</div>
	{/snippet}

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
			<!-- svelte-ignore binding_property_non_reactive -->
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
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Color
				bind:value={book.baseColorStart}
				name="baseColorStart"
				label="Background color start"
				errorMessages={errors.baseColorStart}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Color
				bind:value={book.baseColorEnd}
				name="baseColorEnd"
				label="Background color end"
				errorMessages={errors.baseColorEnd}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- Title -->
			<!-- svelte-ignore binding_property_non_reactive -->
			<Select
				bind:value={book.titleFontSize}
				name="titleFontSize"
				list={bookFontSizeSelect}
				label="Title font size"
				errorMessages={errors.titleFontSize}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Select
				bind:value={book.titleAlign}
				name="titleAlign"
				list={bookTextAlignSelect}
				label="Title align"
				errorMessages={errors.titleAlign}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Color
				bind:value={book.titleColor}
				name="titleColor"
				label="Title text color"
				errorMessages={errors.titleColor}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- Subtitle -->
			<!-- svelte-ignore binding_property_non_reactive -->
			<Select
				bind:value={book.subtitleFontSize}
				name="subtitleFontSize"
				list={bookFontSizeSelect}
				label="Subtitle font size"
				errorMessages={errors.subtitleFontSize}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Select
				bind:value={book.subtitleAlign}
				name="subtitleAlign"
				list={bookTextAlignSelect}
				label="Subtitle align"
				errorMessages={errors.subtitleAlign}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Color
				bind:value={book.subtitleColor}
				name="subtitleColor"
				label="Subtitle text color"
				errorMessages={errors.subtitleColor}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Select
				bind:value={book.writerAlign}
				name="writerAlign"
				list={bookTextAlignSelect}
				label="Pen name align"
				errorMessages={errors.writerAlign}
				className="mb-4"
				oninput={applyChanges}
			/>
			<!-- svelte-ignore binding_property_non_reactive -->
			<Color
				bind:value={book.writerColor}
				name="writerColor"
				label="Pen name text color"
				errorMessages={errors.writerColor}
				className="mb-4"
				oninput={applyChanges}
			/>
		</div>
	</div>
</Dialog>
