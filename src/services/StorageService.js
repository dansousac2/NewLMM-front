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
        // tenta fazer parse apenas se for JSON válido
        try {
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