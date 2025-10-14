import {createApiService} from "./ApiService";

const api = createApiService('/curriculum');

const CurriculumService = {

    create: async (object) => {
        return api.post('', object);
    },

    update: async (object) => {
        return api.putWithFiles('/update', object);
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
    },

    createNewVersion: async (file) => {
        return api.postWithHeaders('/uploadcurriculumxml', file);
    }
};

export default CurriculumService;