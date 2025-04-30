import axios from "axios";

// Create a token refresh queue to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Notify all subscribers that token refresh is complete
const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// Handle token refresh failure
const onTokenRefreshFailed = (error) => {
    refreshSubscribers.forEach((callback) => callback(null, error));
    refreshSubscribers = [];
};

// API base URL - use relative URL for the proxy to work
const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config);
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            console.log('Adding auth token to request:', config.url);
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            console.warn('No access token available for request:', config.url);
        }
        return config;
    },
    (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`✅ Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        console.error(`❌ Response Error for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);

        // Check if there's a config object to prevent errors when the request was not made
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Check if error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Mark this request as retried
            originalRequest._retry = true;

            // If we're already refreshing, wait for the token
            if (isRefreshing) {
                try {
                    // Wait for the token refresh to complete
                    const newToken = await new Promise((resolve, reject) => {
                        subscribeTokenRefresh((token, error) => {
                            if (error) reject(error);
                            else resolve(token);
                        });
                    });

                    // If we got a new token, retry the original request
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // If token refresh failed, redirect to login
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            }

            // Start refreshing process
            isRefreshing = true;

            try {
                console.log("🔄 Attempting to refresh token");
                // Attempt to refresh the token
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Extract the new access token
                const newAccessToken = response.data.accessToken;
                console.log("🔑 Token refreshed successfully");

                // Store the new token
                localStorage.setItem("accessToken", newAccessToken);

                // Notify all subscribers that token is refreshed
                onTokenRefreshed(newAccessToken);

                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Reset refreshing state
                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                console.error("🔒 Token refresh failed:", refreshError);
                // If refresh failed, notify subscribers and redirect to login
                onTokenRefreshFailed(refreshError);
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        // If error is not 401 or refresh failed, reject with original error
        return Promise.reject(error);
    }
);

export default api;

