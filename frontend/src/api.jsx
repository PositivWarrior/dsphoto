import axios from 'axios';

export const API = axios.create({
	baseURL: process.env.REACT_APP_API_URL || 'https://api.fotods.no',
	timeout: 10000,
});

API.interceptors.request.use((req) => {
	console.log('Making request to:', req.url); // Debug log
	if (localStorage.getItem('token')) {
		req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
	}
	return req;
});

API.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API Error Details:', {
			endpoint: error.config?.url,
			method: error.config?.method,
			status: error.response?.status,
			message: error.message,
			responseData: error.response?.data,
			headers: error.response?.headers,
		});
		return Promise.reject(error);
	},
);

export const fetchImages = () => API.get('/images');

export const uploadImage = (formData) => API.post('/images', formData);

export const loginUser = (loginData) => API.post('/users/login', loginData);

export const deleteImage = (imageId) => API.delete(`/images/${imageId}`);
