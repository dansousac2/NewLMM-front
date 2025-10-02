// factory function sem uso de variáveis no corpo
const createStorageService = () => ({

    setItem: (key, value) => {
        if(typeof value === 'string') {
            // evita salvar com aspas no localStorage
            localStorage.setItem(key, value);
            return;
        }
        localStorage.setItem(key, JSON.stringify(value));
    },

    getItem: (key) => {
        const item = localStorage.getItem(key);
        if(item === 'undefined') {
            // se string com valor "undefined"
            return null;
        }
        try {
            // se item for string válida de JSON
            return JSON.parse(item);
        } catch {
            // retorna como string pura
            return item;
        }
    },

    removeItem: (key) => {
        localStorage.removeItem(key);
    },

    removeAllItems: () => {
        localStorage.clear();
    }
});

export default createStorageService;