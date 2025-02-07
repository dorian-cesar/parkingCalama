<?php
//valida credenciales y generacion de token y lo guarda 
header("Access-Control-Allow-Origin: http://localhost "); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS
header("Access-Control-Allow-Credentials: true");
use Firebase\JWT\JWT; // Importar la clase JWT desde la biblioteca Firebase


if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header("Access-Control-Allow-Credentials: true");
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

try {
    require_once('../../vendor/autoload.php'); // Incluir la biblioteca autoload de Composer
    
    include("../conf.php"); // Incluir archivo de configuración de base de datos
    
    $validCred = false; // Inicializar variable para indicar si las credenciales son válidas
    $retrn = []; // Inicializar array para almacenar resultados
    
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST
    
        $data = json_decode($json_data, true); // Decodificar los datos JSON
    
        if($data !== null){
            $mail = $data["mail"]; // Obtener el correo electrónico del usuario
            $pass = $data["pass"]; // Obtener la contraseña del usuario
    
            // Preparar y ejecutar la consulta SQL para obtener el usuario por su correo electrónico
            $stmt = $conn->prepare("SELECT u.iduser, u.mail, u.pass, p.nivel FROM userParking AS u JOIN permParking AS p on u.nivel = p.idperm WHERE u.mail LIKE ?");
            $stmt->bind_param("s", $mail);
    
            if($stmt->execute()){
                $result = $stmt->get_result(); // Obtener el resultado de la consulta
    
                if($result->num_rows > 0){
                    $retrn = $result->fetch_Assoc(); // Obtener los datos del usuario como un array asociativo
    
                    // Verificar si la contraseña proporcionada coincide con la almacenada en la base de datos
                    if(password_verify($pass,$retrn['pass'])){
                        $validCred = true; // Las credenciales son válidas si la contraseña coincide
                    } else {
                        $validCred = false; // Las credenciales no son válidas si la contraseña no coincide
                    }
                }
            }
        }
    }
    
    if($validCred == true){
        // Generar token JWT si las credenciales son válidas
        $tokenId    = base64_encode(random_bytes(16)); // ID único del token
        $issuedAt   = new DateTimeImmutable(); // Fecha y hora de emisión del token
        $expire     = $issuedAt->modify('+1 day')->getTimestamp(); // Fecha y hora de expiración del token (1 día)
        $serverName = "wit.la"; // Nombre del servidor
        $logon      = TRUE; // Indicador de inicio de sesión válido
        $user       = $retrn['mail']; // Correo electrónico del usuario
        $nivel      = $retrn['nivel']; // Nivel de acceso del usuario
    
        // Datos a codificar en el token JWT
        $data = [
            'iat'  => $issuedAt->getTimestamp(),
            'jti'  => $tokenId,
            'iss'  => $serverName,
            'nbf'  => $issuedAt->getTimestamp(),
            'exp'  => $expire,
            'logon' => $logon,
            'user' => $user,
            'nivel' => $nivel,
        ];
    
        header("Content-Type: text/plain"); // Establecer el tipo de contenido de la respuesta como texto plano
        echo JWT::encode($data,$secretkey,'HS256'); // Codificar los datos en un token JWT y devolverlo como respuesta
    } else {
        echo "Error"; // Devolver mensaje de error si las credenciales no son válidas
    }
} catch(Exception $e) {
    echo $e->getMessage();
}
?>