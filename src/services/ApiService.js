import axios from "axios";
import StorageService from "./StorageService";

export const LOGGED_USER = 'loggedUser';
export const TOKEN = 'token';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const httpClient = axios.create({
    baseURL,
    withCredentials: true,
});

const storageService = StorageService();
const token = storageService.getItem(TOKEN);

// factory function usando variáveis instanciadas no corpo da função
export const createApiService = (endpoint) => {

    if (token) {
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const builderUrl = (url) => `${endpoint}${url}`;

    return {
        post: (url, params) => httpClient.post(builderUrl(url), params),
        put: (url, params) => httpClient.put(builderUrl(url), params),
        get: (url) => httpClient.get(builderUrl(url)),
        getAll: () => httpClient.get(endpoint),
        getAllById: (url, id) => httpClient.get(builderUrl(`${url}/${id}`)),
        getWithFilter: (url) => httpClient.get(builderUrl(url)),
        delete: (url) => httpClient.delete(builderUrl(url)),
        patch: (url, params) => httpClient.patch(builderUrl(url), params),
        registerToken: (token) => {
            if (token) {
                httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        },
        postWithHeaders: (params) => httpClient.post(endpoint, params, {
            headers: {
                'Content-type': 'multipart/form-data'
            }
        }),
    };
};