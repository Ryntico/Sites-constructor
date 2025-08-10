import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
	doc,
	setDoc,
	getDoc,
	serverTimestamp,
	type Timestamp,
	type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase/app';
import { signUp, signIn, logOut } from '../services/firebase/auth';

type DevPing = {
	at?: Timestamp;
	uid?: string | null;
};

export default function AuthSmoke() {
	const [email, setEmail] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [user, setUser] = useState<User | null>(null);
	const [ping, setPing] = useState<DevPing | null>(null);
	const [error, setError] = useState<string>('');

	useEffect(() => onAuthStateChanged(auth, setUser), []);

	async function handlePing(): Promise<void> {
		setError('');
		try {
			const ref = doc(db, 'dev', 'ping');
			await setDoc(ref, {
				at: serverTimestamp(),
				uid: auth.currentUser?.uid ?? null,
			});
			const snap = await getDoc(ref);
			const data = (snap.data() as DocumentData | undefined) ?? null;
			setPing(data as DevPing | null);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		}
	}

	async function handleSignUp(): Promise<void> {
		setError('');
		try {
			await signUp(email, pass, name || undefined);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		}
	}

	async function handleSignIn(): Promise<void> {
		setError('');
		try {
			await signIn(email, pass);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		}
	}

	async function handleLogOut(): Promise<void> {
		setError('');
		try {
			await logOut();
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', display: 'grid', gap: 12 }}>
			<h2>Auth & Firestore smoke</h2>

			<label>
				Email <input value={email} onChange={(e) => setEmail(e.target.value)} />
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
				Имя (опц.){' '}
				<input value={name} onChange={(e) => setName(e.target.value)} />
			</label>

			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={handleSignUp}>Sign Up</button>
				<button onClick={handleSignIn}>Sign In</button>
				<button onClick={handleLogOut}>Log Out</button>
			</div>

			<div style={{ marginTop: 8 }}>
				<b>currentUser:</b>{' '}
				<code>{user ? `${user.uid} (${user.email ?? ''})` : 'null'}</code>
			</div>

			<hr />
			<button onClick={handlePing} disabled={!user}>
				Ping Firestore (create + read)
			</button>
			{error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
			<pre style={{ background: '#f6f6f6', padding: 10 }}>
				{ping ? JSON.stringify(ping, null, 2) : '—'}
			</pre>
		</div>
	);
}
