import { createApiService } from "./ApiService";

const api = createApiService('/fileupload');

const FileUploadService = () => ({

    create(object) {
        return api.postWithHeaders(object);
    }     

});

export default FileUploadService;