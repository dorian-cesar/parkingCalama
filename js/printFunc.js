function printParking() {
    const divContents = document.getElementById('contParking').children;

    var a = window.open('', '', 'height=500, width=500');
    a.document.body.style.fontFamily = 'Courier, monospace';

    for (var i = 0; i < divContents.length; i++) {
        a.document.body.appendChild(divContents[i].cloneNode(true));
    }

    a.document.close();
    a.print();
}

function printAnden() {
    const divContents = document.getElementById('contAnden').children;

    var a = window.open('', '', 'height=500, width=500');
    a.document.body.style.fontFamily = 'Courier, monospace';

    for (var i = 0; i < divContents.length; i++) {
        a.document.body.appendChild(divContents[i].cloneNode(true));
    }

    a.document.close();
    a.print();
}

async function calcParking(e) {
    e.preventDefault();
    const form = document.getElementById('formParking');
    const printable = document.getElementById('contParking').children;
    if(!patRegEx.test(form.qrpat.value)){
        console.log('No es patente, leer QR');
        return; //To-Do leer QR o Codigo de Barra
    }

    try {
        axios.get(apiMovimientos+'?patente='+form.qrpat.value)
        .then(reply => {
            if(reply.data){
                const parkData = reply.data;
                if(parkData.tipo==='Parking') {
                    if(parkData.fechasal==="0000-00-00"){
                        const date = new Date();
                        var fechaent = new Date(parkData.fechaent+'T'+parkData.horaent);
                        var differencia = (date.getTime() - fechaent.getTime()) / 1000;
                        var minutos = Math.ceil(differencia / 60);

                        let valorTot = 20*minutos;

                        axios.get(apiWhitelist+'?patente='+form.qrpat.value)
                        .then(reply => {
                            if(reply.data) {
                                valorTot = 0;
                            }
                        });

                        printable[0].textContent = parkData.patente;
                        printable[1].textContent = parkData.empresa;
                        printable[2].textContent = "Fecha : " + parkData.fechaent;
                        printable[3].textContent = "Hora Ingreso : " + parkData.horaent;
                        printable[4].textContent = 'Hora Salida : '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() ;
                        printable[5].textContent = "Tiempo : " + minutos + " min.";
                        printable[6].textContent = "Valor : $" + valorTot + " CLP";

                        axios.put(apiMovimientos, {
                            id: parkData.idmov,
                            fecha: date.toISOString().split('T')[0],
                            hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                            valor: valorTot,
                        })
                        .then(reply => {
                            console.log(reply);
                        })
                        .finally(() => {
                            form.qrpat.value = '';
                        });
                    } else {
                    window.alert('Ya se ha cobrado!');
                }
                } else {
                    window.alert('Es anden!');
                }
            }
        })
    } catch(error) {
        console.error(error);
    }
}

async function calcAndenes(e) {
    e.preventDefault();
    const form = document.getElementById('formLoza');
    const printable = document.getElementById('contAnden').children;
    if(!patRegEx.test(form.qrpat.value)){
        console.log('No es patente, leer QR');
        return; //To-Do leer QR o Codigo de Barra
    }

    try {
        axios.get(apiMovimientos+'?patente='+form.qrpat.value)
        .then(reply => {
            if(reply.data){
                const parkData = reply.data;
                if(parkData.tipo==='Anden') {
                    if(parkData.fechasal==="0000-00-00"){
                        const date = new Date();
                        var fechaent = new Date(parkData.fechaent+'T'+parkData.horaent);
                        var differencia = (date.getTime() - fechaent.getTime()) / 1000;
                        var minutos = Math.ceil(differencia / 60);

                        let valorTot = 20*minutos;

                        valorTot = form.destino.value*minutos;

                        axios.get(apiWhitelist+'?patente='+form.qrpat.value)
                        .then(reply => {
                            if(reply.data) {
                                valorTot = 0;
                            }
                        });

                        printable[0].textContent = parkData.patente;
                        printable[1].textContent = form.destino.options[form.destino.selectedIndex].text;
                        printable[2].textContent = parkData.empresa;
                        printable[3].textContent = "Fecha : " + parkData.fechaent;
                        printable[4].textContent = "Hora Ingreso : " + parkData.horaent;
                        printable[5].textContent = 'Hora Salida : '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() ;
                        printable[6].textContent = "Tiempo : " + minutos + " min.";
                        printable[7].textContent = "Valor : $" + valorTot + " CLP";

                        axios.put(apiMovimientos, {
                            id: parkData.idmov,
                            fecha: date.toISOString().split('T')[0],
                            hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                            valor: valorTot,
                        })
                        .then(reply => {
                            console.log(reply);
                        })
                        .finally(() => {
                            form.qrpat.value = '';
                        });
                    } else {
                    window.alert('Ya se ha cobrado!');
                }
                } else {
                    window.alert('Es parking!');
                }
            }
        })
    } catch(error) {
        console.error(error);
    }
}