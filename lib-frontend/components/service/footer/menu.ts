import type { AvailableLanguageTags } from '$lib/utilities/language';
import * as m from '$i18n/output/messages';

type FooterItem = {
	name: string;
	childs: FooterItemChild[];
};

type FooterItemChild = {
	name: string;
	href: string;
};

export function categories(languageTag: AvailableLanguageTags): FooterItem[] {
	return [
		{
			name: m.footer_about_shortbook_heading({ languageTag }),
			childs: [
				{ name: m.footer_about_shortbook_about({ languageTag }), href: '/about' },
				{ name: m.footer_about_shortbook_term({ languageTag }), href: '/policies/term' },
				{ name: m.footer_about_shortbook_privacy({ languageTag }), href: '/policies/privacy' },
				...(languageTag === 'ja'
					? [{ name: '特定商取引法に基づく表記', href: '/about/japan-act-of-sct' }]
					: [])
			]
		},
		{
			name: m.footer_about_company_heading({ languageTag }),
			childs: [
				{ name: m.footer_about_company_about({ languageTag }), href: '/about/company' },
				{ name: m.footer_about_company_contact({ languageTag }), href: '/support/contact' }
			]
		}
	];
}
