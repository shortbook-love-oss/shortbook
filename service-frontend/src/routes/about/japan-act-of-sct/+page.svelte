<script lang="ts">
	import CompanyInfoItem from '$lib/components/service/about/company-info-item.svelte';
	import * as m from '$i18n/output/messages';
	import { env as envPublic } from '$env/dynamic/public';
</script>

<svelte:head>
	<title>{m.about_sct_title()} | ShortBook</title>
</svelte:head>

<section class="mx-auto mb-16 max-w-2xl px-4 text-xl sm:px-8">
	<h1 class="mb-4 text-4xl font-bold">{m.about_sct_title()}</h1>
	<p>特定商取引に関する法律第11条「通信販売についての広告」に基づき、以下に明示いたします。</p>
	<p>この文章は日本に在住している方を対象としております。</p>
	<p>よく読み、安心して執筆ライフをお過ごしください。</p>
</section>
<CompanyInfoItem heading="対象事業">
	<p>有料記事投稿サービス「ShortBook」</p>
	<p><a href="/" target="_blank" class="text-primary-700 underline">https://shortbook.life</a></p>
</CompanyInfoItem>
<CompanyInfoItem heading="事業者名" content={m.company_name()} />
<CompanyInfoItem
	heading="通信販売に関する業務の責任者"
	content="代表社員 {m.company_chief_name()}"
/>
<CompanyInfoItem heading={m.company_address_title()} content={m.company_address()} />
<CompanyInfoItem heading="事業者へのお問い合わせ">
	<p>
		お問い合わせはフォームまたはメールでのみ受け付けております。送信後18時間以内に返信いたします。
	</p>
	<p>
		<a href="/support/contact" target="_blank" class="text-primary-700 underline"
			>お問い合わせフォーム</a
		>
	</p>
	<p>メールアドレス : {envPublic.PUBLIC_EMAIL_INQUIRY_TO}</p>
</CompanyInfoItem>
<CompanyInfoItem heading="電話番号">
	<p>営業電話を防ぐため、通常は公開しておりません。</p>
	<p>
		開示請求があった場合、事業者が公的機関への連絡に使用している電話番号を遅滞無く開示いたします。
	</p>
	<p>ただしその場合でも、サービスに関する問い合わせは受け付けておりません。</p>
</CompanyInfoItem>
<CompanyInfoItem heading="支払い方法">
	<p>クレジットカード : Visa / JCB / Mastercard / American Express / Discover / Diners Club</p>
</CompanyInfoItem>
<CompanyInfoItem heading="支払い時期">
	<p>
		商品を購入する時に料金をお支払いいただきます。事業者が支払いを自動プロセスによって確認した後、商品を入手できます。
	</p>
</CompanyInfoItem>
<CompanyInfoItem heading="販売価格と手数料">
	<p>販売価格は商品によって異なります。各商品の購入画面をご確認ください。</p>
	<p>購入時の手数料は、購入額の3.6%です。別途サービス利用手数料として4.4%が課されます。</p>
</CompanyInfoItem>
<CompanyInfoItem heading="返金について">
	<p>
		お客様はいつでも、購入した商品を返金をすることができます。ただし購入した商品を消費した場合、その分は返金できません。
	</p>
</CompanyInfoItem>
<CompanyInfoItem heading="お客様が負担するその他の費用">
	<p>
		お客様が日本に在住している場合、消費税10%が加算されます。ただしVisaまたはMastercardブランドのクレジットカードで決済する場合は、消費税が掛かりません。
	</p>
	<p>詳しくは決済サービスStripe Inc.の解説をご覧ください。</p>
	<p>
		<a
			href="https://support.stripe.com/questions/taxes-on-stripe-fees-for-businesses-in-japan?locale=ja-JP"
			target="_blank"
			class="text-primary-700 underline">日本におけるビジネスに対する日本の消費税 | Stripe</a
		>
	</p>
</CompanyInfoItem>
<CompanyInfoItem heading="サービスの推奨利用環境">
	<ul>
		<li>Windows・Mac OS・iOS・Androidにおける、Firefox・Chrome・Vivaldi・Braveの各最新版</li>
		<li>Mac Safari・iOS Safariのバージョン15.4以上</li>
	</ul>
</CompanyInfoItem>
