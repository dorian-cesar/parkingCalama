// Función para consultar los datos de la patente
async function consultarParking() {
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');

    // Validar si el input es una patente válida
    if (!patRegEx.test(input)) {
        console.log('No es patente, leer QR');
        return; // To-Do: Implementar lectura de QR o código de barras
    }

    try {
        // Obtener los datos de la patente desde la API
        const data = await getMovByPatente(input);

        if (!data) {
            alert('Patente no encontrada');
            return;
        }

        // Verificar si la patente es de tipo "Parking"
        if (data['tipo'] === 'Parking') {
            cont.textContent = ''; // Limpiar el contenido anterior
            const date = new Date();

            // Calcular el tiempo de estacionamiento
            var fechaent = new Date(data['fechaent'] + 'T' + data['horaent']);
            var fechaSalida = (data['fechasal'] !== "0000-00-00") 
                ? new Date(data['fechasal'] + 'T' + data['horasal']) 
                : date;

            // Calcular minutos por día con tope de 480 minutos (8 horas)
            const minutosPorDia = calcularMinutosPorDia(fechaent, fechaSalida);
            const minutosTotales = minutosPorDia.reduce((total, minutos) => total + minutos, 0);

            // Calcular el valor total (20 pesos por minuto)
            const valorTot = 20 * minutosTotales;

            // Crear elementos HTML para mostrar los datos
            const [elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, empPat] =
                ['h1', 'h3', 'h3', 'h3', 'h3', 'h3', 'h4'].map(tag => document.createElement(tag));

            // Asignar valores a los elementos HTML
            elemPat.textContent = `Patente: ${data['patente']}`;
            empPat.textContent = `Empresa: ${data['empresa']}`;
            fechaPat.textContent = `Fecha: ${data['fechaent']}`;
            horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;

            // Mostrar la hora de salida si ya fue cobrada
            if (data['fechasal'] !== "0000-00-00") {
                horasalPat.textContent = `Hora salida: ${data['fechasal']} ${data['horasal']}`;
            } else {
                horasalPat.textContent = 'Hora salida: ' + date.toLocaleTimeString();
            }

            tiempPat.textContent = `Tiempo de Parking: ${minutosTotales} min.`;
            valPat.textContent = `Valor: $${valorTot.toFixed(2)}`;

            // Agregar los elementos al contenedor
            cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

            // Guardar los datos para el pago (solo si no ha sido cobrada)
            if (data['fechasal'] === "0000-00-00") {
                window.pendingPayment = {
                    id: data['idmov'],
                    fecha: date.toISOString().split('T')[0],
                    hora: date.toLocaleTimeString(),
                    valor: valorTot,
                };
            } else {
                window.pendingPayment = null; // No permitir pagar si ya fue cobrada
            }

        } else {
            // Redirigir a la sección de buses si no es de tipo "Parking"
            buses();
            document.getElementById('andenQRPat').value = input;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Función para calcular minutos por día con tope de 480 minutos (8 horas)
function calcularMinutosPorDia(fechaInicio, fechaFin) {
    const minutosPorDia = [];
    let fechaActual = new Date(fechaInicio);

    // Asegurarse de que fechaFin sea un objeto Date
    if (!(fechaFin instanceof Date)) {
        fechaFin = new Date(fechaFin);
    }

    // Si el vehículo sale el mismo día, calcular el tiempo exacto
    if (fechaActual.toDateString() === fechaFin.toDateString()) {
        const minutosDia = Math.min(
            (fechaFin - fechaInicio) / 60000, // Diferencia en minutos
            480 // Tope de 480 minutos (8 horas)
        );
        minutosPorDia.push(Math.round(minutosDia));
        return minutosPorDia;
    }

    // Calcular el tiempo del primer día (desde la hora de entrada hasta las 23:59:59)
    const finPrimerDia = new Date(fechaActual);
    finPrimerDia.setHours(23, 59, 59, 999); // Fin del primer día
    const minutosPrimerDia = Math.min(
        (finPrimerDia - fechaInicio) / 60000,
        480 // Tope de 480 minutos
    );
    minutosPorDia.push(Math.round(minutosPrimerDia));

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
    fechaActual.setHours(fechaInicio.getHours(), fechaInicio.getMinutes(), fechaInicio.getSeconds(), fechaInicio.getMilliseconds()); // Inicio del día siguiente a la misma hora de entrada

    // Calcular los días completos (cada día completo se cobra con 480 minutos)
    while (fechaActual.toDateString() < fechaFin.toDateString()) {
        minutosPorDia.push(480); // Cada día completo se cobra con 480 minutos
        fechaActual.setDate(fechaActual.getDate() + 1); // Pasar al siguiente día
    }

    // Calcular el tiempo del último día (desde la hora de entrada hasta la hora de salida)
    const minutosUltimoDia = Math.min(
        (fechaFin - fechaActual) / 60000,
        480 // Tope de 480 minutos
    );
    minutosPorDia.push(Math.round(minutosUltimoDia));

    return minutosPorDia;
}

// Función para realizar el pago
async function realizarPago() {
    if (!window.pendingPayment) {
        alert('No hay datos de pago pendientes.');
        return;
    }

    try {
        // Marcar como pagado en la base de datos
        await updateMov(window.pendingPayment);
        refreshMov(); // Llamar a refreshMov después del pago
        refreshPagos();
        alert('Pago registrado!');
        document.getElementById('parkingQRPat').value = '';
        window.pendingPayment = null; // Limpiar el pago pendiente
    } catch (error) {
        console.error('Error al realizar el pago:', error);
        alert('No se pudo realizar el pago.');
    }
}

// Función para imprimir la boleta
function impParking() {
    const ventanaImpr = window.open('', '_blank');

    const contBoleta = document.getElementById('contParking');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:left; width: 640px;">');
    ventanaImpr.document.write(contBoleta.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();
    ventanaImpr.print();
}