import apiClient from '../apiClient.js';
import loginService from '../services/login.js';
import membresiaUsuarioService from '../services/membresiaUsuario.js';
import membersService from '../services/members.js';

const { jsPDF } = window.jspdf;

let tipoMembresia = ""

document.addEventListener('DOMContentLoaded', async () => {
    if (!loginService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userData = loginService.getUserData();
    if (!userData?.userId) {
        console.error('No se pudo obtener el ID del usuario');
        return;
    }

    try {
        const response = await membresiaUsuarioService.getByUserId(userData.userId);
        
        if (response.success && response.data) {
            console.log('Datos de membresías a renderizar:', response.data);
            tipoMembresia = response.data[0].membresia_nombre;
            renderMembresias(response.data);
        } else {
            console.error('Error al obtener membresías:', response.message);
            renderMembresias([]);
        }
    } catch (error) {
        console.error('Error:', error);
        renderMembresias([]);
    }
});

function renderMembresias(membresiasData) {
    const tbody = document.querySelector('.membership-table tbody');
    tbody.innerHTML = '';

    if (!membresiasData?.length) {
        tbody.innerHTML = '<tr><td colspan="6">No tienes membresías registradas</td></tr>';
        return;
    }

    membresiasData.forEach((membresia, index) => {
        const row = document.createElement('tr');
        const estado = membresia.estado?.toString()?.toLowerCase()?.trim();
        const esActiva = estado === 'activa' || estado === 'activo'; 
        
        row.innerHTML = `
            <td>${membresia.id || 'N/A'}</td>
            <td>${formatDate(membresia.fecha_inicio)}</td>
            <td>${formatDate(membresia.fecha_fin)}</td>
            <td>${membresia.membresia_nombre || 'N/A'}</td>
            <td><span class="${getEstadoClass(estado)}">${membresia.estado || 'N/A'}</span></td>
            <td class="action-cell"></td>
        `;

        const actionCell = row.querySelector('.action-cell');
        if (esActiva) {  
            const downloadBtn = document.createElement('button');
            const downloadIcon = document.createElement('i');
            downloadIcon.className = "fa-solid fa-download";
            downloadBtn.className = 'download-btn';

            downloadBtn.textContent = 'Descargar';
            downloadBtn.addEventListener('click', () => generateMembershipPDF(membresia));
            downloadBtn.appendChild(downloadIcon);
            actionCell.appendChild(downloadBtn);
        } else {
            actionCell.textContent = 'No disponible';
        }

        tbody.appendChild(row);
    });
}

async function generateMembershipPDF(membresia) {
    try {
        // Obtener datos del usuario
        const userData = loginService.getUserData();
        const userId = userData?.userId;
        
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }

        // Obtener información completa del miembro
        const memberResponse = await membersService.getbyID(userId);
        if (!memberResponse || (!memberResponse.nombre && !memberResponse.apellidos)) {
            throw new Error('No se pudo obtener la información del perfil');
        }
        console.log(memberResponse)
        // Crear documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configuración de página
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = 30;
        
        // Cargar logo REDMIS para usar en varias secciones
        let logoREDMIS;
        try {
            logoREDMIS = await loadImageToDataURL('./img/logo_REDMIS.png');
        } catch (e) {
            console.log('No se pudo cargar el logo:', e);
        }

        // ------ HEADER SECTION ------
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPosition - 10, pageWidth - (margin * 2), 30, 5, 5, 'FD');

        // Agregar logo en el header a la izquierda
        let logoWidth = 0;
        if (logoREDMIS) {
            const maxHeight = 20;
            const aspectRatio = logoREDMIS.width / logoREDMIS.height;
            const logoHeight = Math.min(maxHeight, 30);
            logoWidth = logoHeight * aspectRatio;
            doc.addImage(logoREDMIS.dataUrl, 'PNG', margin + 10, yPosition - 5, logoWidth, logoHeight);
        }

        // Título del header: centrado respecto al espacio libre (tomando en cuenta el logo)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const titleText = 'Red Mexicana de Ingeniería de Software';
        const leftOffset = logoREDMIS ? (margin + 10 + logoWidth + 5) : margin;
        const centerTextX = leftOffset + ((pageWidth - margin) - leftOffset) / 2;
        doc.text(titleText, centerTextX, yPosition + 5, { align: 'center' });

        yPosition += 40;

        // ------ CONTENT SECTION ------
        // Crear un rectángulo redondeado para el contenido
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPosition - 10, pageWidth - (margin * 2), 120, 5, 5, 'FD');

        // Título "Gracias"
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Gracias', margin + 10, yPosition);

        yPosition += 10;

        // Mensajes con wrap automático para mantenerlos dentro del recuadro
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let contentWidth = pageWidth - margin * 2 - 20;

        let msg1 = doc.splitTextToSize('Por adquirir su membresía', contentWidth);
        doc.text(msg1, margin + 10, yPosition);
        yPosition += msg1.length * 5;

        let msg2 = doc.splitTextToSize('Desde ahora Usted forma parte del nodo:', contentWidth);
        doc.text(msg2, margin + 10, yPosition);
        yPosition += msg2.length * 5;

        let msg3 = doc.splitTextToSize(memberResponse.universidad || 'Universidad', contentWidth);
        doc.text(msg3, margin + 10, yPosition);
        yPosition += msg3.length * 5;

        yPosition += 12;

        // Título "Nodos pertenecientes a la red"
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Nodos pertenecientes a la red', margin + 10, yPosition);

        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        // Primera columna de universidades
        const universities1 = [
            'Universidad Autónoma de Baja California',
            'Universidad Nacional Autónoma de México',
            'Universidad Autónoma de San Luis Potosí',
            'Universidad Autónoma de Yucatán',
            'Universidad Autónoma de Zacatecas',
            'Universidad Tecnológica de la Mixteca',
            'Universidad Popular Autónoma del Estado de Puebla',
            'Universidad Veracruzana',
            'Universidad Autónoma de Sinaloa',
            'Universidad Autónoma Metropolitana'
        ];

        // Segunda columna de universidades
        const universities2 = [
            'Universidad Autónoma de Ciudad Juárez',
            'Instituto Tecnológico de Hermosillo',
            'Centro Nacional de Investigación y Desarrollo \nTecnológico (CENIDET)',
            'Instituto Tecnológico y de Estudios Superiores de\n Monterrey',
            'CINVESTAV, Tamaulipas',
            'Universidad Politécnica de Tapachula',
            'Instituto Tecnológico de Sonora',
            'Instituto Tecnológico de Tijuana',
            'Instituto Tecnológico de León'
        ];

        // Se reemplaza el renderizado de universidades para hacer wrap al contenido
        const wrapWidth = (pageWidth / 2) - 20;
        let col1Y = yPosition;
        universities1.forEach(uni => {
            const lines = doc.splitTextToSize(`• ${uni}`, wrapWidth);
            doc.text(lines, margin + 10, col1Y);
            col1Y += lines.length * 5;
        });
        let col2Y = yPosition;
        universities2.forEach(uni => {
            const lines = doc.splitTextToSize(`• ${uni}`, wrapWidth);
            doc.text(lines, margin + (pageWidth / 2) - 10, col2Y);
            col2Y += lines.length * 5;
        });
        yPosition += Math.max(col1Y - yPosition, col2Y - yPosition) + 20;

        // ------ MEMBERSHIP CARDS SECTION ------
        // Configuración de tarjetas
        const cardWidth = 70;
        const cardHeight = 45;
        const cardGap = 15;

        // Crear fondo de gradiente dorado para tarjetas
        const createGoldGradient = (width, height) => {
            const scale = 4; // Factor de escala aumentado para mayor resolución
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);

            // Habilitar suavizado de imagen
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Gradiente dorado
            const gradient = ctx.createLinearGradient(0, 0, width, height/2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.51)');
            gradient.addColorStop(0.4, 'rgba(163, 163, 163, 0.2)');
            gradient.addColorStop(0.7, 'rgba(163, 163, 163, 0.29)');
            gradient.addColorStop(0.9, 'rgba(163, 163, 163, 0.44)');

            // Dibujar rectángulo con bordes redondeados
            const radius = 8;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.arcTo(width, 0, width, height, radius);
            ctx.arcTo(width, height, 0, height, radius);
            ctx.arcTo(0, height, 0, 0, radius);
            ctx.arcTo(0, 0, width, 0, radius);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde dorado más oscuro
            // ctx.strokeStyle = 'rgba(178, 132, 5, 0.8)';
            // ctx.lineWidth = 0.5;
            // ctx.stroke();

            return canvas.toDataURL('image/png');
        };

        // Calcular posición X para centrar las tarjetas
        const cardsStartX = (pageWidth - (2 * cardWidth + cardGap)) / 2;

        // ------ TARJETA FRONTAL ------
        const cardFrontImg = createGoldGradient(cardWidth, cardHeight);
        doc.addImage(cardFrontImg, 'PNG', cardsStartX, yPosition, cardWidth, cardHeight);

        // Tipo de membresía
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        // Se centra el texto dentro de la tarjeta
        const centerX = cardsStartX + cardWidth / 2;
        doc.text(tipoMembresia, centerX, yPosition + 8, { align: 'center' });

        // Detalles de la tarjeta frontal
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Socio: ${(memberResponse.nombre + ' ' + memberResponse.apellidos) || 'Nombre del miembro'}`, cardsStartX + 5, yPosition + 16);
        doc.text(`No.: ${membresia.id || '3'} Tipo: G País: ${memberResponse.pais || ''}`, cardsStartX + 5, yPosition + 21);
        doc.text(`IES: ${memberResponse.universidad || 'Universidad...'}`, cardsStartX + 5, yPosition + 26);

        // Texto MEMBRESÍA en parte inferior
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MEMBRESÍA', cardsStartX + 5, yPosition + cardHeight - 5);

        // Logo en esquina inferior derecha (tarjeta frontal)
        if (logoREDMIS) {
            const logoHeight = 12; // Altura deseada en mm
            const aspectRatio = logoREDMIS.width / logoREDMIS.height;
            const logoWidth = logoHeight * aspectRatio;

            doc.addImage(logoREDMIS.dataUrl, 'PNG', cardsStartX + cardWidth - logoWidth - 5,
                yPosition + cardHeight - logoHeight - 3, logoWidth, logoHeight);
        }

        // ------ TARJETA TRASERA ------
        const cardBackImg = createGoldGradient(cardWidth, cardHeight);
        doc.addImage(cardBackImg, 'PNG', cardsStartX + cardWidth + cardGap, yPosition, cardWidth, cardHeight);

        const backX = cardsStartX + cardWidth + cardGap;

        // Título de la tarjeta trasera
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Red Mexicana de Ingeniería de Software', backX + 5, yPosition + 6);

        // Texto informativo en dos columnas
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');

        const backText1 = doc.splitTextToSize('Esta membresía le identifica a Usted como miembro de la REDMIS, conformada por profesores, investigadores, profesionistas y practicantes relacionados con la Ingeniería de Software, Desarrollo de Software y disciplinas afines.',
            (cardWidth - 10) / 2);
        doc.text(backText1, backX + 3, yPosition + 12);

        const backText2 = doc.splitTextToSize('Puede participar en las actividades, reuniones, eventos, iniciativas de educación, proyectos de investigación, etc., así como participar en la organización de eventos: CONISOFT, pláticas, conferencias, cursos, etc.',
            (cardWidth - 10) / 2);
        doc.text(backText2, backX + (cardWidth/2) + 2, yPosition + 12);

        // Imágenes de la parte inferior: Firma
        let firmaImg;
        try {
            firmaImg = await loadImageToDataURL('./img/firma.png');
        } catch(e) {
            console.log('No se pudo cargar firma:', e);
        }
        if (firmaImg) {
            const firmaHeight = 12;
            const firmaWidth = firmaHeight * (firmaImg.width / firmaImg.height);
            doc.addImage(firmaImg.dataUrl, 'PNG', backX + 10, yPosition + 25, firmaWidth, firmaHeight);
        }

        // Logo en la parte derecha (tarjeta trasera)
        if (logoREDMIS) {
            const logoHeight = 12; // Altura deseada en mm
            const aspectRatio = logoREDMIS.width / logoREDMIS.height;
            const logoWidth = logoHeight * aspectRatio;

            doc.addImage(logoREDMIS.dataUrl, 'PNG', backX + cardWidth - logoWidth - 5,
                yPosition + cardHeight - logoHeight - 3, logoWidth, logoHeight);
        }

        // Pie de página con sitio web
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');

        // Guardar el PDF
        const nombreArchivo = `Membresía_${memberResponse.nombre_completo || memberResponse.nombre || 'usuario'}.pdf`;
        doc.save(nombreArchivo);
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el certificado: ' + error.message);
    }
}

function loadImageToDataURL(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                width: img.width,
                height: img.height
            });
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleDateString('es-ES');
    } catch {
        return dateString;
    }
}

function getEstadoClass(estado) {
    const classMap = {
        'activa': 'aceptada',
        'activo': 'aceptada',
        'inactivo': 'rechazada',
        'inactiva': 'rechazada',
        'pendiente': 'pendiente',
        'vencido': 'rechazada',
        'vencida': 'rechazada'
    };
    return classMap[estado] || '';
}

