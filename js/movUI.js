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
        { data: 'tipo' },
        { data: 'acciones' },
        { data: 'estado'}
    ],
    createdRow: function (row, data, dataIndex) {
        // Aplicar clases condicionales a las filas
        if (data.DT_RowClass) {
            $(row).addClass(data.DT_RowClass);
        }
    }
});

// Función para obtener los datos de la patente desde la API
async function getMovByPatente(patente) {
    if (getCookie('jwt')) {
        let ret = await fetch(apiMovimientos + '?' + new URLSearchParams({
            patente: patente
        }), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${getCookie('jwt')}`
            }
        })
            .then(reply => reply.json())
            .then(data => { return data })
            .catch(error => { console.log(error) });
        return ret;
    }
}

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
                // Calcular la diferencia de tiempo para los vehículos que no han salido
                const fechaEntrada = new Date(item['fechaent'] + 'T' + item['horaent']);
                const fechaActual = new Date();
                const diferenciaTiempo = fechaActual - fechaEntrada;
                const diferenciaDias = diferenciaTiempo / (1000 * 60 * 60 * 24);

                // Determinar el estado y el color de la fila
                let estado = '';
                let rowClass = '';
                if (item['fechasal'] !== "0000-00-00") {
                    estado = 'Pagado'; // Estado: Pagado
                    rowClass = 'pagado'; // Verde si ya pagó
                } else if (diferenciaDias > 1) {
                    estado = 'Sin Pagar'; // Estado: Sin Pagar
                    rowClass = 'sin-pagar'; // Rojo si lleva más de un día sin pagar
                } else {
                    estado = 'En Estacionamiento'; // Estado: En Estacionamiento
                }

                tableMov.rows.add([{
                    'idmov': item['idmov'],
                    'fechaent': item['fechaent'],
                    'fechasal': item['fechasal'],
                    'patente': item['patente'],
                    'empresa': item['empresa'],
                    'tipo': item['tipo'],
                    'acciones': `<button onclick="modalEditSalida(${item['idmov']})">Actualizar Salida</button>`,
                    'estado': estado, // Agregar el estado
                    'DT_RowClass': rowClass // Agregar clase a la fila
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

// Actualizar hora de salida
async function modalEditSalida(id) {
    // Solicitar la fecha de salida
    const fechaSalida = prompt('Ingrese la fecha de salida (YYYY-MM-DD):');
    if (!fechaSalida || !/^\d{4}-\d{2}-\d{2}$/.test(fechaSalida)) {
        alert('Formato de fecha inválido. Use YYYY-MM-DD.');
        return;
    }

    // Solicitar la hora de salida
    const horaSalida = prompt('Ingrese la hora de salida (HH:MM:SS):');
    if (!horaSalida || !/^\d{2}:\d{2}:\d{2}$/.test(horaSalida)) {
        alert('Formato de hora inválido. Use HH:MM:SS.');
        return;
    }

    // Combinar fecha y hora
    const fechaHoraSalida = `${fechaSalida} ${horaSalida}`;

    try {
        // Actualizar el movimiento en la base de datos
        await updateMov({ id, fecha: fechaSalida, hora: horaSalida });
        alert('Fecha y hora de salida actualizadas correctamente.');
        refreshMov(); // Refrescar la tabla de movimientos
    } catch (error) {
        console.error('Error al actualizar la fecha y hora de salida:', error);
        alert('No se pudo actualizar la fecha y hora de salida.');
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

// Obtener la tarifa por tipo de movimiento
async function getTarifaPorTipo(tipo) {
    try {
        const response = await fetch(`http://localhost/parkingCalama/php/tarifas/api.php?tipo=${tipo}`, {
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
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date(fechaActual);
        finDia.setHours(23, 59, 59, 999);

        const minutosDia = Math.min(
            (Math.min(fechaFin, finDia) - Math.max(fechaInicio, inicioDia)) / 60000,
            480
        );

        minutosPorDia.push(Math.round(minutosDia));
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return minutosPorDia;
}

// Función principal para calcular el pago
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

        if (data['tipo'] === 'Parking' || data['tipo'] === 'Anden') {
            if (data['fechasal'] === "0000-00-00") {
                cont.textContent = '';
                const date = new Date();

                const valorMinuto = await getTarifaPorTipo(data['tipo']);
                if (valorMinuto === null) {
                    alert('Error al obtener la tarifa');
                    return;
                }

                const fechaEntrada = new Date(data['fechaent'] + 'T' + data['horaent']);
                const fechaSalida = date;

                const minutosPorDia = calcularMinutosPorDia(fechaEntrada, fechaSalida);
                const minutosTotales = minutosPorDia.reduce((total, minutos) => total + minutos, 0);

                const valorTot = valorMinuto * minutosTotales;

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