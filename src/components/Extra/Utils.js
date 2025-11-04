import { showErrorMessage } from "../Toastr/Toastr";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinnerOnRequest = async (asyncAction, setLoadingState) => {
    try {
        setLoadingState(true);
        const response = await asyncAction();
        return response;
    } catch (error) {
        console.log('Erro na requisição feita: ', error);
    } finally {
        setLoadingState(false);
    }
}

export { sleep, spinnerOnRequest };