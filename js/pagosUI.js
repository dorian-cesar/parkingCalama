var tablePagos = $('#tablePagos').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs: [{
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov' },
        { data: 'fecha' }, // Nueva columna para la fecha
        { data: 'tiempo' },
        { data: 'patente' },
        { data: 'empresa' },
        { data: 'tipo' },
        { data: 'valor' }
    ]
});

// Variable para almacenar la fecha seleccionada
let fechaSeleccionada = new Date().toISOString().split('T')[0]; // Fecha actual por defecto

// Función para cambiar la fecha seleccionada
function cambiarFecha() {
    const selectorFecha = document.getElementById('fechaSelector');
    fechaSeleccionada = selectorFecha.value; // Actualizar la fecha seleccionada
    refreshPagos(); // Refrescar la tabla con la nueva fecha
}

// Función para calcular el tiempo y valor por día
function calcularPagoPorDia(fechaEntrada, fechaSalida, tipo) {
    const tarifaPorMinuto = 20; // Valor por minuto
    const topeDiario = 480; // Tope diario en minutos

    let fechaInicio = new Date(fechaEntrada);
    let fechaFin = new Date(fechaSalida);

    // Redondear la fecha de inicio al inicio del día (00:00:00)
    fechaInicio.setHours(0, 0, 0, 0);

    // Redondear la fecha de fin al inicio del día (00:00:00)
    fechaFin.setHours(0, 0, 0, 0);

    // Calcular la diferencia en días
    const diferenciaDias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

    let pagosPorDia = [];

    for (let i = 0; i <= diferenciaDias; i++) {
        const fechaActual = new Date(fechaInicio);
        fechaActual.setDate(fechaInicio.getDate() + i);

        const inicioDia = new Date(fechaActual);
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date(fechaActual);
        finDia.setHours(23, 59, 59, 999);

        // Ajustar la fecha de entrada y salida para el día actual
        const fechaEntradaAjustada = new Date(Math.max(fechaEntrada, inicioDia));
        const fechaSalidaAjustada = new Date(Math.min(fechaSalida, finDia));

        // Calcular la diferencia de tiempo en minutos
        const diferencia = (fechaSalidaAjustada.getTime() - fechaEntradaAjustada.getTime()) / 1000;
        let minutos = Math.round(diferencia / 60); // Redondear al minuto más cercano

        // Aplicar el tope diario
        minutos = Math.min(minutos, topeDiario);

        // Calcular el valor
        const valor = minutos * tarifaPorMinuto;

        if (minutos > 0) {
            pagosPorDia.push({
                fecha: fechaActual.toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
                minutos: minutos,
                valor: valor
            });
        }
    }

    return pagosPorDia;
}

async function refreshPagos() {
    if (getCookie('jwt')) {
        const refreshBtn = document.getElementById('btnRefreshPagos');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov();

        if (data) {
            tablePagos.clear();

            data.forEach(item => {
                if (item['fechasal'] && item['fechasal'] !== "0000-00-00") {
                    const fechaEntrada = new Date(item['fechaent'] + 'T' + item['horaent']);
                    const fechaSalida = new Date(item['fechasal'] + 'T' + item['horasal']);

                    // Calcular los pagos por día
                    const pagosPorDia = calcularPagoPorDia(fechaEntrada, fechaSalida, item['tipo']);

                    // Filtrar solo los pagos de la fecha seleccionada
                    const pagosFiltrados = pagosPorDia.filter(pago => pago.fecha === fechaSeleccionada);

                    // Agregar cada pago diario a la tabla
                    pagosFiltrados.forEach(pago => {
                        tablePagos.rows.add([{
                            'idmov': item['idmov'],
                            'fecha': pago.fecha, // Fecha del pago
                            'tiempo': pago.minutos + ' min.',
                            'patente': item['patente'],
                            'empresa': item['empresa'],
                            'tipo': item['tipo'],
                            'valor': '$' + pago.valor.toFixed(2),
                        }]);
                    });
                }
            });
            tablePagos.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

async function impPagos() {
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write(`
        <html>
        <head>
            <title>Pagos</title>
            <link rel="stylesheet" href="css/styles.css">
        </head>
        <body style="text-align:center; width: 1280px;">
            <h1>Pagos del Día</h1>
            <table style="margin:auto;border:1px solid black;border-collapse:collapse">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tiempo</th>
                        <th>Patente</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
    `);

    try {
        const data = await getMov();

        if (data) {
            data.forEach(item => {
                if (item['fechasal'] && item['fechasal'] !== "0000-00-00") {
                    const fechaEntrada = new Date(item['fechaent'] + 'T' + item['horaent']);
                    const fechaSalida = new Date(item['fechasal'] + 'T' + item['horasal']);

                    // Calcular los pagos por día
                    const pagosPorDia = calcularPagoPorDia(fechaEntrada, fechaSalida, item['tipo']);

                    // Filtrar solo los pagos de la fecha seleccionada
                    const pagosFiltrados = pagosPorDia.filter(pago => pago.fecha === fechaSeleccionada);

                    // Agregar cada pago diario al reporte
                    pagosFiltrados.forEach(pago => {
                        ventanaImpr.document.write(`
                            <tr>
                                <td style="padding:5px">${pago.fecha}</td>
                                <td style="padding:5px">${pago.minutos} min.</td>
                                <td style="padding:5px">${item['patente']}</td>
                                <td style="padding:5px">${item['empresa']}</td>
                                <td style="padding:5px">${item['tipo']}</td>
                                <td style="padding:5px">$${pago.valor.toFixed(2)}</td>
                            </tr>
                        `);
                    });
                }
            });

            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}