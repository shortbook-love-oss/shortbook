export function arrayToSquads<T>(items: T[], memberCount: number) {
	const squads: T[][] = [];
	for (let i = 0; i < items.length; i += memberCount) {
		squads.push(items.slice(i, i + memberCount));
	}
	return squads;
}
