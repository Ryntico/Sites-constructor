import { type RouteProps } from 'react-router-dom';

export type AppRoutesProps = RouteProps & {
	authOnly?: boolean;
	roles: UserRole[];
	hideHeader?: boolean;
};

export enum UserRole {
	GUEST = 'GUEST',
	USER = 'USER',
}
