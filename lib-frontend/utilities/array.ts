// [1,2,3,4,5,6,7,8] → [[1,2,3], [4,5,6], [7,8]]
export function arrayToSquads<T>(items: T[], memberCount: number) {
	const squads: T[][] = [];
	for (let i = 0; i < items.length; i += memberCount) {
		squads.push(items.slice(i, i + memberCount));
	}

	return squads;
}

// [1,2,3] and [1,2,3] → true
// [1,2,3] and [1,3,2] → true
// [1,2] and [1,2,2] → false
// [1,2,3] and [1,2] → false
export function isArrayHaveSameValues<T = unknown>(source: T[], compare: T[]) {
	if (source.length !== compare.length) {
		return false;
	}

	const sourceSorted = source.slice().sort();
	const compareSorted = compare.slice().sort();
	for (let i = 0; i < sourceSorted.length; i++) {
		if (sourceSorted[i] !== compareSorted[i]) {
			return false;
		}
	}

	return true;
}

// Fillter truly values only and return excluded values too
// ['foo', undefined, 'baz'] → { filtered: ['foo', 'baz'], excluded: { 1: undefined } }
export function packArray<T = string>(
	items: Readonly<T[]>,
	filterCond?: (item: T, index: number) => boolean
) {
	const filtered: T[] = [];
	const excluded = new Map<number, T>();
	items.forEach((item, i) => {
		if (filterCond ? !filterCond(item, i) : !item) {
			excluded.set(i, item);
		} else {
			filtered.push(item);
		}
	});

	return { filtered, excluded };
}

// Rewind of packArray
// ['foo', 'baz'], { 1: undefined } → ['foo', undefined, 'baz']
export function rewindArray<T = string>(filtered: Readonly<T[]>, excluded: Map<number, T>) {
	const items = filtered.slice();
	excluded.forEach((value, insertIndex) => {
		items.splice(insertIndex, 0, value);
	});

	return items;
}
