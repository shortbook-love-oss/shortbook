<script>
	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import Footer from '$lib/components/service/footer.svelte';
	import * as m from '$lib/i18n/paraglide/messages.js';
</script>

<svelte:head>
	<title>About | ShortBook</title>
</svelte:head>

<div>
	<main>
		<a href="/" class="mx-auto my-4 block w-48">
			<img src="/shortbook-logotype.svg" class="w-full" alt="common.logo_alt" />
		</a>
		<div class="mb-32 flex w-full items-center justify-between">
			<section class="p-8 lg:px-16">
				<h1 class="text-6xl font-bold">"about.page_title"</h1>
			</section>
			<img
				src="/about/books-stand.jpg"
				class="hidden w-1/2 rounded-l-lg md:block"
				alt="index.about_sb.image_alt"
			/>
		</div>
		<CompanyInfoItem heading="会社名" content={m.company_name()} />
		<CompanyInfoItem heading="所在地" content="〒444-0326 愛知県西尾市富山町於三28番地15" />
		<CompanyInfoItem heading="代表者" content="倉地 俊輔" />
		<CompanyInfoItem heading="設立日" content="2024年5月中予定" />
		<CompanyInfoItem heading="資本金" content="50万円" />
		<CompanyInfoItem
			heading="事業内容"
			content="インターネット附随サービス業 - ShortBookの企画・開発・運営・顧客対応"
		/>
	</main>
	<Footer />
</div>
