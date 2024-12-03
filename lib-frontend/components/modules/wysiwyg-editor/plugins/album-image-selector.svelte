<script lang="ts">
	import { onMount } from 'svelte';
	import IconReload from '~icons/mdi/reload';
	import IconUpload from '~icons/mdi/tray-upload';
	import { env as envPublic } from '$env/dynamic/public';
	import type { AlbumImageGetResult, AlbumImageItem } from '$lib/utilities/album';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	type Props = {
		onSelect?: (albumImage: AlbumImageItem) => void;
	};
	let { onSelect }: Props = $props();

	const albumImages = $state<AlbumImageItem[]>([]);
	let page = $state(1);
	let loadDatetime = $state(Date.now());
	let albumImagesCount = $state(0);
	const maxImageSize = 224;

	async function getAlbumImages(page: number) {
		return fetch(`/api/album?limit=12&page=${page}&created-before=${loadDatetime}`)
			.then(async (res) => {
				return (await res.json()) as AlbumImageGetResult;
			})
			.catch((e: Error) => e);
	}

	function setAlbumImages(getResult: AlbumImageGetResult | Error) {
		if (!(getResult instanceof Error)) {
			albumImages.push(...getResult.albumImages);
			albumImagesCount = getResult.count;
		} else {
			console.error(getResult);
			resetList();
		}
	}

	function getImageSrc(image: AlbumImageItem, isAvif: boolean) {
		const filePath = `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${image.userId}/${image.savedFileName}`;
		const ext = isAvif ? 'avif' : image.toExtension;
		const search = `?ext=${ext}&${getImageSizeSpecify(image.width, image.height)}fit=inside&q=60`;
		return filePath + search;
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

	function resetList() {
		albumImages.splice(0);
		page = 1;
		loadDatetime = Date.now();
		albumImagesCount = 0;
	}

	async function loadFirstPage() {
		resetList();
		const result = await getAlbumImages(page);
		setAlbumImages(result);
	}

	async function loadNextPage() {
		page++;
		const result = await getAlbumImages(page);
		setAlbumImages(result);
	}

	onMount(() => {
		loadFirstPage();
	});
</script>

<div class="flex flex-wrap items-center py-2">
	<button type="button" onclick={loadFirstPage}>
		<NavLinkSmall name="Refresh list">
			<IconReload width="24" height="24" />
		</NavLinkSmall>
	</button>
	<NavLinkSmall name="Upload or manage" href="/mypage/asset/album" target="_blank">
		<IconUpload width="24" height="24" />
	</NavLinkSmall>
</div>

{#if albumImages.length > 0}
	<div class="-mx-3 mb-8 grid grid-cols-2 items-start gap-y-4 xs:grid-cols-3 md:grid-cols-4">
		{#each albumImages as image}
			<button
				class="relative p-2 pt-4 after:absolute after:left-0 after:top-0 after:h-full after:w-full after:hover:bg-stone-500/20 focus:after:bg-stone-500/20 sm:p-4 sm:pt-6"
				onclick={() => onSelect?.(image)}
			>
				<div class="relative mb-2 before:block before:pt-[100%]">
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
				<p class="line-clamp-3">{image.name}</p>
			</button>
		{/each}
	</div>
{:else}
	<p class="mb-8">No images yet.</p>
{/if}

{#if albumImagesCount > 0 && albumImages.length < albumImagesCount}
	<div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pb-4">
		<button type="button" class="rounded-lg" onclick={loadNextPage}>
			<NavLinkSmall
				name="Load more images ({albumImagesCount - albumImages.length} remain)"
				colorClass="bg-primary-200 hover:bg-primary-300 focus:bg-primary-300"
			/>
		</button>
	</div>
{/if}
