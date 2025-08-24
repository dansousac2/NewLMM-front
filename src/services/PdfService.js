import { createApiService } from "./ApiService";

const api = createApiService('/export');

const PdfService = {

    generate: async (curriculumId, ownerId) => {
        return api.get(`?curriculumId=${curriculumId}&ownerId=${ownerId}`);
    }
}

export default PdfService;