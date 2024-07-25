import * as m from '$lib/i18n/paraglide/messages';

type FooterItem = {
	name: string;
	childs: FooterItemChild[];
};

type FooterItemChild = {
	name: string;
	href: string;
};

export function categories(languageTag: string): FooterItem[] {
	return [
		{
			name: m.footer_about_company_heading({ languageTag }),
			childs: [
				{ name: m.footer_about_company_about({ languageTag }), href: '/about' },
				{
					name: m.footer_about_company_contact({ languageTag }),
					href: 'https://www.linkedin.com/in/kurachiweb/'
				}
			]
		},
		{
			name: m.footer_about_shortbook_heading({ languageTag }),
			childs: [
				{ name: m.footer_about_shortbook_term({ languageTag }), href: '/policies/term' },
				{ name: m.footer_about_shortbook_privacy({ languageTag }), href: '/policies/privacy' }
			]
		}
	];
}
