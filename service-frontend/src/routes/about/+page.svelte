<script>
	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import * as m from '$lib/i18n/paraglide/messages.js';
</script>

<svelte:head>
	<title>About | ShortBook</title>
</svelte:head>

<div class="mb-32 flex w-full items-center justify-between">
	<section class="p-4 sm:p-8 lg:px-16">
		<h1 class="text-5xl font-bold sm:text-6xl">ShortBook</h1>
	</section>
	<img
		src="/assets/about/books-stand.jpg"
		class="hidden w-1/2 rounded-lg md:block"
		alt="index.about_sb.image_alt"
	/>
</div>
<CompanyInfoItem heading="会社名" content={m.company_name()} />
<CompanyInfoItem heading="適格請求書発行事業者の登録番号" content="T8180303006124" />
<CompanyInfoItem heading="所在地" content="〒444-0326 愛知県西尾市富山町於三28番地15" />
<CompanyInfoItem heading="代表者" content="倉地 俊輔" />
<CompanyInfoItem heading="設立日" content="2024年5月中予定" />
<CompanyInfoItem heading="資本金" content="50万円" />
<CompanyInfoItem
	heading="事業内容"
	content="インターネット附随サービス業 - ShortBookの企画・開発・運営・顧客対応"
/>
