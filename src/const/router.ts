export enum AppRoutes {
	MAIN = 'main',
	LOGIN = 'login',
	SIGNUP = 'signup',
	PROFILE = 'me',
	NEW_PROJECT = 'new_project',
	EXISTING_PROJECT = 'existing_project',
	// last
	NOT_FOUND = 'not_found',
}

export const getRouteMain = () => '/';
export const getRouteLogin = () => '/login';
export const getRouteSignup = () => '/signup';
export const getRouteProfile = () => '/me';
export const getRouteNewProject = () => '/sites/new';
export const getRouteExistingProject = (siteId: string) => `/sites/${siteId}`;
