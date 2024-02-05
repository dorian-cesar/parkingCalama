// Retorna datos si la sesion es valida
// [0]lvl : nivel de usuario
async function validate(){
    if(getCookie('jwt')){
        let ret = await fetch('http://localhost/parkingCalama/php/login/validate.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${getCookie('jwt')}`
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