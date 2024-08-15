export interface ContactCategorySelect {
	value: string;
	label: string;
}

export const contactCategorySelect: ContactCategorySelect[] = [
	{ value: 'shortbookNeedHelp', label: 'How to use "ShortBook"' },
	{ value: 'shortbookReportIllegal', label: 'Report illegal book or user' },
	{ value: 'shortbookBug', label: 'Issues report' },
	{ value: 'shortbookFeature', label: 'Features request' },
	{ value: 'shortbookI18n', label: 'Translation corrections request' },
	{ value: 'shortbookSecurity', label: 'Security issues report' },
	{ value: 'shortbookPolicy', label: 'About term / privacy policy' },
	{ value: 'shortbookLegal', label: 'DMCA request' },
	{ value: 'companyAbout', label: 'About "ShortBook LLC"' },
	{ value: 'companyPress', label: 'Press contact' },
	{ value: 'lifeNeedHelp', label: 'I have worries in life :(' },
	{ value: 'other', label: 'Other' }
];

export const contactCategoryAndNoSelect: ContactCategorySelect[] = [
	{ value: '', label: 'Select category' },
	...contactCategorySelect
];
