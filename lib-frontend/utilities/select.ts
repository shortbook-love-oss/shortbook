export interface SelectItem<T = number> {
	value: T;
	label: string;
	text?: string;
	selected?: boolean;
}
