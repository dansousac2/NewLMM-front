import {createApiService} from "./ApiService";

constapi = createApiService('/curriculum');

const VersionService = {

    create: async (object) => {
        return api.post('', object);
    },

    update: async (object) => {
        return api.put('/update', object);
    },

    delete: async (id) => {
        return api.delete(`/delete/${id}`);
    },

    findById: async (id) => {
        return api.get(`/${id}`);
    },

    findByRequesterIdAndVersionName: async (id, version) => {
        return api.get(`/ownerandversion?ownerId=${id}&version=${version}`);
    },

    findAll: async () => {
        return api.getAll();
    },

    findAllByUserId: async (id) => {
        return api.getAllById("/findall", id);
    }
};

export default VersionService;