/* Data Access */
const apiEmpresas = baseURL+"/empresas/api.php";

// Obtiene todos los registros
async function getEmp() {
    let ret = await fetch(apiEmpresas, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Obtiene un registro basado en ID
async function getEmpByID(idIn) {
    let ret = await fetch(apiEmpresas + '?' + new URLSearchParams({
        id: idIn
        }), {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Borra un registro basado en ID
async function deleteEmp(idIn) {
    let ret = await fetch(apiEmpresas, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify({ id: idIn })
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Actualiza un registro
// Datos: id, ciudad, valor
async function updateEmp(datos) {
    let ret = await fetch(apiEmpresas, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Inserta un registro
// Datos: ciudad, valor
async function insertEmp(datos) {
    let ret = await fetch(apiEmpresas, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}