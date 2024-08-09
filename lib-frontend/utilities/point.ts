export interface PointListItem {
	amount: number;
	createdAt: Date;
	bookId: string;
	bookTitle: string;
	paymentProvider: string;
	paymentSessionId: string;
	isSell: boolean;
}
