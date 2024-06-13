type MypageItem = {
  name: string;
  href: string;
  childs: Omit<MypageItem, 'childs'>[];
}

export const categories: MypageItem[] = [
	{
		name: 'Personnel information',
		href: 'personnel',
		childs: [
			{ name: 'Public profile', href: 'profile' },
			{ name: 'Translate languages', href: 'languages' }
		]
	},
	{
		name: 'Sign in & security',
		href: 'security',
		childs: [
			{ name: 'Sign in methods', href: 'methods' },
			{ name: 'Danger action', href: 'danger' }
		]
	},
	{
		name: 'Payment & point',
		href: 'payment',
		childs: [
			{ name: 'Card', href: 'card' },
			{ name: 'Point', href: 'point' }
		]
	}
];
