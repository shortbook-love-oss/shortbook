type MypageItem = {
	name: string;
	href: string;
	childs: Omit<MypageItem, 'childs'>[];
};

export const categories: MypageItem[] = [
	{
		name: 'Personnel data',
		href: 'personnel',
		childs: [
			{ name: 'Public profile', href: 'profile' },
			{ name: 'Profile image', href: 'image' }
		]
	},
	{
		name: 'Point',
		href: 'point',
		childs: [{ name: 'Point history', href: 'history' }]
	},
	{
		name: 'Assets',
		href: 'asset',
		childs: [{ name: 'Album', href: 'album' }]
	},
	{
		name: 'Sign in & security',
		href: 'security',
		childs: [
			{ name: 'Email', href: 'email' },
			{ name: 'Danger action', href: 'danger' }
		]
	},
	{
		name: 'Payment',
		href: 'payment',
		childs: [{ name: 'Currency', href: 'currency' }]
	}
];
