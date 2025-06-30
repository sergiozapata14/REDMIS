import apiClient from "../apiClient.js";

const ENDPOINT = "api/estados";

const statesService = {
    get: () => {
        return apiClient.get(ENDPOINT);
    },
    create: (nombre) => {
        return apiClient.post(ENDPOINT, { nombre });
    }
}

export default statesService;