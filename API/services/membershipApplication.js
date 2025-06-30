import apiClient from '../apiClient.js';

const ENDPOINT = {
    solicitar: 'api/solicitarMembresia',
    aceptar: 'api/aceptarMembresia',
    rechazar: 'api/rechazarMembresia',
    obtener: 'api/solicitudesMembresias',
}

const membershipApplicationService = {
    solicitar: (membershipApplication) => {
        return apiClient.post(ENDPOINT.solicitar, membershipApplication);
    },

    aceptar: (id, reason) => {
        return apiClient.post(`${ENDPOINT.aceptar}/${id}`, reason);
    },

    rechazar: (id, reason) => {
        return apiClient.post(`${ENDPOINT.rechazar}/${id}`, reason);
    },

    obtener : () => {
        return apiClient.get(ENDPOINT.obtener);
    },
    
    obtenerPorID : (id) => {
        return apiClient.get(`${ENDPOINT.obtener}/${id}`);
    }
};

export default membershipApplicationService;