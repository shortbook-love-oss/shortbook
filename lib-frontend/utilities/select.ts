export interface SelectItem<T = number> {
	value: T;
	text?: string;
	label: string;
	selected?: boolean;
}

export function getSelectedText<T = number>(items: SelectItem<T>[], value: T) {
	const match = items.find((item) => item.value === value);
	if (match) {
		return match.text;
	}
	return items[0]?.text ?? '';
}
