import type { CurrencySupportValues } from '$lib/utilities/currency';

export interface PointListItem {
	amount: number;
	createdAt: Date;
	bookTitle: string;
	bookUrlSlug: string;
	writeKeyHandle: string;
	isSell: boolean;
	payment?: {
		provider: string;
		currency: CurrencySupportValues;
		amount: number;
	};
}
