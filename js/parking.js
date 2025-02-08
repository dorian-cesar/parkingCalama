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
            const fechaSalida = now;  // Usamos la fecha y hora local directamente

            let minutosCobrar = 0;
            let fechaIterativa = new Date(fechaEnt);

            while (fechaIterativa.toDateString() !== fechaSalida.toDateString()) {
                // Cobrar 300 minutos por cada día completo
                minutosCobrar += Math.min(1440, tarifas.topeDiario);
                fechaIterativa.setDate(fechaIterativa.getDate() + 1);
                fechaIterativa.setHours(0, 0, 0, 0);
            }

            // Calcular los minutos del día de salida
            let minutosDelDiaSalida = Math.ceil((fechaSalida - fechaIterativa) / 60000);
            minutosCobrar += Math.min(minutosDelDiaSalida, tarifas.topeDiario);

            let valorMinuto = tarifas.valorMinuto || 30;
            let valorTotal = valorMinuto * minutosCobrar;

            const ret = await getWLByPatente(data['patente']);
            if (ret !== null) {
                valorTotal = 0;
            }

            const [elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat] =
                ['h1', 'h4', 'h3', 'h3', 'h3', 'h3', 'h3'].map(tag => document.createElement(tag));

            elemPat.textContent = `Patente: ${data['patente']}`;
            empPat.textContent = `Empresa: ${data['empresa']}`;
            fechaPat.textContent = `Fecha de Ingreso: ${data['fechaent']}`;
            horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;

            // Ajuste para mostrar la hora local correctamente formateada
            const horaSalida = `${fechaSalida.getHours().toString().padStart(2, '0')}:${fechaSalida.getMinutes().toString().padStart(2, '0')}:${fechaSalida.getSeconds().toString().padStart(2, '0')}`;
            horasalPat.textContent = `Hora Salida: ${horaSalida}`;

            tiempPat.textContent = `Tiempo de Parking: ${minutosCobrar} min.`;
            valPat.textContent = `Valor a Pagar: $${valorTotal}`;

            cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

            // Guardar la fecha y hora local directamente en lugar de convertirla
            window.datosParking = {
                id: data['idmov'],
                fecha: `${fechaSalida.getFullYear()}-${(fechaSalida.getMonth() + 1).toString().padStart(2, '0')}-${fechaSalida.getDate().toString().padStart(2, '0')}`,
                hora: horaSalida,
                valor: valorTotal,
            };

        } else {
            alert('Esta patente ya fue cobrada o no es válida para este cálculo');
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