import apiClient from '../apiClient.js';

const ENDPOINT = {
  get: "api/membresiaUsuario",
  update: "api/actualizarEstadoMembresia",
};

const membresiaUsuarioService = {
    // Obtener membresías de un usuario por ID (en la URL)
    getByUserId: (userId) => {
        return apiClient.get(`${ENDPOINT.get}/${userId}`);
    },

    // Obtener membresías de un usuario enviando el ID en el cuerpo
    getByUser: (userId) => {
        return apiClient.post(ENDPOINT.get, { usuarioId: userId });
    },

    updateMembershipStatus : (userID, data) => {
        return apiClient.patch(`${ENDPOINT.update}/${userID}`, data);
    }

}

export default membresiaUsuarioService;