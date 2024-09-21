<script lang="ts">
	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import * as m from '$i18n/output/messages';
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
<CompanyInfoItem heading={m.company_name_title()} content={m.company_name()} />
<CompanyInfoItem heading={m.company_invoice_number_title()} content={m.company_invoice_number()} />
<CompanyInfoItem heading={m.company_address_title()} content={m.company_address()} />
<CompanyInfoItem heading={m.company_chief_name_title()} content={m.company_chief_name()} />
<CompanyInfoItem heading={m.company_found_date_title()} content={m.company_found_date()} />
<CompanyInfoItem heading={m.company_capital_title()} content={m.company_capital()} />
<CompanyInfoItem
	heading={m.company_business_content_title()}
	content={m.company_business_content()}
/>
