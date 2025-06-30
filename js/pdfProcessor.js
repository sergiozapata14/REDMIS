function getPDF(fileBase64) {
    const base64String = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    const blob = new Blob([Uint8Array.from(atob(base64String), c => c.charCodeAt(0))], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return url;
}

export {getPDF}