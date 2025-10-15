<?php
// Usa la clase JWT de Firebase para manejar tokens JWT
use Firebase\JWT\JWT;

// Headers para CORS
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cookie");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit;
}

$headers = apache_request_headers(); // Obtener los encabezados de la solicitud

$LVLADMIN = 10;
$LVLAUDIT = 5;
$LVLUSER = 1;
$serverName = "localhost"; // Nombre del servidor

// Incluye el archivo autoload.php que contiene las clases necesarias
require_once('../../vendor/autoload.php');
include("../conf.php"); // Incluir archivo de configuración con $secretkey

try {
    $jwt = null;

    // Intentar obtener el token del header Authorization
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            $jwt = $matches[1];
        }
    }
    
    // Si no está en Authorization, buscar en Cookie
    if (!$jwt && isset($headers['Cookie'])) {
        if (preg_match('/jwt=([^;]+)/', $headers['Cookie'], $matches)) {
            $jwt = $matches[1];
        }
    }

    // Depuración - comentar en producción
    // error_log("Headers recibidos: " . print_r($headers, true));
    // error_log("JWT extraído: " . $jwt);

    if (!$jwt) {
        header('HTTP/1.0 400 Bad Request');
        echo json_encode(['error' => 'No se envió un token', 'headers' => $headers]);
        exit;
    }

    // Decodificar el token JWT utilizando la clave secreta
    $token = JWT::decode($jwt, $secretkey, array('HS256'));
    $now = new DateTimeImmutable();
   

    // Verificar la validez del token JWT
    if ($token->iss !== $serverName ||
        $token->nbf > $now->getTimestamp() ||
        $token->exp < $now->getTimestamp())
    {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit;
    }

    // Token válido - puedes devolver la información del usuario si es necesario
    $userData = [
        'user' => $token->user,
        'nivel' => $token->nivel,
        'logon' => $token->logon
    ];
    
    // Para uso interno en otros scripts, puedes asignar a variables globales
    $GLOBALS['user_level'] = $token->nivel;
    $GLOBALS['user_email'] = $token->user;
    
    // Si este archivo se incluye, no devolver nada JSON
    // Si se accede directamente, devolver éxito
    if (basename($_SERVER['PHP_SELF']) == 'auth.php') {
        echo json_encode(['success' => true, 'user' => $userData]);
    }

} catch (Exception $e) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Token inválido: ' . $e->getMessage()]);
    exit;
}
?>