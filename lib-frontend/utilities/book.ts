export interface MyBookItem {
	id: string;
	status: number;
	title: string;
	subtitle: string;
	publishedAt: Date;
	updatedAt: Date;
}

export interface BookItem extends MyBookItem {
	keyName: string;
	penName: string;
	image: string;
}

export interface BookDetail extends BookItem {
	prologue: string;
	content: string;
	sales_message: string;
}
