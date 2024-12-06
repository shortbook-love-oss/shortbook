export const load = async ({ locals }) => {
	return {
		signInUser: locals.signInUser,
		isMypage: false
	};
};
