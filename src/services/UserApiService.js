import { createApiService } from "./ApiService";

const api = createApiService('/user');

// Objeto literal. Não usa "this" pois os métodos foram criados usando arrow function e porquê não há necessidade de acessar valores aqui.
const UserApiService = {

    create: async (object) => {
        return api.post('', object);
    },

    update: async (id, object) => {
        return api.put(`/${id}`, object);
    },

    delete: async (id) => {
        return api.delete(`/${id}`);
    },

    find: async (params) => {
        return api.get(`${params}`);
    },

    findAllByRole: async (role) => {
        return api.get(`/byrole/${role}`);
    }
}

export default UserApiService;