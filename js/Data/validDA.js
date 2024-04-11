// Retorna datos si la sesion es valida
// [0]lvl : nivel de usuario
async function validate(){
    if(usrlvl>0){
        let ret = await fetch('https://masgps-bi.wit.la/parkingCalama/php/login/validate.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${usrlvl}`
            }
          })
          .then(response => response.json())
          .then(data => {
            return data;
          })
          .catch(error => console.log(error));
        return ret;
    } else {return false;}
}