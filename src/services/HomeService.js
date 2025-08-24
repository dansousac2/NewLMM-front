import { createApiService } from "./ApiService"

const api = createApiService('/uploadcurriculumxml');

const HomeService = {

    create: async (object) => {
        return api.postWithHeaders(object);
    }
}

export default HomeService;