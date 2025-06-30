import apiClient from '../apiClient.js';

const ENDPOINT = 'api/miembros';

const membersService = {
    // Métodos existentes
    get: () => {
        return apiClient.get(ENDPOINT);
    },

    getbyID: (id) => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    addMember: (member) => {
        return apiClient.post(ENDPOINT, member);
    },

    deleteMember: (id) => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    },

    updateMember: (id, member) => {
        return apiClient.patch(`${ENDPOINT}/${id}`, member);
    },

    // Nuevos métodos para verificación
    verifyCode: (verificationData) => {
        return apiClient.post(`${ENDPOINT}/verify`, verificationData);
    },

    resendCode: (email) => {
        return apiClient.post(`${ENDPOINT}/resend-code`, { email });
    },

    checkVerificationStatus: (email) => {
        return apiClient.get(`${ENDPOINT}/verification-status?email=${encodeURIComponent(email)}`);
    }
};

export default membersService;