export interface PointListItem {
	amount: number;
	createdAt: Date;
	bookId: string;
	bookTitle: string;
	isSell: boolean;
	payment?: {
		provider: string;
		currency: string;
		amount: number;
	};
}
