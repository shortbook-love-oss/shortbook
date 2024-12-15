<script lang="ts">
	import * as m from '$i18n/output/messages';
	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';
</script>

<svelte:head>
	<title>{m.about_company_page_title()} | ShortBook</title>
	<Ogp pageType="website" title="ShortBook — {m.about_company_page_title()}" />
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
<CompanyInfoItem heading={m.about_company_name_title()} content={m.about_company_name()} />
<CompanyInfoItem
	heading={m.about_company_invoice_number_title()}
	content={m.about_company_invoice_number()}
/>
<CompanyInfoItem heading={m.about_company_address_title()} content={m.about_company_address()} />
<CompanyInfoItem
	heading={m.about_company_chief_name_title()}
	content={m.about_company_chief_name()}
/>
<CompanyInfoItem
	heading={m.about_company_found_date_title()}
	content={m.about_company_found_date()}
/>
<CompanyInfoItem heading={m.about_company_capital_title()} content={m.about_company_capital()} />
<CompanyInfoItem
	heading={m.about_company_business_content_title()}
	content={m.about_company_business_content()}
/>
