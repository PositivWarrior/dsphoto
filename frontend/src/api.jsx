import axios from 'axios';

export const API = axios.create({
	baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((req) => {
	if (localStorage.getItem('token')) {
		req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
	}
	return req;
});

export const fetchImages = () => API.get('/images');

export const uploadImage = (formData) => API.post('/images', formData);

export const loginUser = (loginData) => API.post('/users/login', loginData);
