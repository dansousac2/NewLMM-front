import ReadFileService from "../services/ReadFileService";
import StorageService from "./StorageService";

import { showErrorMessage } from "../components/Toastr/Toastr";

const readFileService = ReadFileService;
const storage = StorageService();

export const createLinkToRead = async (receiptId) => {

    const objURL = storage.getItem(`rec${receiptId}`);

    if (objURL != null) {
        // não nulo e não undefined
        return objURL;
    } else {
        try {
            const responseFile = (await readFileService.read(receiptId)).data;

            const objURLNew = URL.createObjectURL(responseFile);
            storage.setItem(`rec${receiptId}`, objURLNew);

            return objURLNew;
            
        } catch (error) {
            showErrorMessage("Falha ao carregar dados de comprovante físico.");
            console.log(error);
            return null;
        }
    }
}