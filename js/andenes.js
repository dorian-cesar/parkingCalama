async function calcAndenes() {
    const input = document.getElementById('andenQRPat').value;
    const cont = document.getElementById('contAnden');
    const dest = document.getElementById('destinoBuses');
    //const empr = document.getElementById('empresaBuses');

    if (!(dest.value > 0)) {
        alert('Seleccione Empresa y Destino');
        return;
    }

    if(!patRegEx.test(input)){
        console.log('No es patente, leer QR');
        return; //To-Do leer QR o Codigo de Barra
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

function listarAndenesEmpresas(){
    andGetEmpresas()
    .then(data => {
        if(data){
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

function listarAndenesDestinos(){
    andGetDestinos()
    .then(data => {
        if(data){
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

async function andGetEmpresas(){
    if(getCookie('jwt')){
        // Función para obtener todas las empresas
        let ret = await fetch("http://localhost/parkingCalama/php/empresas/get.php", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${getCookie('jwt')}`
                }
            })
            .then(reply => reply.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
        return ret;
    }
}

async function andGetDestinos(){
    if(getCookie('jwt')){
        let ret = await fetch(apiDestinos, {
                method: 'GET',
                mode: 'cors',
                headers: {
                  'Authorization': `Bearer ${getCookie('jwt')}`
                }
            })
            .then(reply => reply.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
        return ret;
    }
}

function impAnden(){
    const ventanaImpr = window.open('', '_blank');

    const contBoleta = document.getElementById('contAnden');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:left; width: 640px;">');
    ventanaImpr.document.write(contBoleta.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();
    ventanaImpr.print();
}