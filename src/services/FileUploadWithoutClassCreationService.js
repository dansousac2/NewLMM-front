import { createApiService } from "./ApiService";

const api = createApiService('/onlyuploadfile');

const FileUploadService = () => ({

    create(object) {
        return api.postWithHeaders(object);
    } 

});

export default FileUploadService;