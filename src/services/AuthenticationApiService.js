import createApiService, { LOGGED_USER, TOKEN } from "./ApiService";
import StorageService from "./StorageService";

const storage = StorageService();
const api = createApiService('');

// objeto literal contendo funções
const AuthenticationApiService = {

    login: async (email, password) => {
        const loginDTO = { email, password };

        try {
            const response = await api.post('/login', loginDTO);
            const { user, token } = response.data;

            storage.setItem(LOGGED_USER, user);
            storage.setItem(TOKEN, token);
            api.registerToken(token);

            return user;
        } catch (error) {
            return null;
        }
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } finally {
            storage.removeAllItems();
        }
    },

    getLoggedUser: () => {
        return storage.getItem(LOGGED_USER);
    },

    getToken: () => {
        return storage.getItem(TOKEN);
    },

    isAuthenticated: async () => {
        const user = storage.getItem(LOGGED_USER);
        const token = storage.getItem(TOKEN);

        if (!user || !token) return false;

        try {
            const response = await api.post('/login/verifytoken', token);
            return response.data;
        } catch(error) {
            console.error('Erro ao verificar Token.', error)
            return false;
        }
    }
};

export default AuthenticationApiService;