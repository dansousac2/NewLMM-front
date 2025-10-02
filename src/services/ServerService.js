import ReadFileService from "../services/ReadFileService";
import AuthenticationApiService from "./AuthenticationApiService";
import StorageService from "./StorageService";

import { showErrorMessage } from "../components/Toastr/Toastr";

export const BASE_HTTP_SERVER = "http://26.95.71.93:8082";

const readFileService = ReadFileService;
const storage = StorageService();

export function getAxcessPath(path) {
    return BASE_HTTP_SERVER + path.replace(/\\/g, "/");
}

export const createLinkToRead = async (ownerId, id, extension) => {

    const pathFisicalFile = storage.getItem(`rec${id}`);

    if (pathFisicalFile != null) {
        // não nulo e não undefined
        return pathFisicalFile;
    } else {
        try {
            const filePathInHttpServer = getAxcessPath((await readFileService.read(id + extension, ownerId)).data);
            storage.setItem(`rec${id}`, filePathInHttpServer);
            return filePathInHttpServer;
        } catch (error) {
            showErrorMessage("Falha ao carregar dados de comprovante físico.");
            console.log(error);
            return null;
        }
    }
}