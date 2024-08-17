import type { CurrencySupportKeys } from '$lib/utilities/currency';

export interface PointListItem {
	amount: number;
	createdAt: Date;
	bookTitle: string;
	bookKeyName: string;
	writeKeyName: string;
	isSell: boolean;
	payment?: {
		provider: string;
		currency: CurrencySupportKeys;
		amount: number;
	};
}
