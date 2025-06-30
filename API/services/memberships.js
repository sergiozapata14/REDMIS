import apiClient from '../apiClient.js';

const ENDPOINT = 'api/membresias';

const membershipsService = {
    get: () =>{
        return apiClient.get(ENDPOINT);
    },

    add: (membership) => {
        return apiClient.post(ENDPOINT, membership);
    },

    delete: (id) => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};

export default membershipsService;