// ============================================
// CONFIGURACIÓN DE VIDEOS EN LA NUBE
// ============================================
// 
// INSTRUCCIONES RÁPIDAS:
// 1. Elige un servicio (Cloudinary, Google Drive o YouTube)
// 2. Sube tus videos y copia las URLs
// 3. Pega las URLs en los campos correspondientes abajo
// 4. Cambia "usar" al servicio que elegiste
// 
// Si no configuras nada, los videos se cargarán desde la carpeta local "Video/"
// ============================================

const VIDEO_URLS = {
    // Video: "Introducción CRUD en Laravel.webm"
    introduccion: {
        cloudinary: "",  // Ejemplo: "https://res.cloudinary.com/mi-cloud/video/upload/v1234567890/intro.webm"
        googleDrive: "https://drive.google.com/file/d/1uP6dkZySCkZXnjTCZe1G7s1erC5Ywlzm/preview", // Formato para streaming
        youtube: "",     // Ejemplo: "https://www.youtube.com/embed/ABC123xyz" o "https://youtu.be/ABC123xyz"
        usar: "googleDrive"         // Cambia a: "cloudinary", "googleDrive" o "youtube"
    },
    
    // Video: "CRUD completo en Laravel.webm"
    crudCompleto: {
        cloudinary: "",
        googleDrive: "https://drive.google.com/file/d/1KGZkAGS5RRSxY2Y2Iliu6fbSpzNzsiSa/preview",
        youtube: "",
        usar: "googleDrive"
    },
    
    // Video: "Validación de formularios.webm"
    validacion: {
        cloudinary: "",
        googleDrive: "https://drive.google.com/file/d/1wOugmgCgtSxu4iPTnhVoFXyA2pGV7lAB/preview",
        youtube: "",
        usar: "googleDrive"
    },
    
    // Video: "API REST con Laravel.webm"
    apiRest: {
        cloudinary: "",
        googleDrive: "https://drive.google.com/file/d/1TtGyYAyUsLz_eb-TXfjN11CbtUs2_zyP/preview",
        youtube: "",
        usar: "googleDrive"
    }
};

// Función para obtener la URL del video según la configuración
function getVideoUrl(videoKey) {
    const video = VIDEO_URLS[videoKey];
    if (!video) return null;
    
    // Si no hay servicio configurado, retornar null (usará video local)
    if (!video.usar || video.usar === "") return null;
    
    const url = video[video.usar];
    
    // Verificar que la URL no esté vacía y no sea un placeholder
    if (!url || url === "" || url.includes("TU_URL") || url.includes("Ejemplo:")) {
        return null;
    }
    
    return url;
}

