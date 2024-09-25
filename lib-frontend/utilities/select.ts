export type SelectItemGroup<T = number> = {
	label: string;
	childs: SelectItemSingle<T>[];
};

export type SelectItemSingle<T = number> = {
	value: T;
	label: string;
	text?: string;
};

export type SelectItem<T = number> = SelectItemGroup<T> | SelectItemSingle<T>;

export function isSelectGroup<T = number>(group: SelectItem<T>): group is SelectItemGroup<T> {
	return Object.hasOwn(group, 'childs');
}
