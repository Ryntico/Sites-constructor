import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { auth, db } from '@/services/firebase/app.ts';
import * as authApi from '@/services/firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { updateUserEmail } from '@/services/firebase/auth.ts';

export type FirebaseTimestamp = Timestamp;

export type UserDoc = {
	email: string;
	firstName: string;
	lastName: string;
	createdAt: FirebaseTimestamp;
};

type UserDocCreate = Omit<UserDoc, 'createdAt'> & {
	createdAt: ReturnType<typeof serverTimestamp>;
};

export type AuthUser = {
	uid: string;
	email: string | null;
	displayName: string | null;
	firstName?: string;
	lastName?: string;
};

type AuthState = {
	user: AuthUser | null;
	status: 'idle' | 'loading' | 'succeeded' | 'error';
	error: string | null;
	initialized: boolean;
};

const initialState: AuthState = {
	user: null,
	status: 'idle',
	error: null,
	initialized: false,
};

const mapAuthUser = (u: FirebaseUser): AuthUser => ({
	uid: u.uid,
	email: u.email,
	displayName: u.displayName,
});

const ensureUserDoc = async (
	fbUser: FirebaseUser,
	initial?: { firstName?: string; lastName?: string },
) => {
	const ref = doc(db, 'users', fbUser.uid);
	const snap = await getDoc(ref);
	if (!snap.exists()) {
		const payload: UserDocCreate = {
			email: fbUser.email ?? '',
			firstName: initial?.firstName ?? '',
			lastName: initial?.lastName ?? '',
			createdAt: serverTimestamp(),
		};
		await setDoc(ref, payload);
	}
};

export const fetchUserDoc = createAsyncThunk<
	{ firstName: string; lastName: string },
	string,
	{ rejectValue: string }
>('auth/fetchUserDoc', async (uid, { rejectWithValue }) => {
	try {
		const ref = doc(db, 'users', uid);
		const snap = await getDoc(ref);
		if (!snap.exists()) {
			return { firstName: '', lastName: '' };
		}
		const data = snap.data() as Partial<UserDoc>;
		return {
			firstName: data.firstName ?? '',
			lastName: data.lastName ?? '',
		};
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return rejectWithValue(msg);
	}
});

export const signUp = createAsyncThunk<
	AuthUser,
	{ email: string; password: string; firstName: string; lastName: string },
	{ rejectValue: string }
>(
	'auth/signUp',
	async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
		try {
			const full = [firstName, lastName].filter(Boolean).join(' ').trim();
			const fbUser = await authApi.signUp(email, password, full);

			await ensureUserDoc(fbUser, { firstName, lastName });

			return {
				...mapAuthUser(fbUser),
				firstName,
				lastName,
			};
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			return rejectWithValue(msg);
		}
	},
);

export const signIn = createAsyncThunk<
	AuthUser,
	{ email: string; password: string },
	{ rejectValue: string }
>('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
	try {
		const fbUser = await authApi.signIn(email, password);
		await ensureUserDoc(fbUser);

		const snap = await getDoc(doc(db, 'users', fbUser.uid));
		const data = (snap.data() as Partial<UserDoc>) || {};

		return {
			...mapAuthUser(fbUser),
			firstName: data.firstName ?? '',
			lastName: data.lastName ?? '',
		};
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return rejectWithValue(msg);
	}
});

export const signOut = createAsyncThunk<void, void, { rejectValue: string }>(
	'auth/signOut',
	async (_, { rejectWithValue }) => {
		try {
			await authApi.logOut();
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			return rejectWithValue(msg);
		}
	},
);

export const updateProfile = createAsyncThunk<
	AuthUser,
	{ firstName?: string; lastName?: string },
	{ rejectValue: string }
>('auth/updateProfile', async (payload, { rejectWithValue }) => {
	try {
		const user = auth.currentUser;
		if (!user) throw new Error('Not authenticated');

		const ref = doc(db, 'users', user.uid);
		const snap = await getDoc(ref);
		const prev = (snap.exists() ? (snap.data() as Partial<UserDoc>) : {}) || {};

		const nextFirst = payload.firstName ?? prev.firstName ?? '';
		const nextLast = payload.lastName ?? prev.lastName ?? '';
		const full = [nextFirst, nextLast].filter(Boolean).join(' ').trim();

		await authApi.updateDisplayName(full);

		const updates: Record<string, string> = {};
		if (payload.firstName !== undefined) updates.firstName = payload.firstName ?? '';
		if (payload.lastName !== undefined) updates.lastName = payload.lastName ?? '';
		if (Object.keys(updates).length) await setDoc(ref, updates, { merge: true });

		return mapAuthUser(auth.currentUser!);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return rejectWithValue(msg);
	}
});

export const updateEmail = createAsyncThunk<
	string,
	{ email: string },
	{ rejectValue: string }
>('auth/updateEmail', async ({ email }, { rejectWithValue }) => {
	try {
		await updateUserEmail(email);
		return email;
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return rejectWithValue(msg);
	}
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<AuthUser | null>) {
			state.user = action.payload;
			state.initialized = true;
		},
		resetError(state) {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(signUp.pending, (s) => {
				s.status = 'loading';
				s.error = null;
			})
			.addCase(signUp.fulfilled, (s, a) => {
				s.status = 'succeeded';
				s.user = a.payload;
			})
			.addCase(signUp.rejected, (s, a) => {
				s.status = 'error';
				s.error = a.payload ?? 'Sign up failed';
			});

		builder
			.addCase(signIn.pending, (s) => {
				s.status = 'loading';
				s.error = null;
			})
			.addCase(signIn.fulfilled, (s, a) => {
				s.status = 'succeeded';
				s.user = a.payload;
			})
			.addCase(signIn.rejected, (s, a) => {
				s.status = 'error';
				s.error = a.payload ?? 'Sign in failed';
			});

		builder
			.addCase(signOut.pending, (s) => {
				s.status = 'loading';
				s.error = null;
			})
			.addCase(signOut.fulfilled, (s) => {
				s.status = 'succeeded';
				s.user = null;
			})
			.addCase(signOut.rejected, (s, a) => {
				s.status = 'error';
				s.error = a.payload ?? 'Sign out failed';
			});

		builder
			.addCase(updateProfile.pending, (s) => {
				s.status = 'loading';
				s.error = null;
			})
			.addCase(updateProfile.fulfilled, (s, a) => {
				s.status = 'succeeded';
				if (!s.user) {
					s.user = a.payload;
					return;
				}
				s.user.displayName = a.payload.displayName;
				const { firstName, lastName } = a.meta.arg;
				if (typeof firstName !== 'undefined') s.user.firstName = firstName;
				if (typeof lastName !== 'undefined') s.user.lastName = lastName;
			})
			.addCase(updateProfile.rejected, (s, a) => {
				s.status = 'error';
				s.error = a.payload ?? 'Update profile failed';
			});

		builder
			.addCase(updateEmail.pending, (s) => {
				s.status = 'loading';
				s.error = null;
			})
			.addCase(updateEmail.fulfilled, (s, a) => {
				s.status = 'succeeded';
				if (s.user) {
					s.user.email = a.payload;
				}
			})
			.addCase(updateEmail.rejected, (s, a) => {
				s.status = 'error';
				s.error = a.payload ?? 'Update email failed';
			});

		builder.addCase(fetchUserDoc.fulfilled, (s, a) => {
			if (s.user) {
				s.user.firstName = a.payload.firstName;
				s.user.lastName = a.payload.lastName;
			}
		});
	},
});

export const { setUser, resetError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
