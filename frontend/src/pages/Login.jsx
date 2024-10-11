import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const { data } = await loginUser({ email, password });
			localStorage.setItem('token', data.token);
			navigate('/admin');
		} catch (err) {
			setError('Invalid email or password');
		}
	};

	return (
		<div>
			<h2>Admin Login</h2>
			{error && <p>{error}</p>}
			<form onSubmit={handleSubmit}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit">Login</button>
			</form>
		</div>
	);
};

export default Login;
