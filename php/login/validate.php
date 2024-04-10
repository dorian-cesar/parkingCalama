<?php
//Valida Token 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Permitir los encabezados Content-Type y Authorization
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use Firebase\JWT\JWT; // Importar la clase JWT desde la biblioteca Firebase

try {
    require_once('../../vendor/autoload.php'); // Cargar la biblioteca JWT
    require_once('../conf.php'); // Incluir el archivo de configuración de la base de datos
    
    $headers = apache_request_headers(); // Obtener los encabezados de la solicitud
    
    // Verificar si el encabezado Authorization contiene un token JWT
    if (! preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        header('HTTP/1.0 400 Bad Request');
        echo 'Token not found in request'; // Devolver un mensaje de error si el token no se encuentra en la solicitud
        exit;
    }
    
    $jwt = $matches[1]; // Obtener el token JWT
    
    if (! $jwt) {
        header('HTTP/1.0 400 Bad Request');
        exit;
    }
    
    $token = JWT::decode($jwt, $secretkey, array('HS256')); // Decodificar el token JWT utilizando la clave secreta

    $now = new DateTimeImmutable(); // Obtener la fecha y hora actual
    $serverName = "wit.la"; // Nombre del servidor
    
    // Verificar la validez del token JWT
    if ($token->iss !== $serverName ||
        $token->nbf > $now->getTimestamp() ||
        $token->exp < $now->getTimestamp())
    {
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        exit;
    }
    
    // Construir los datos de respuesta con la información del usuario autenticado
    $data = array(["logon" => true,
             "user" => $token->user,
             "lvl" => $token->nivel]);
    
    header("Content-Type: text/plain");
    echo json_encode($data); // Devolver los datos de respuesta en formato JSON
} catch(Exception $e) {
    echo $e->getMessage();
}
?>
