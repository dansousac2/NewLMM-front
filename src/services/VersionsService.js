import {createApiService} from "./ApiService";

const api = createApiService('/curriculum');

const VersionService = () => ({

    create(object) {
        return api.post('', object);
    },

    update(object) {
        return api.put('/update', object);
    },

    delete(id) {
        return api.delete(`/delete/${id}`);
    },

    findById(id) {
        return api.get(`/${id}`);
    },

    findByRequesterIdAndVersionName(id, version) {
        return api.get(`/ownerandversion?ownerId=${id}&version=${version}`);
    },

    findAll(){
        return api.getAll();
    },

    findAllByUserId(id){
        return api.getAllById("/findall", id);
    }
});

export default VersionService;