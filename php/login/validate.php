<?php
//Valida Token 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Permitir los encabezados Content-Type y Authorization
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

try {
    require_once('../../vendor/autoload.php'); // Cargar la biblioteca JWT
    require_once('../conf.php'); // Incluir el archivo de configuración de la base de datos
    
        
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
