function calcParking(){
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');

    if(!/^[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}$/.test(input)){
        console.log('No es patente, leer QR');
        return; //To-Do leer QR o Codigo de Barra
    } else {
        // To-Do: Limpiar guiones correctamente
        input = input.replace('-','');
        input = input.replace('-','');
        getByPatente(input)
        .then(data => {
            if(data){
                if(data['tipo']=='Parking'){
                    if(data['valor']==0){
                        cont.textContent = '';
                        var date = new Date();
                        
                        var fechaent = new Date(data['fechaent']+'T'+data['horaent']);
                        var differencia = (date.getTime() - fechaent.getTime()) / 1000;
                        var minutos = Math.floor(differencia / 60);
        
                        var elemPat = document.createElement('h1');
                        var fechaPat = document.createElement('h3');
                        var horaentPat = document.createElement('h3');
                        var horasalPat = document.createElement('h3');
                        var tiempPat = document.createElement('h3');
                        var valPat = document.createElement('h3');
        
                        elemPat.textContent = `Patente: ${data['patente']}`;
                        fechaPat.textContent = `Fecha: ${data['fechaent']}`;
                        horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
                        horasalPat.textContent = 'Hora salida: '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() ;
                        tiempPat.textContent = `Tiempo de Parking: ${minutos} min.`;
                        // To-Do: Traer valor x minuto desde la BDD
                        valPat.textContent = `Valor: $${20*minutos}`;
        
                        cont.appendChild(elemPat);
                        cont.appendChild(fechaPat);
                        cont.appendChild(horaentPat);
                        cont.appendChild(horasalPat);
                        cont.appendChild(tiempPat);
                        cont.appendChild(valPat);
                    } else {
                        alert('Esta patente ya fue cobrada');
                    }
                } else {
                    alert('Esta patente figura en Andenes');
                }
            } else {
                alert('Patente no encontrada');
            }
        });
    }
}

async function getByPatente(patente){
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