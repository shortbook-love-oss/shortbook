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
			{ name: 'Profile image', href: 'image' }
		]
	},
	{
		name: 'Sign in & security',
		href: 'security',
		childs: [
			{ name: 'Sign in method', href: 'method' },
			{ name: 'Danger action', href: 'danger' }
		]
	}
];
