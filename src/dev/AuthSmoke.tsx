import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase/app';

import {
	selectAuth,
	signUp,
	signIn,
	signOut,
	updateProfile,
	fetchUserDoc,
} from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';

type DevPing = { at?: Timestamp; uid?: string | null };

export default function AuthSmoke() {
	const dispatch = useAppDispatch();

	const { user, status, error } = useAppSelector(selectAuth);

	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const [firstName, setFirst] = useState('');
	const [lastName, setLast] = useState('');

	const [ping, setPing] = useState<DevPing | null>(null);
	const [localError, setLocalError] = useState('');

	useEffect(() => {
		if (user?.uid) dispatch(fetchUserDoc(user.uid));
	}, [user?.uid, dispatch]);

	async function handlePing() {
		setLocalError('');
		try {
			const ref = doc(db, 'dev', 'ping');
			await setDoc(ref, { at: serverTimestamp(), uid: user?.uid ?? null });
			const snap = await getDoc(ref);
			setPing((snap.data() as DevPing) ?? null);
		} catch (e) {
			setLocalError(e instanceof Error ? e.message : String(e));
		}
	}

	const handleSignUp = async () => {
		setLocalError('');
		try {
			await dispatch(
				signUp({ email, password: pass, firstName, lastName }),
			).unwrap();
		} catch (e) {
			setLocalError(String(e));
		}
	};

	const handleSignIn = async () => {
		setLocalError('');
		try {
			await dispatch(signIn({ email, password: pass })).unwrap();
		} catch (e) {
			setLocalError(String(e));
		}
	};

	const handleLogOut = async () => {
		setLocalError('');
		try {
			await dispatch(signOut()).unwrap();
			setPing(null);
		} catch (e) {
			setLocalError(String(e));
		}
	};

	const handleUpdateProfile = async () => {
		setLocalError('');
		try {
			await dispatch(updateProfile({ firstName, lastName })).unwrap();
		} catch (e) {
			setLocalError(String(e));
		}
	};

	const loading = status === 'loading';

	return (
		<div style={{ maxWidth: 520, margin: '40px auto', display: 'grid', gap: 12 }}>
			<h2>Auth & Firestore smoke (Redux)</h2>

			<div style={{ display: 'grid', gap: 8 }}>
				<label>
					Email{' '}
					<input value={email} onChange={(e) => setEmail(e.target.value)} />
				</label>
				<label>
					Пароль{' '}
					<input
						type="password"
						value={pass}
						onChange={(e) => setPass(e.target.value)}
					/>
				</label>
				<label>
					Имя{' '}
					<input value={firstName} onChange={(e) => setFirst(e.target.value)} />
				</label>
				<label>
					Фамилия{' '}
					<input value={lastName} onChange={(e) => setLast(e.target.value)} />
				</label>
			</div>

			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={handleSignUp} disabled={loading}>
					Sign Up
				</button>
				<button onClick={handleSignIn} disabled={loading}>
					Sign In
				</button>
				<button onClick={handleLogOut} disabled={loading || !user}>
					Log Out
				</button>
				<button onClick={handleUpdateProfile} disabled={loading || !user}>
					Update name
				</button>
			</div>

			<div style={{ marginTop: 8 }}>
				<b>status:</b> {status} {loading ? '…' : ''}
			</div>
			{(error || localError) && (
				<div style={{ color: 'crimson' }}>Error: {error || localError}</div>
			)}

			<div style={{ marginTop: 8 }}>
				<b>currentUser (store):</b>{' '}
				<pre style={{ background: '#f6f6f6', padding: 10 }}>
					{JSON.stringify(
						user
							? {
									uid: user.uid,
									email: user.email,
									displayName: user.displayName,
									firstName: user.firstName,
									lastName: user.lastName,
								}
							: null,
						null,
						2,
					)}
				</pre>
			</div>

			<hr />
			<button onClick={handlePing} disabled={!user}>
				Ping Firestore (create + read)
			</button>
			<pre style={{ background: '#f6f6f6', padding: 10 }}>
				{ping ? JSON.stringify(ping, null, 2) : '—'}
			</pre>
		</div>
	);
}
