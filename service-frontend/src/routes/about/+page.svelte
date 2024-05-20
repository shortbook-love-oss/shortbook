<script lang="ts">
	import { t } from '$lib/translations/translations';

	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import Footer from '$lib/components/service/footer.svelte';
</script>

<svelte:head>
	<title>{$t('about.page_title')} | ShortBook</title>
</svelte:head>

<div>
	<main>
		<a href="/" class="mx-auto my-4 block w-48">
			<img src="/shortbook-logotype.svg" class="w-full" alt={$t('common.logo_alt')} />
		</a>
		<div class="mb-32 flex w-full items-center justify-between">
			<section class="p-8 lg:px-16">
				<h1 class="text-6xl font-bold">{$t('about.page_title')}</h1>
			</section>
			<img
				src="/about/books-stand.jpg"
				class="hidden w-1/2 rounded-l-lg md:block"
				alt={$t('index.about_sb.image_alt')}
			/>
		</div>
		<CompanyInfoItem heading="会社名" content="合同会社ShortBook" />
		<CompanyInfoItem heading="所在地" content="〒444-0326 愛知県西尾市富山町於三28番地15" />
		<CompanyInfoItem heading="代表者" content="倉地 俊輔" />
		<CompanyInfoItem heading="設立日" content="2024年5月中予定" />
		<CompanyInfoItem heading="資本金" content="50万円" />
		<CompanyInfoItem
			heading="事業内容"
			content="インターネット附随サービス業 - ShortBookの企画・開発・運営・顧客対応"
		/>
		<!-- 会社名	株式会社月華堂 （英語名 Gekkado Inc.）
所在地	〒930-0007
富山県富山市宝町1-3-14　太陽生命富山ビル 9階
法人番号	6250001016601
適格請求書発行
事業者登録番号	T6250001016601
連絡先	
設立	2017年5月15日
資本金	5,000,000円
代表者	北村　久雄
事業内容	WEBシステムの設計・開発
スマートフォンアプリの設計・開発
自社サービスの企画・運営、その他関連事業 -->
	</main>
	<Footer />
</div>
