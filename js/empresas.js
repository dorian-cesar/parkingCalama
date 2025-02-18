// empresas.js

async function andGetEmpresas() {
    try {
        const response = await fetch(baseURL + "/empresas/api.php", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getCookie('jwt')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        return null;
    }
}