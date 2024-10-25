<script lang="ts">
	import { onMount } from 'svelte';
	import { env as envPublic } from '$env/dynamic/public';
	import type { AlbumImageGetResult, AlbumImageItem } from '$lib/utilities/album';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	type Props = {
		onSelect?: (albumImage: AlbumImageItem) => void;
	};
	let { onSelect }: Props = $props();

	const albumImages = $state<AlbumImageItem[]>([]);
	let page = $state(0);
	let isLastPage = $state(false);
	const maxImageSize = 224;

	async function getAlbumImages(page: number) {
		return fetch(`/api/album?limit=12&page=${page}`)
			.then(async (res) => {
				return (await res.json()) as AlbumImageGetResult;
			})
			.catch((e: Error) => e);
	}

	function setAlbumImages(getResult: AlbumImageGetResult | Error) {
		if (!(getResult instanceof Error)) {
			albumImages.push(...getResult.albumImages);
			isLastPage = getResult.isLastPage;
		} else {
			console.error(getResult);
			albumImages.splice(0);
			isLastPage = false;
		}
	}

	function getImageSrc(image: AlbumImageItem, isAvif: boolean) {
		const base = `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${image.userId}/${image.filePath}`;
		const ext = isAvif ? 'avif' : image.toExtension;
		const search = `?ext=${ext}&${getImageSizeSpecify(image.width, image.height)}fit=inside&q=60`;
		return base + search;
	}

	function getImageSizeSpecify(width: number, height: number) {
		if (width <= maxImageSize && height <= maxImageSize) {
			// width=150, height=75 ... w="", h="" (keep original size)
			// width=75, height=150 ... w="", h="" (keep original size)
			return '';
		} else {
			if (width > height) {
				// width=300, height=150 ... w="224", h="" (full-width and same aspect)
				// width=600, height=300 ... w="224", h="" (full-width and same aspect)
				return `w=${maxImageSize}&`;
			} else {
				// width=150, height=300 ... w="", h="224" (full-height and same aspect)
				// width=300, height=600 ... w="", h="224" (full-height and same aspect)
				return `h=${maxImageSize}&`;
			}
		}
	}

	async function loadNextPage() {
		page++;
		const result = await getAlbumImages(page);
		setAlbumImages(result);
	}

	onMount(() => {
		loadNextPage();
	});
</script>

{#if albumImages.length > 0}
	<div
		class="grid grid-cols-2 items-start gap-x-4 gap-y-8 xs:grid-cols-3 xs:gap-x-8 xs:px-4 md:grid-cols-4"
	>
		{#each albumImages as image}
			<button onclick={() => onSelect?.(image)}>
				<div class="relative before:block before:pt-[100%]">
					<picture>
						<source srcset={getImageSrc(image, true)} type="image/avif" />
						<img
							src={getImageSrc(image, false)}
							alt={image.alt}
							width={image.width}
							height={image.height}
							class="absolute start-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2"
						/>
					</picture>
				</div>
				<p class="mt-2 line-clamp-3">{image.name}</p>
			</button>
		{/each}
	</div>
{:else}
	<p>No images yet.</p>
{/if}

{#if !isLastPage}
	<div class="flex justify-center">
		<button type="button" class="mt-8 rounded-lg" onclick={loadNextPage}>
			<NavLinkSmall
				name="Load more images"
				colorClass="bg-primary-200 hover:bg-primary-300 focus:bg-primary-300"
			/>
		</button>
	</div>
{/if}
