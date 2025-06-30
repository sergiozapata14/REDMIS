import apiClient from "../apiClient.js";

const ENDPOINT = "api/cambiarRol";

const rolesService = {
    changeRole: (id, role) => {
        return apiClient.patch(`${ENDPOINT}/${id}`, role);
    }
};

export default rolesService;