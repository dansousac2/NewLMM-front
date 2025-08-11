import { createApiService } from "./ApiService";

const api = createApiService('/receipt');

const ReceiptWithUrlService = () => ({

    create(params) {
        return api.post("",params);
    },

    updateByValidator(params) {
        return api.put("/validator", params);
    }

});

export default ReceiptWithUrlService;