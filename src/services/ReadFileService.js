import { createApiService } from "./ApiService";

const api = createApiService('/readfile');

const ReadFileService = {

    read: async (recId) => {
        return api.getFile(`?receiptId=${recId}`);
    }
}

export default ReadFileService;