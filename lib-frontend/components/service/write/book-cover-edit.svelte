<script lang="ts">
	import IconEdit from '~icons/mdi/edit-outline';
	import { bookTextAlignSelect } from '$lib/utilities/book';
	import type { BookCover as BookCoverProp } from '$lib/utilities/book';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Color from '$lib/components/modules/form/color.svelte';
	import Range from '$lib/components/modules/form/range.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';

	type PropErrors = { [P in keyof BookCoverProp]: string[] | undefined };
	interface Errors extends Partial<PropErrors> {
		_errors?: string[] | undefined;
	}

	type Props = {
		penName: string;
		errors?: Errors;
		className?: string;
	} & BookCoverProp;
	let {
		baseColorStart = $bindable(),
		baseColorEnd = $bindable(),
		baseColorDirection = $bindable(),
		titleFontSize = $bindable(),
		titleAlign = $bindable(),
		titleColor = $bindable(),
		subtitleFontSize = $bindable(),
		subtitleAlign = $bindable(),
		subtitleColor = $bindable(),
		writerAlign = $bindable(),
		writerColor = $bindable(),
		title,
		subtitle,
		penName,
		errors = {},
		className = ''
	}: Props = $props();

	let previewWidth = $state(256);

	let bookCover = $derived<BookCoverProp>({
		baseColorStart,
		baseColorEnd,
		baseColorDirection,
		titleFontSize,
		titleAlign,
		titleColor,
		subtitleFontSize,
		subtitleAlign,
		subtitleColor,
		writerAlign,
		writerColor,
		title,
		subtitle
	});
</script>

<Dialog
	name="book-preview"
	title="Cover editor"
	openerClass={className}
	dialogSizeClass="max-w-3xl"
>
	{#snippet opener()}
		<div class="flex flex-col items-center gap-4 p-4 xs:flex-row">
			<div class="mx-auto cursor-pointer" aria-hidden="true">
				<BookCover book={bookCover} {penName} width={160} />
			</div>
			<div class="mx-auto w-fit rounded-lg border-2 border-primary-700">
				<NavLinkSmall name="Edit cover">
					<IconEdit width="24" height="24" class="-me-1" />
				</NavLinkSmall>
			</div>
		</div>
	{/snippet}

	<div class="flex flex-wrap gap-8">
		<div
			class="w-64 flex-1 md:w-96 lg:w-[32rem]"
			bind:clientWidth={previewWidth}
			aria-hidden="true"
		>
			<BookCover book={bookCover} {penName} width={previewWidth} />
		</div>
		<div>
			<!-- Background -->
			<Range
				min="0"
				max="360"
				step="3"
				bind:value={baseColorDirection}
				name="baseColorDirection"
				label="Gradation direction"
				errorMessages={errors.baseColorDirection}
				className="mb-4"
				inputClass="min-w-60"
			/>
			<Color
				bind:value={baseColorStart}
				name="baseColorStart"
				label="Background color start"
				errorMessages={errors.baseColorStart}
				className="mb-4"
			/>
			<Color
				bind:value={baseColorEnd}
				name="baseColorEnd"
				label="Background color end"
				errorMessages={errors.baseColorEnd}
				className="mb-4"
			/>
			<!-- Title -->
			<Range
				min="32"
				max="256"
				bind:value={titleFontSize}
				name="titleFontSize"
				label="Title font size"
				errorMessages={errors.titleFontSize}
				className="mb-4"
				inputClass="min-w-60"
			/>
			<Select
				bind:value={titleAlign as string | number}
				name="titleAlign"
				list={bookTextAlignSelect}
				label="Title align"
				errorMessages={errors.titleAlign}
				className="mb-4"
			/>
			<Color
				bind:value={titleColor}
				name="titleColor"
				label="Title text color"
				errorMessages={errors.titleColor}
				className="mb-4"
			/>
			<!-- Subtitle -->
			<Range
				min="32"
				max="128"
				bind:value={subtitleFontSize}
				name="subtitleFontSize"
				label="Subtitle font size"
				errorMessages={errors.subtitleFontSize}
				className="mb-4"
				inputClass="min-w-60"
			/>
			<Select
				bind:value={subtitleAlign as string | number}
				name="subtitleAlign"
				list={bookTextAlignSelect}
				label="Subtitle align"
				errorMessages={errors.subtitleAlign}
				className="mb-4"
			/>
			<Color
				bind:value={subtitleColor}
				name="subtitleColor"
				label="Subtitle text color"
				errorMessages={errors.subtitleColor}
				className="mb-4"
			/>
			<!-- Pen name -->
			<Select
				bind:value={writerAlign as string | number}
				name="writerAlign"
				list={bookTextAlignSelect}
				label="Pen name align"
				errorMessages={errors.writerAlign}
				className="mb-4"
			/>
			<Color
				bind:value={writerColor}
				name="writerColor"
				label="Pen name text color"
				errorMessages={errors.writerColor}
				className="mb-4"
			/>
		</div>
	</div>
</Dialog>
