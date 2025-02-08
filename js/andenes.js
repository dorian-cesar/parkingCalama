let valorTotGlobal = 0;  // Variable global para almacenar el valor total

async function calcAndenes() {
    const input = document.getElementById('andenQRPat').value;
    const cont = document.getElementById('contAnden');
    const dest = document.getElementById('destinoBuses');

    if (!(dest.value > 0)) {
        alert('Seleccione Empresa y Destino');
        return;
    }

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
                let minutos = Math.ceil(diferencia / 60);

                const destInfo = await getDestByID(dest.value);
                let valorBase = destInfo['valor'];
                let bloques = 0;

                if (destInfo['tipo'] === 'nacional') {
                    bloques = Math.ceil(minutos / configuracion.nacional);
                    valorBase *= bloques;
                } else if (destInfo['tipo'] === 'internacional') {
                    bloques = Math.ceil(minutos / configuracion.internacional);
                    valorBase *= bloques;
                }

                valorTotGlobal = valorBase;

                const ret = await getWLByPatente(data['patente']);
                if (ret !== null) {
                    valorTotGlobal = 0;
                }

                if (valorTotGlobal < 0) {
                    valorTotGlobal = 0;
                }

                const iva = valorTotGlobal * configuracion.iva;
                const valorConIVA = valorTotGlobal + iva;

                const [elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, ivaPat, totalPat] =
                    ['h1', 'h3', 'h3', 'h3', 'h3', 'h3', 'h3', 'h3'].map(tag => document.createElement(tag));

                elemPat.textContent = `Patente: ${data['patente']}`;
                fechaPat.textContent = `Fecha ingreso: ${data['fechaent']}`;
                horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
                horasalPat.textContent = `Hora salida: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                tiempPat.textContent = `Tiempo de Parking: ${minutos} min.`;
                valPat.textContent = `Valor NETO: $${valorTotGlobal.toFixed(0)}`;
                ivaPat.textContent = `IVA (${(configuracion.iva * 100).toFixed(0)}%): $${iva.toFixed(0)}`;
                totalPat.textContent = `Total con IVA: $${valorConIVA.toFixed(0)}`;
                cont.append(elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, ivaPat, totalPat);

                // Actualiza valorTotGlobal con el texto de totalPat
                valorTotGlobal = parseFloat(totalPat.textContent.replace(/\D+/g, '')) || 0;

            } else {
                alert('Esta patente ya fue cobrada');
            }
        } else {
            parking();
            document.getElementById('parkingQRPat').value = input;
        }
    } catch (error) {
        console.error('Error en el cálculo:', error);
    }
}

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

// Función auxiliar para cargar y filtrar destinos
async function cargarDestinos(tipoDest, lista) {
    try {
        const data = await andGetDestinos();
        if (data) {
            lista.textContent = '';  // Limpia la lista de destinos
            let nullData = document.createElement('option');
            nullData.value = 0;
            nullData.textContent = 'Seleccione Destino';
            lista.appendChild(nullData);

            // Filtrar y mostrar los destinos según el tipo seleccionado
            data.forEach(itm => {
                if (itm['tipo'] === tipoDest) {
                    let optData = document.createElement('option');
                    optData.value = itm['iddest'];
                    optData.textContent = `${itm['ciudad']} - $${itm['valor']}`;
                    lista.appendChild(optData);
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar los destinos:', error);
    }
}


// Función para listar andenes y destinos (también utiliza la función auxiliar)
async function listarAndenesDestinos() {
    const tipoDest = document.getElementById('tipoDestino').value; // Obtener el tipo de destino seleccionado
    const lista = document.getElementById('destinoBuses');

    if (!tipoDest) {
        lista.textContent = '';  // Limpia el contenedor
        return;
    }

    cargarDestinos(tipoDest, lista);
}

// Agregar un evento para que se ejecute al cambiar el tipo de destino
document.getElementById('tipoDestino').addEventListener('change', listarAndenesDestinos);


// Agregar un evento para que se ejecute al cambiar el tipo de destino
document.getElementById('tipoDestino').addEventListener('change', listarAndenesDestinos);


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

async function pagarAnden(valorTot = valorTotGlobal) {  
    console.log("valorTot recibido en impAnden:", valorTot);

    const input = document.getElementById('andenQRPat').value;
    const cont = document.getElementById('contAnden');
    const date = new Date();

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
                console.log("Patente válida, registrando el pago...");

                // Registro del pago en la base de datos
                const datos = {
                    id: data['idmov'],
                    fecha: date.toISOString().split('T')[0],
                    hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                    valor: valorTot
                };

                await updateMov(datos);
                refreshMov();
                refreshPagos();

                alert('Pago registrado correctamente.');

                // Intentar generar la boleta
                const detalleBoleta = `53-${valorTot}-1-dsa-BANO`;
                console.log("Datos a enviar a la API:", {
                    codigoEmpresa: "89",
                    tipoDocumento: "39",
                    total: valorTot.toString(),
                    detalleBoleta: detalleBoleta
                });

                try {
                    const response = await fetch(baseURL + "/boletas/generarBoleta.php", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            codigoEmpresa: "89",
                            tipoDocumento: "39",
                            total: valorTot.toString(),
                            detalleBoleta: detalleBoleta
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }

                    const result = await response.json();
                    console.log("Respuesta del servidor:", result);

                    if (result.respuesta === "OK" && result.rutaAcepta) {
                        console.log("Boleta generada correctamente.");
                        window.location.href = result.rutaAcepta;  // Redirigir a la URL del PDF
                    } else {
                        console.warn(`Error al generar la boleta: ${result.respuesta || "Respuesta desconocida"}`);
                        alert('Pago registrado, pero no se pudo generar la boleta.');
                    }
                } catch (error) {
                    console.error('Error al generar la boleta:', error);
                    alert('Pago registrado, pero ocurrió un error al intentar generar la boleta.');
                }

                // Limpiar el campo de entrada y el contenedor después de registrar el pago y generar la boleta
                document.getElementById('andenQRPat').value = '';
                cont.innerHTML = '';  // Limpia el contenedor de información

            } else {
                alert('Esta patente ya fue cobrada');
            }
        } else {
            alert('La patente pertenece a un tipo distinto de movimiento.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar la solicitud.');
    }
}

async function filtrarDestinos() {
    const tipoDest = document.getElementById('tipoDestino').value; // Obtener el tipo de destino seleccionado
    const lista = document.getElementById('destinoBuses');

    if (tipoDest === '0') {
        return; // Si no se ha seleccionado ningún tipo de destino, no hacemos nada
    }

    cargarDestinos(tipoDest, lista);
}