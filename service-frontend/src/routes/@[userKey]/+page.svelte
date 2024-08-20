<script lang="ts">
	import IconEdit from '~icons/mdi/edit-outline';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookItem from '$lib/components/service/read/book-item.svelte';

	export let data;
</script>

<svelte:head>
	<title>Profile and books | {data.user.profiles?.key_name}</title>
</svelte:head>

<div
	class="mx-auto mb-16 flex max-w-5xl flex-col gap-8 max-sm:items-center sm:flex-row sm:justify-center"
>
	<div class="w-80 max-w-full shrink-0 sm:max-md:w-72">
		<section
			class="flex min-h-[27rem] w-full flex-col items-center rounded-lg bg-gradient-to-b from-primary-800 to-primary-600 p-4 pb-5 text-white md:min-h-[30rem]"
		>
			<h1 class="mb-1 max-w-full whitespace-pre-wrap break-words text-2xl">
				{data.profileLang?.pen_name}
			</h1>
			<p class="mb-3 max-w-full break-words">@{data.user.profiles?.key_name}</p>
			{#if data.profileLang?.headline}
				<p class="mb-4 max-w-full whitespace-pre-wrap break-words text-lg">
					{data.profileLang.headline}
				</p>
			{/if}
			<img
				src="{data.user.image}?w=128&h=128&fit=cover"
				class="mb-4 h-32 w-32 rounded-md"
				alt="{data.profileLang?.headline} profile image"
			/>
			{#if data.isOwn}
				<NavLinkSmall
					name="Edit profile"
					href="/mypage/personnel/profile"
					colorClass="border-2 bg-primary-600 border-white hover:bg-primary-700 focus:bg-primary-700"
				>
					<IconEdit width="24" height="24" class="-mx-1" />
				</NavLinkSmall>
			{/if}
		</section>
	</div>
	<div
		class="w-full flex-1 overflow-x-hidden rounded-lg bg-gradient-to-b from-primary-800 to-primary-600 p-1 text-lg {data
			.profileLang?.self_introduction
			? ''
			: 'hidden'}"
	>
		<div
			class="article_content h-full overflow-y-hidden whitespace-pre-wrap break-words rounded bg-white p-3"
		>
			{@html data.userSelfIntro}
		</div>
	</div>
</div>

<div class="mx-auto max-w-[108rem]">
	<h2 class="mb-8 text-2xl font-semibold">Recent books</h2>
	{#if data.bookList.length}
		<ul>
			{#each data.bookList as book (book.id)}
				<li class="mb-16">
					<BookItem
						{book}
						penName={book.penName}
						requestLang={data.requestLang}
						className="w-full"
					/>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Not written yet.</p>
	{/if}
</div>
