type FooterItem = {
	name: string;
	childs: FooterItemChild[];
};

type FooterItemChild = {
	name: string;
	href: string;
};

export const categories: FooterItem[] = [
	{
		name: 'About company',
		childs: [
			{ name: 'About', href: 'about' },
			{ name: 'Contact', href: 'contact' }
		]
	},
	{
		name: 'ShortBook',
		childs: [
			{ name: 'Term of use', href: '/policies/term' },
			{ name: 'Privacy policy', href: '/policies/privacy' }
		]
	}
];
