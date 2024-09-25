export interface SelectListGroup<T = number> {
	label: string;
	childs: SelectItem<T>[];
}

export interface SelectItem<T = number> {
	value: T;
	label: string;
	text?: string;
}

export function isSelectGroup<T = number>(
	group: SelectListGroup<T> | SelectItem<T>
): group is SelectListGroup<T> {
	return Object.hasOwn(group as SelectListGroup<T>, 'childs');
}
