let valorTot = 0;
async function calcAndenes() {
    // Obtiene el valor ingresado en el input del código QR o patente
    const input = document.getElementById('andenQRPat').value;
    const cont = document.getElementById('contAnden');
    const dest = document.getElementById('destinoBuses');

    // Verifica si se ha seleccionado un destino válido
    if (!(dest.value > 0)) {
        alert('Seleccione Empresa y Destino');
        return;
    }

    // Verifica si el input cumple con el formato de patente
    if (!patRegEx.test(input)) {
        console.log('No es patente, leer QR');
        return;
    }

    try {
        const data = await getMovByPatente(input);
        if (!data) {
            alert('Patente no encontrada');
            return;
        }

        if (data['tipo'] === 'Anden') {
            if (data['fechasal'] === "0000-00-00") {
                cont.textContent = '';
                const date = new Date();
                const fechaent = new Date(`${data['fechaent']}T${data['horaent']}`);
                const diferencia = (date.getTime() - fechaent.getTime()) / 1000;
                const minutos = Math.ceil((diferencia / 60) / 25);

                const [elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, empPat] =
                    ['h1', 'h3', 'h3', 'h3', 'h3', 'h3', 'h4'].map(tag => document.createElement(tag));

                const ret = await getWLByPatente(data['patente']);
                const destInfo = await getDestByID(dest.value);

                let valorTot = minutos * destInfo['valor'];
                if (ret !== null) {
                    valorTot = 0;
                }

                // Asegura que el valor total no sea negativo
                if (valorTot < 0) {
                    valorTot = 0;
                }

                elemPat.textContent = `Patente: ${data['patente']}`;
                empPat.textContent = `Empresa: ${data['empresa']}`;
                fechaPat.textContent = `Fecha: ${data['fechaent']}`;
                horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
                horasalPat.textContent = `Hora salida: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                tiempPat.textContent = `Tiempo de Parking: ${minutos * 25} min.`;
                valPat.textContent = `Valor: $${valorTot}`;

                cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

                const datos = {
                    id: data['idmov'],
                    fecha: date.toISOString().split('T')[0],
                    hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                    valor: valorTot,
                };

                await updateMov(datos);
                refreshMov();
                refreshPagos();
                alert('Pago registrado!');
                document.getElementById('andenQRPat').value = '';

                impAnden(valorTot);
            } else {
                alert('Esta patente ya fue cobrada');
            }
        } else {
            parking();
            document.getElementById('parkingQRPat').value = input;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}


// Lista las empresas en un select
function listarAndenesEmpresas() {
    andGetEmpresas()
    .then(data => {
        if (data) {
            const lista = document.getElementById('empresaBuses');
            lista.textContent = '';
            let nullData = document.createElement('option');
            nullData.value = 0;
            nullData.textContent = 'Seleccione Empresa';
            lista.appendChild(nullData);
            data.forEach(itm => {
                let optData = document.createElement('option');
                optData.value = itm['idemp'];
                optData.textContent = itm['nombre'];
                lista.appendChild(optData);
            });
        }
    });
}

// Lista los destinos en un select
function listarAndenesDestinos() {
    andGetDestinos()
    .then(data => {
        if (data) {
            const lista = document.getElementById('destinoBuses');
            lista.textContent = '';
            let nullData = document.createElement('option');
            nullData.value = 0;
            nullData.textContent = 'Seleccione Destino';
            lista.appendChild(nullData);
            data.forEach(itm => {
                let optData = document.createElement('option');
                optData.value = itm['iddest'];
                optData.textContent = itm['ciudad'] + ' ($' + itm['valor'] + ')';
                lista.appendChild(optData);
            });
        }
    });
}

// Obtiene la lista de empresas desde la API
async function andGetEmpresas() {
    if (getCookie('jwt')) {
        let ret = await fetch(baseURL + "/empresas/get.php", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${getCookie('jwt')}`
                }
            })
            .then(reply => reply.json())
            .catch(error => console.log(error));
        return ret;
    }
}

// Obtiene la lista de destinos desde la API
async function andGetDestinos() {
    if (getCookie('jwt')) {
        let ret = await fetch(apiDestinos, {
                method: 'GET',
                mode: 'cors',
                headers: {
                  'Authorization': `Bearer ${getCookie('jwt')}`
                }
            })
            .then(reply => reply.json())
            .catch(error => console.log(error));
        return ret;
    }
}

// Función para imprimir la boleta del Andén
async function impAnden(valorTot) {
    console.log("valorTot recibido en impAnden: ", valorTot);
    const detalleBoleta = `53-${valorTot}-1-dsa-BANO`;  // Usamos el valor calculado para el detalle de la boleta

    try {
        const response = await fetch('php/boletas/generarBoleta.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigoEmpresa: "89",
                tipoDocumento: "39",  // Tipo de boleta afecta
                total: valorTot.toString(),
                detalleBoleta: detalleBoleta
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Redirigir a la URL de la boleta generada
            window.location.href = data.boletaUrl;
        } else {
            alert(`Error al generar la boleta: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar generar la boleta.');
    }
}
