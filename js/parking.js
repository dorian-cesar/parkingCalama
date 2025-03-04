async function calcParking() {
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');
    var empresaSelect = document.getElementById('empresaParking');

    if (!(empresaSelect.value > 0)) {
        alert('Seleccione una empresa');
        return;
    }

    try {
        const data = await getMovByPatente(input);
        if (!data) {
            alert('Patente no encontrada');
            return;
        }

        if (data['tipo'].toLowerCase() === 'parking' && data['fechasal'] === "0000-00-00") {
            cont.textContent = '';
            const now = new Date();
            const fechaEnt = new Date(data['fechaent'] + 'T' + data['horaent']);
            const fechaSalida = now;  

            let minutosCobrar = 0;
            let fechaIterativa = new Date(fechaEnt);

            while (fechaIterativa.toDateString() !== fechaSalida.toDateString()) {
                minutosCobrar += Math.min(1440, tarifas.topeDiario);
                fechaIterativa.setDate(fechaIterativa.getDate() + 1);
                fechaIterativa.setHours(0, 0, 0, 0);
            }

            let minutosDelDiaSalida = Math.ceil((fechaSalida - fechaIterativa) / 60000);
            minutosCobrar += Math.min(minutosDelDiaSalida, tarifas.topeDiario);

            let valorMinuto = tarifas.valorMinuto || 30;
            let valorTotal = valorMinuto * minutosCobrar;

            const ret = await getWLByPatente(data['patente']);
            if (ret !== null) {
                valorTotal = 0;
            }
//
            const [elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat] =
                ['h1', 'h4', 'h3', 'h3', 'h3', 'h3', 'h3'].map(tag => document.createElement(tag));

            elemPat.textContent = `Patente: ${data['patente']}`;
            const empresaNombre = empresaSelect.options[empresaSelect.selectedIndex].text;
            empPat.textContent = `Empresa: ${empresaNombre}`; // Mostrar el nombre de la empresa seleccionada
            fechaPat.textContent = `Fecha de Ingreso: ${data['fechaent']}`;
            horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;

            const horaSalida = `${fechaSalida.getHours().toString().padStart(2, '0')}:${fechaSalida.getMinutes().toString().padStart(2, '0')}:${fechaSalida.getSeconds().toString().padStart(2, '0')}`;
            horasalPat.textContent = `Hora Salida: ${horaSalida}`;
            tiempPat.textContent = `Tiempo de Parking: ${minutosCobrar} min.`;
            valPat.textContent = `Valor a Pagar: $${valorTotal}`;

            cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

            window.datosParking = {
                id: data['idmov'],
                patente: data['patente'],
                fecha: `${fechaSalida.getFullYear()}-${(fechaSalida.getMonth() + 1).toString().padStart(2, '0')}-${fechaSalida.getDate().toString().padStart(2, '0')}`,
                hora: horaSalida,
                valor: valorTotal,
                empresa: empresaSelect.value,  // Guardar la ID de la empresa seleccionada
                empresaNombre: empresaNombre   // Guardar el nombre de la empresa seleccionada
            };

        } else if (data['tipo'].toLowerCase() === 'anden') {
            alert('Este vehículo está en Andén, no en Parking.');
        } else {
            alert('Esta patente ya fue cobrada o no es válida para este cálculo');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function registrarPago() {
    if (!window.datosParking) {
        alert('Por favor, realiza la consulta del estacionamiento primero');
        return;
    }

    const datos = window.datosParking;
    const date = new Date();
    const valorTot = datos.valor || 0;
    const detalleBoleta = `53-${valorTot}-1-dsa-PARKING`;

    try {
        // Datos de pago a enviar a la API
        const datosPago = {
            id: datos.id,
            patente: datos.patente,
            fecha: date.toISOString().split('T')[0],
            hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            valor: valorTot,
            empresa: datos.empresa  // Incluir la ID de la empresa seleccionada
        };

        /*console.log("Datos a enviar a la API:", {
            codigoEmpresa: datos.empresa,  // Usar la ID de la empresa seleccionada
            tipoDocumento: "39",
            total: valorTot.toString(),
            detalleBoleta: detalleBoleta
        });*/

        // Llamada a la API para registrar el movimiento del pago
        await updateMov(datosPago);
        refreshMov();
        refreshPagos();
        alert('Pago registrado correctamente.');

        // Marcar la patente como pagada
        await marcarPatenteComoPagada(datos.id);

        // Ahora, imprimir la boleta térmica después de registrar el pago
        const ventanaImpr = window.open('', '_blank');
        imprimirBoletaTermicaParking(datos, ventanaImpr);

        // Se ha comentado el envío a la API para generar la boleta, ya no se realiza
        /*
        const response = await fetch(baseURL + "/boletas/generarBoleta.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigoEmpresa: datos.empresa,  // Usar la ID de la empresa seleccionada
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
            window.location.href = result.rutaAcepta;
        } else {
            console.warn(`Error al generar la boleta: ${result.respuesta || "Respuesta desconocida"}`);
            alert('Pago registrado, pero no se pudo generar la boleta.');
        }
        */

        // Limpiar formulario
        document.getElementById('parkingQRPat').value = '';
        document.getElementById('contParking').innerHTML = '';
        window.datosParking = null;

    } catch (error) {
        console.error('Error al registrar el pago o generar la boleta:', error);
        alert('Ocurrió un error al registrar el pago o generar la boleta.');
    }
}



function imprimirBoletaTermicaParking(datos, ventanaImpr) {
    ventanaImpr.document.write(`
        <html>
        <head>
            <title>Boleta de Pago</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                h1, h3 { margin: 0; }
                .line { border-bottom: 1px solid #000; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>WIT.LA</h1>
            <h3>Boleta de Pago (Parking)</h3>
            <div class="line"></div>
            <h3>Patente: ${datos.patente}</h3>
            <h3>Empresa: ${datos.empresaNombre}</h3>
            <h3>Fecha: ${datos.fecha}</h3>
            <h3>Hora: ${datos.hora}</h3>
            <div class="line"></div>
            <h3>Valor: $${datos.valor}</h3>
            <div class="line"></div>
            <h3>Gracias por su visita</h3>
        </body>
        </html>
    `);
    ventanaImpr.document.close();

    setTimeout(() => {
        ventanaImpr.focus();
        ventanaImpr.print();

        // Cierre ajustable de la ventana de impresión
        setTimeout(() => {
            try {
                ventanaImpr.close();
            } catch (e) {
                console.error("No se pudo cerrar la ventana:", e);
            }
        }, 1000); // Ajusta el tiempo según el navegador
    }, 1000);

    // Add event listener to close the window after printing or canceling
    ventanaImpr.onafterprint = () => {
        ventanaImpr.close();
    };
}

async function getMovByPatente(patente){
    if(getCookie('jwt')){
        let ret = await fetch(apiMovimientos+'?'+ new URLSearchParams({
            patente: patente
        }), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization' : `Bearer ${getCookie('jwt')}`
            }
        })
        .then(reply => reply.json())
        .then(data => {return data})
        .catch(error => {console.log(error)});
        return ret;
    }
}

function impParking(){
    const ventanaImpr = window.open('', '_blank');

    const contBoleta = document.getElementById('contParking');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:left; width: 640px;">');
    ventanaImpr.document.write(contBoleta.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();
    ventanaImpr.print();
}

async function handleCalcParking(button) {
    button.disabled = true;  // Deshabilitar el botón
    await calcParking();     // Esperar a que termine la función de cálculo
    setTimeout(() => {
        button.disabled = false;  // Habilitar el botón después de 1 segundo
    }, 1000);
}

// Función para listar empresas en el select de Parking
function listarEmpresasParking() {
    andGetEmpresas()
        .then(data => {
            if (data) {
                const lista = document.getElementById('empresaParking');
                lista.innerHTML = ''; // Limpiar el select

                // Agregar la opción por defecto
                const nullData = document.createElement('option');
                nullData.value = 0;
                nullData.textContent = 'Seleccione Empresa';
                lista.appendChild(nullData);

                // Agregar las empresas al select
                data.forEach(itm => {
                    const optData = document.createElement('option');
                    optData.value = itm['idemp'];
                    optData.textContent = itm['nombre'];
                    lista.appendChild(optData);
                });
            }
        })
        .catch(error => {
            console.error('Error al listar empresas:', error);
        });
}

// Llamar a la función para listar empresas al cargar la página
document.addEventListener('DOMContentLoaded', listarEmpresasParking);

// Obtiene la lista de empresas desde la API
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
        console.log(data);
        console.error('Error al obtener empresas:', error);
        return null;
    }
}

async function marcarPatenteComoPagada(idMov) {
    try {
        const response = await fetch(baseURL + "/movimientos/marcarPagado.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('jwt')}`
            },
            body: JSON.stringify({ id: idMov })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log("Respuesta del servidor al marcar como pagado:", result);

        if (result.respuesta !== "OK") {
            console.warn(`Error al marcar como pagado: ${result.respuesta || "Respuesta desconocida"}`);
        }
    } catch (error) {
        console.error('Error al marcar como pagado:', error);
    }
}

