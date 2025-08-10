import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';

import { auth } from './app';

export async function signUp(
	email: string,
	password: string,
	displayName?: string,
): Promise<User> {
	const cred = await createUserWithEmailAndPassword(auth, email, password);
	if (displayName) await updateProfile(cred.user, { displayName });
	return cred.user;
}

export async function signIn(email: string, password: string): Promise<User> {
	const cred = await signInWithEmailAndPassword(auth, email, password);
	return cred.user;
}

export async function logOut(): Promise<void> {
	await signOut(auth);
}

export type PublicUser = Pick<User, 'uid' | 'email' | 'displayName' | 'photoURL'>;
