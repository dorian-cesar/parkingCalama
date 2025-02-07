const apiTarifas = baseURL+"/tarifas/api.php";

async function calcParking() {
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');

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

        if (data['tipo'] === 'Parking' && data['fechasal'] === "0000-00-00") {
            cont.textContent = '';
            const now = new Date();
            const fechaEnt = new Date(data['fechaent'] + 'T' + data['horaent']);

            let minutosCobrar = 0;

            // Normalizar fechas (eliminar segundos)
            const fechaIngreso = new Date(fechaEnt.setSeconds(0));
            const fechaSalida = new Date(now.setSeconds(0));

            if (fechaIngreso.toDateString() === fechaSalida.toDateString()) {
                let minutosTotales = Math.ceil((fechaSalida - fechaIngreso) / 60000);
                minutosCobrar = Math.min(minutosTotales, 300);
            } else {
                let minutosTotales = Math.ceil((fechaSalida - fechaIngreso) / 60000);
                let diasCompletos = Math.floor(minutosTotales / 1440);
                let minutosRestantes = minutosTotales % 1440;
                
                minutosCobrar += diasCompletos * 300;
                minutosCobrar += Math.min(minutosRestantes, 300);
            }

            let valorMinuto = 30;
            try {
                const jwt = getCookie('jwt');
                const tarifaResp = await fetch(apiTarifas, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json'
                    }
                });

                const tarifaData = await tarifaResp.json();
                if (tarifaResp.ok && tarifaData.valor_minuto) {
                    valorMinuto = tarifaData.valor_minuto;
                }
            } catch (error) {
                console.error('Error obteniendo tarifa:', error);
            }

            let valorTotal = valorMinuto * minutosCobrar;

            const ret = await getWLByPatente(data['patente']);
            if (ret !== null) {
                valorTotal = 0;
            }

            const [elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat] =
                ['h1', 'h4', 'h3', 'h3', 'h3', 'h3', 'h3'].map(tag => document.createElement(tag));

            elemPat.textContent = `Patente: ${data['patente']}`;
            empPat.textContent = `Empresa: ${data['empresa']}`;
            fechaPat.textContent = `Fecha: ${data['fechaent']}`;
            horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
            horasalPat.textContent = `Hora salida: ${fechaSalida.getHours()}:${fechaSalida.getMinutes()}:${fechaSalida.getSeconds()}`;
            tiempPat.textContent = `Tiempo de Parking: ${minutosCobrar} min.`;
            valPat.textContent = `Valor: $${valorTotal}`;

            cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

            window.datosParking = {
                id: data['idmov'],
                fecha: fechaSalida.toISOString().split('T')[0],
                hora: `${fechaSalida.getHours()}:${fechaSalida.getMinutes()}:${fechaSalida.getSeconds()}`,
                valor: valorTotal,
            };

        } else {
            alert('Esta patente ya fue cobrada');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function registrarPago() {
    // Asegúrate de que los datos hayan sido obtenidos previamente con la función de consulta
    if (!window.datosParking) {
        alert('Por favor, realiza la consulta del estacionamiento primero');
        return;
    }

    const datos = window.datosParking;

    try {
        await updateMov(datos);
        refreshMov();
        refreshPagos();
        alert('Pago registrado!');

        // Limpiar el campo del QR
        document.getElementById('parkingQRPat').value = '';

        // Limpiar el contenido del contenedor donde se muestran los datos de calcParking
        const cont = document.getElementById('contParking');
        cont.innerHTML = '';  // Elimina todos los elementos dentro del contenedor

        // Limpiar la variable global de datos de parking
        window.datosParking = null;
    } catch (error) {
        console.error('Error al registrar el pago:', error.message);
    }
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