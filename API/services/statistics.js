import apiClient from '../apiClient.js';

const ENDPOINT = 'api/statistics';

const statisticsService = (() => {
    // Variables privadas
    let graficoPaises = null;
    let graficoEstados = null;
    const domElements = {
        totalMiembros: null,
        solicitudesPendientes: null,
        solicitudesAceptadas: null,
        solicitudesRechazadas: null,
        tablaUniversidades: null,
        membresiasActivadas: null,
        membresiasCaducadas: null,
        selectorEstadisticas: null
    };

    // Métodos privados
    const actualizarContador = (elemento, valorFinal) => {
        if (!elemento) return;

        let valorActual = 0;
        const duracion = 1000;
        const incremento = Math.max(1, Math.floor(valorFinal / (duracion / 16)));

        const animar = () => {
            valorActual += incremento;
            elemento.textContent = valorActual < valorFinal ? valorActual : valorFinal;
            if (valorActual < valorFinal) requestAnimationFrame(animar);
        };

        requestAnimationFrame(animar);
    };

    // Métodos públicos
    return {
        async getTotalMembers() {
            try {
                const response = await apiClient.get('api/miembros');
                if (response && typeof response === 'object') {
                    return response.total ||
                           response.data?.total ||
                           (Array.isArray(response) ? response.length :
                           (Array.isArray(response.data) ? response.data.length : 0));
                }
                return 856;
            } catch (error) {
                console.error('Error obteniendo total de miembros:', error);
                return 856;
            }
        },

        async getPendingRequests() {
            try {
                const response = await apiClient.get('api/solicitudesMembresias');
                const solicitudes = response?.data?.solicitudes ||
                                  response?.solicitudes ||
                                  (Array.isArray(response) ? response : []);
                return solicitudes.filter(s => s?.estado === "PENDIENTE").length;
            } catch (error) {
                console.error('Error obteniendo solicitudes pendientes:', error);
                return 24;
            }
        },

        async getAccepRequests() {
            try {
                const response = await apiClient.get('api/solicitudesMembresias');
                const solicitudes = response?.data?.solicitudes ||
                                  response?.solicitudes ||
                                  (Array.isArray(response) ? response : []);
                return solicitudes.filter(s => s?.estado === "APROBADA").length;
            } catch (error) {
                console.error('Error obteniendo solicitudes aprobadas:', error);
                return 25;
            }
        },

        async getRejectRequests() {
            try {
                const response = await apiClient.get('api/solicitudesMembresias');
                const solicitudes = response?.data?.solicitudes ||
                                  response?.solicitudes ||
                                  (Array.isArray(response) ? response : []);
                return solicitudes.filter(s => s?.estado === "RECHAZADA").length;
            } catch (error) {
                console.error('Error obteniendo solicitudes rechazadas:', error);
                return 27;
            }
        },

        async getMembresiasActivas() {
            try {
                const response = await apiClient.get(ENDPOINT);
                const membresias = response?.data?.membresias ||
                                 response?.membresias ||
                                 (Array.isArray(response) ? response : []);
                return membresias.filter(m => m?.estatus === "Activo").length;
            } catch (error) {
                console.error('Error obteniendo las membresias activas:', error);
                return 27;
            }
        },

        async getMembresiasVencidas() {
            try {
                const response = await apiClient.get(ENDPOINT);
                const membresias = response?.data?.membresias ||
                                 response?.membresias ||
                                 (Array.isArray(response) ? response : []);
                return membresias.filter(m => m?.estatus === "Inactivo").length;
            } catch (error) {
                console.error('Error obteniendo las membresias vencidas:', error);
                return 27;
            }
        },

        async getCountriesDistribution() {
            try {
                const response = await apiClient.get(ENDPOINT);
                const data = response?.data || response || [];
                const paisesCount = {};

                data.forEach(usuario => {
                    const pais = usuario?.pais || 'Desconocido';
                    paisesCount[pais] = (paisesCount[pais] || 0) + 1;
                });

                return {
                    labels: Object.keys(paisesCount),
                    data: Object.values(paisesCount)
                };
            } catch (error) {
                console.error('Error obteniendo distribución por países:', error);
                return { labels: ['Ejemplo'], data: [1] };
            }
        },

        async getStateDistribution() {
            try {
                const response = await apiClient.get(ENDPOINT);
                const data = response?.data || response || [];
                const stateCount = {};

                const estadosMexico = [
                    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
                    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
                    'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
                    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
                    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
                    'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
                ];

                data.forEach(usuario => {
                    const estado = usuario?.estado || 'Desconocido';
                    if (estadosMexico.includes(estado)) {
                        stateCount[estado] = (stateCount[estado] || 0) + 1;
                    }
                });

                const sortedLabels = Object.keys(stateCount).sort((a, b) => a.localeCompare(b));
                const sortedData = sortedLabels.map(label => stateCount[label]);

                return {
                    labels: sortedLabels,
                    data: sortedData
                };
            } catch (error) {
                console.error('Error obteniendo distribución por estados:', error);
                return {
                    labels: ['Ciudad de México', 'Jalisco', 'Nuevo León'],
                    data: [10, 5, 3]
                };
            }
        },

        async getUniversities() {
            try {
                const response = await apiClient.get(ENDPOINT);
                const data = response?.data || response || [];
                const universidadesCount = {};

                data.forEach(usuario => {
                    const universidad = usuario?.universidad || 'Desconocida';
                    universidadesCount[universidad] = (universidadesCount[universidad] || 0) + 1;
                });

                return Object.entries(universidadesCount)
                    .map(([universidad, miembros]) => ({ universidad, miembros }))
                    .sort((a, b) => b.miembros - a.miembros);
            } catch (error) {
                console.error('Error obteniendo universidades:', error);
                return [{ universidad: 'Ejemplo', miembros: 1 }];
            }
        },

        async getDashboardData() {
            try {
                const [
                    totalMembers,
                    pendingRequests,
                    accepRequest,
                    rejectRequest,
                    membresiasActivas,
                    membresiasVencidas,
                    countries,
                    states,
                    universities
                ] = await Promise.all([
                    this.getTotalMembers(),
                    this.getPendingRequests(),
                    this.getAccepRequests(),
                    this.getRejectRequests(),
                    this.getMembresiasActivas(),
                    this.getMembresiasVencidas(),
                    this.getCountriesDistribution(),
                    this.getStateDistribution(),
                    this.getUniversities()
                ]);

                return {
                    totalMembers,
                    pendingRequests,
                    accepRequest,
                    rejectRequest,
                    membresiasActivas,
                    membresiasVencidas,
                    countries,
                    states,
                    universities
                };
            } catch (error) {
                console.error('Error en getDashboardData:', error);
                return {
                    totalMembers: 856,
                    pendingRequests: 24,
                    accepRequest: 10,
                    rejectRequest: 10,
                    membresiasActivas: 12,
                    membresiasVencidas: 20,
                    countries: { labels: ['Ejemplo'], data: [1] },
                    states: { labels: ['Ejemplo'], data: [1] },
                    universities: [{ universidad: 'Ejemplo', miembros: 1 }]
                };
            }
        },

        mostrarGraficoPaises(datos) {
            const ctx = document.getElementById('grafica-pais')?.getContext('2d');
            if (!ctx) return;

            if (graficoPaises) graficoPaises.destroy();

            graficoPaises = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datos.labels,
                    datasets: [{
                        label: 'Miembros por País',
                        data: datos.data,
                        backgroundColor: '#1D4ED8',
                        borderRadius: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(161, 86, 86, 0.1)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        },

        mostrarGraficoEstados(datos) {
            const ctx = document.getElementById('grafica-estado')?.getContext('2d');
            if (!ctx) return;

            if (graficoEstados) graficoEstados.destroy();

            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
            gradient.addColorStop(0, 'rgba(61, 89, 139, 0.7)');
            gradient.addColorStop(1, 'rgba(45, 55, 72, 0.1)');

            graficoEstados = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datos.labels,
                    datasets: [{
                        label: 'Miembros por Estado',
                        data: datos.data,
                        backgroundColor: gradient,
                        borderColor: '#2D3748',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#2D3748',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: '#2D3748',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(117, 85, 85, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#A0AEC0'
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                color: '#A0AEC0'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    }
                }
            });
        },

        mostrarTablaUniversidades(universidades) {
            if (!domElements.tablaUniversidades) return;

            domElements.tablaUniversidades.innerHTML = universidades
                .map(item => `
                    <div class="fila-tabla">
                        <div class="columna-universidad">${item.universidad}</div>
                        <div class="columna-numero">${item.miembros}</div>
                    </div>
                `)
                .join('');
        },

        cambiarVista(tipo) {
            // Definir elementos para cada vista
            const elementos = {
                geograficas: ['.grafico-pais', '.grafico-estado', '.grafico-universidad'],
                solicitudes: [
                    '.tarjeta-estadistica:nth-child(2)',
                    '.tarjeta-estadistica:nth-child(3)',
                    '.tarjeta-estadistica:nth-child(4)'
                ],
                membresias: [
                    '.tarjeta-estadistica:nth-child(5)',
                    '.tarjeta-estadistica:nth-child(6)',
                    '.grafico-universidad'
                ]
            };

            // Ocultar todos los elementos
            document.querySelectorAll('.contenedor-header > div, .grafico-pais, .grafico-estado, .grafico-universidad')
                .forEach(el => el.style.display = 'none');

            // Mostrar solo los elementos de la vista seleccionada
            elementos[tipo]?.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.display = 'block';
            });

            // Actualizar título
            const titulo = document.querySelector('.title-container p');
            if (titulo) {
                const textos = {
                    geograficas: 'Estadísticas Geográficas',
                    solicitudes: 'Estadísticas de Solicitudes',
                    membresias: 'Estadísticas de Membresías'
                };
                titulo.textContent = textos[tipo] || 'Estadísticas';
            }
        },

        async initialize() {
            try {
                // Obtener referencias del DOM
                domElements.totalMiembros = document.getElementById('total-miembros');
                domElements.solicitudesPendientes = document.getElementById('solicitudes-pendientes');
                domElements.solicitudesAceptadas = document.getElementById('solicitudes-aceptadas');
                domElements.solicitudesRechazadas = document.getElementById('solicitudes-rechazadas');
                domElements.tablaUniversidades = document.getElementById('tabla-universidades');
                domElements.membresiasCaducadas = document.getElementById('membresias-vencidas');
                domElements.membresiasActivadas = document.getElementById('membresias-activas');
                domElements.selectorEstadisticas = document.getElementById('selector-estadisticas');

                // Configurar evento para el selector
                domElements.selectorEstadisticas.addEventListener('change', (e) => {
                    this.cambiarVista(e.target.value);
                });

                // Mostrar estados de carga
                if (domElements.totalMiembros) domElements.totalMiembros.textContent = "Cargando...";
                if (domElements.solicitudesPendientes) domElements.solicitudesPendientes.textContent = "Cargando...";
                if (domElements.solicitudesAceptadas) domElements.solicitudesAceptadas.textContent = "Cargando...";
                if (domElements.solicitudesRechazadas) domElements.solicitudesRechazadas.textContent = "Cargando...";
                if (domElements.membresiasCaducadas) domElements.membresiasCaducadas.textContent = "Cargando...";
                if (domElements.membresiasActivadas) domElements.membresiasActivadas.textContent = "Cargando...";

                // Obtener y mostrar datos
                const data = await this.getDashboardData();

                // Actualizar contadores
                if (domElements.totalMiembros) actualizarContador(domElements.totalMiembros, data.totalMembers);
                if (domElements.solicitudesPendientes) actualizarContador(domElements.solicitudesPendientes, data.pendingRequests);
                if (domElements.solicitudesAceptadas) actualizarContador(domElements.solicitudesAceptadas, data.accepRequest);
                if (domElements.solicitudesRechazadas) actualizarContador(domElements.solicitudesRechazadas, data.rejectRequest);
                if (domElements.membresiasCaducadas) actualizarContador(domElements.membresiasCaducadas, data.membresiasVencidas);
                if (domElements.membresiasActivadas) actualizarContador(domElements.membresiasActivadas, data.membresiasActivas);

                // Mostrar gráficos y establecer vista inicial
                this.mostrarGraficoPaises(data.countries);
                this.mostrarTablaUniversidades(data.universities);
                this.mostrarGraficoEstados(data.states);
                this.cambiarVista('geograficas');

            } catch (error) {
                console.error('Error inicializando dashboard:', error);
                if (domElements.totalMiembros) actualizarContador(domElements.totalMiembros, 856);
                if (domElements.solicitudesPendientes) actualizarContador(domElements.solicitudesPendientes, 24);
                this.mostrarTablaUniversidades([{ universidad: "Error cargando datos", miembros: "---" }]);
            }
        }
    };
})();

// Inicialización
if (document.readyState === 'complete') {
    statisticsService.initialize();
} else {
    document.addEventListener('DOMContentLoaded', () => statisticsService.initialize());
}

export default statisticsService;