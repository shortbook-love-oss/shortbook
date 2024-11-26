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
