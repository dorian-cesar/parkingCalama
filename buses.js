const form = document.getElementById('formLoza');
axios.get(apiDestinos)
.then(reply => {
    reply.data.forEach(item => {
        var optIn = document.createElement('option');
        optIn.value = item.valor;
        optIn.textContent = item.ciudad;
        form.destino.appendChild(optIn);
    });
})
.catch(error => {
    console.log(error);
});