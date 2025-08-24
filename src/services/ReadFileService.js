import { createApiService } from "./ApiService";

const api = createApiService('/readfile');

const ReadFileService = {

    read: async (fileName, userId) => {
        return api.get(`?fileName=${fileName}&userId=${userId}`);
    }
}

export default ReadFileService;