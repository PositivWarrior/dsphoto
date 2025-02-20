import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const API_URL = process.env.REACT_APP_API_URL || 'https://api.fotods.no';
const FALLBACK_URL = API_URL.replace('https://', 'http://');

let isConnectionIssue = false;

export const API = axios.create({
	baseURL: API_URL,
	timeout: 15000, // Increased timeout for slower connections
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Connection status tracking
const updateConnectionStatus = (hasIssue) => {
	if (isConnectionIssue !== hasIssue) {
		isConnectionIssue = hasIssue;
		console.warn(
			`API Connection Status: ${
				hasIssue ? 'Issues Detected' : 'Restored'
			}`,
		);
	}
};

// Add retry logic with HTTPS fallback
API.interceptors.response.use(
	(response) => {
		updateConnectionStatus(false); // Connection successful
		return response;
	},
	async (error) => {
		const { config } = error;

		// Initialize retry count
		config.retryCount = config.retryCount || 0;

		// Specific error handling
		const errorType =
			error.code ||
			(error.response ? `HTTP ${error.response.status}` : 'Unknown');
		const isNetworkError =
			!error.response &&
			(error.code === 'ECONNABORTED' ||
				error.code === 'ECONNREFUSED' ||
				error.message.includes('Network Error'));
		const isServerError =
			error.response && [502, 503, 504].includes(error.response.status);

		// Update connection status
		updateConnectionStatus(isNetworkError || isServerError);

		// Check if we should retry
		const shouldRetry =
			config.retryCount < MAX_RETRIES &&
			(isNetworkError || isServerError);

		if (!shouldRetry) {
			// If using HTTPS and we've exhausted retries, try HTTP as a last resort
			if (config.url.startsWith('https://') && !config.triedHTTP) {
				console.warn('SSL Connection failed, falling back to HTTP');
				config.url = config.url.replace('https://', 'http://');
				config.baseURL = config.baseURL.replace('https://', 'http://');
				config.triedHTTP = true;
				return API(config);
			}

			// Log detailed error information
			console.error('API Request Failed:', {
				url: config.url,
				method: config.method,
				errorType,
				message: error.message,
				retryCount: config.retryCount,
				usedHTTPFallback: config.triedHTTP || false,
			});

			return Promise.reject(error);
		}

		config.retryCount += 1;

		// Log the retry attempt with more details
		console.warn(`Retry Attempt ${config.retryCount}/${MAX_RETRIES}:`, {
			url: config.url,
			method: config.method,
			errorType,
			message: error.message,
		});

		// Wait before retrying with exponential backoff
		const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
		await new Promise((resolve) => setTimeout(resolve, delay));

		return API(config);
	},
);

// Request interceptor with enhanced error logging
API.interceptors.request.use(
	(req) => {
		const requestInfo = {
			method: req.method?.toUpperCase(),
			url: req.url,
			timestamp: new Date().toISOString(),
		};
		console.log('API Request:', requestInfo);

		if (localStorage.getItem('token')) {
			req.headers.Authorization = `Bearer ${localStorage.getItem(
				'token',
			)}`;
		}
		return req;
	},
	(error) => {
		console.error('Request Configuration Error:', {
			message: error.message,
			config: error.config,
		});
		return Promise.reject(error);
	},
);

// Export API methods with error boundaries
const withErrorBoundary =
	(apiCall) =>
	async (...args) => {
		try {
			return await apiCall(...args);
		} catch (error) {
			console.error('API Operation Failed:', {
				operation: apiCall.name,
				error: error.message,
				status: error.response?.status,
			});
			throw error;
		}
	};

// Export API methods
export const fetchImages = withErrorBoundary(() => API.get('/images'));
export const uploadImage = withErrorBoundary((formData) =>
	API.post('/images', formData),
);
export const loginUser = withErrorBoundary((loginData) =>
	API.post('/users/login', loginData),
);
export const deleteImage = withErrorBoundary((imageId) =>
	API.delete(`/images/${imageId}`),
);
