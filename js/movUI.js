var tableMov = $('#tableMov').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs: [{
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov' },
        { data: 'fechaent' },
        { data: 'fechasal' },
        { data: 'patente' },
        { data: 'empresa' },
        { data: 'tipo' }
    ]
});

// Abrir Modales
async function modalMovInsert() {
    const form = document.getElementById('formInsertMov');
    form.patente.value = '';

    let empresas = await getEmp();

    if (empresas) {
        form.empresa.textContent = '';
        empresas.forEach(data => {
            var optIn = document.createElement('option');
            optIn.value = data['idemp'];
            optIn.textContent = data['nombre'];
            form.empresa.appendChild(optIn);
        });
    }

    openModal('movinsert');
}

// Refrescar la tabla de movimientos
async function refreshMov() {
    if (getCookie('jwt')) {
        const refreshBtn = document.getElementById('btnRefreshMov');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov();

        if (data) {
            tableMov.clear();
            data.forEach(item => {
                tableMov.rows.add([{
                    'idmov': item['idmov'],
                    'fechaent': item['horaent'],
                    'fechasal': item['horasal'],
                    'patente': item['patente'],
                    'empresa': item['empresa'],
                    'tipo': item['tipo']
                }]);
            });
            tableMov.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

// Insertar un nuevo movimiento
async function doInsertMov(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertMov');

    if (!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    const dateNow = new Date();

    datos = {
        fecha: dateNow.toISOString().split('T')[0],
        hora: `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`,
        patente: form.patente.value,
        empresa: form.empresa.value,
        tipo: form.tipo.value
    };

    let ret = await insertMov(datos);
    if (ret['error']) {
        alert(ret['error']);
    } else {
        closeModal('movinsert');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshMov();
}

// Imprimir movimientos
async function impMovimientos() {
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write(`
        <html>
        <head>
            <title>Movimientos</title>
            <link rel="stylesheet" href="css/styles.css">
        </head>
        <body style="text-align:center; width: 1280px;">
            <h1>Movimientos del Día</h1>
            <table style="margin:auto;border:1px solid black;border-collapse:collapse">
                <thead>
                    <tr>
                        <th>Ingreso</th>
                        <th>Salida</th>
                        <th>Patente</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
    `);

    try {
        const data = await getMov();

        if (data) {
            data.forEach(itm => {
                ventanaImpr.document.write(`
                    <tr>
                        <td style="padding:5px">${itm['horaent']}</td>
                        <td style="padding:5px">${itm['horasal']}</td>
                        <td style="padding:5px">${itm['patente']}</td>
                        <td style="padding:5px">${itm['empresa']}</td>
                        <td style="padding:5px">${itm['tipo']}</td>
                    </tr>
                `);
            });

            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Obtener la tarifa por tipo de movimiento
async function getTarifaPorTipo(tipo) {
    try {
        const response = await fetch(`/tarifas/api.php?tipo=${tipo}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getCookie('jwt')}`
            }
        });
        const data = await response.json();
        if (data.error) {
            console.error('Error:', data.error);
            return null;
        }
        return data.valor_minuto;
    } catch (error) {
        console.error('Error al obtener la tarifa:', error);
        return null;
    }
}

// Calcular minutos por día con tope de 480 minutos
function calcularMinutosPorDia(fechaInicio, fechaFin) {
    const minutosPorDia = [];
    let fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
        const inicioDia = new Date(fechaActual);
        inicioDia.setHours(0, 0, 0, 0); // Medianoche del día actual

        const finDia = new Date(fechaActual);
        finDia.setHours(23, 59, 59, 999); // Final del día actual

        const minutosDia = Math.min(
            (Math.min(fechaFin, finDia) - Math.max(fechaInicio, inicioDia)) / 60000, // Diferencia en minutos
            480 // Tope diario
        );

        minutosPorDia.push(Math.round(minutosDia)); // Redondear al minuto más cercano
        fechaActual.setDate(fechaActual.getDate() + 1); // Siguiente día
    }

    return minutosPorDia;
}

// Función principal para calcular el pago
async function calcParking() {
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');

    if (!patRegEx.test(input)) {
        console.log('No es patente, leer QR');
        return; // To-Do leer QR o Codigo de Barra
    }

    try {
        const data = await getMovByPatente(input);

        if (!data) {
            alert('Patente no encontrada');
            return;
        }

        if (data['tipo'] === 'Parking' || data['tipo'] === 'Anden') {
            if (data['fechasal'] === "0000-00-00") {
                cont.textContent = '';
                const date = new Date();

                // Obtener la tarifa por minuto desde la API
                const valorMinuto = await getTarifaPorTipo(data['tipo']);
                if (valorMinuto === null) {
                    alert('Error al obtener la tarifa');
                    return;
                }

                // Calcular el tiempo de estacionamiento
                const fechaEntrada = new Date(data['fechaent'] + 'T' + data['horaent']);
                const fechaSalida = date;

                const minutosPorDia = calcularMinutosPorDia(fechaEntrada, fechaSalida);
                const minutosTotales = minutosPorDia.reduce((total, minutos) => total + minutos, 0);

                // Calcular el valor total
                const valorTot = valorMinuto * minutosTotales;

                // Mostrar los detalles del pago
                const [elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, empPat] =
                    ['h1', 'h3', 'h3', 'h3', 'h3', 'h3', 'h4'].map(tag => document.createElement(tag));

                elemPat.textContent = `Patente: ${data['patente']}`;
                empPat.textContent = `Empresa: ${data['empresa']}`;
                fechaPat.textContent = `Fecha: ${data['fechaent']}`;
                horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
                horasalPat.textContent = 'Hora salida: ' + date.toLocaleTimeString();
                tiempPat.textContent = `Tiempo de Parking: ${minutosTotales} min.`;
                valPat.textContent = `Valor: $${valorTot.toFixed(2)}`;

                cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

                // Actualizar el movimiento en la base de datos
                const datos = {
                    id: data['idmov'],
                    fecha: date.toISOString().split('T')[0],
                    hora: date.toLocaleTimeString(),
                    valor: valorTot,
                };

                await updateMov(datos);
                refreshMov();
                refreshPagos();
                alert('Pago registrado!');
                document.getElementById('parkingQRPat').value = '';
            } else {
                alert('Esta patente ya fue cobrada');
            }
        } else {
            buses();
            document.getElementById('andenQRPat').value = input;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}