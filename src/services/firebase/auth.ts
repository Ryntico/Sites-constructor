import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	updateEmail,
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

export async function updateDisplayName(full: string) {
	if (!auth.currentUser) throw new Error('Not authenticated');
	await updateProfile(auth.currentUser, { displayName: full || null });
	await auth.currentUser.reload();
	return auth.currentUser;
}

export async function updateUserEmail(newEmail: string) {
	if (!auth.currentUser) throw new Error('Not authenticated');
	await updateEmail(auth.currentUser, newEmail);
	await auth.currentUser.reload();
	return auth.currentUser;
}
