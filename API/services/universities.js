import apiClient from '../apiClient.js';

const ENDPOINT = 'api/universidades';

const universitiesService = {
    get: () => {
        return apiClient.get(ENDPOINT);
    }
   
}

export default universitiesService;