<?php

// Usa la clase JWT de Firebase para manejar tokens JWT


$headers = apache_request_headers(); // Obtener los encabezados de la solicitud

$LVLADMIN = 10;
$LVLAUDIT = 5;
$LVLUSER = 1;

if(! isset($headers['Authorization'])) {
    echo json_encode(['error' => 'No se envió un token', 'headers' => $headers]);
    exit;
}

// Incluye el archivo autoload.php que contiene las clases necesarias
require_once('../../vendor/autoload.php');

// Verificar si el encabezado Authorization contiene un token JWT
if (! preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['error' => 'No se envió un token', 'headers' => $headers]);
    exit;
}

$jwt = $matches[1]; // Obtener el token JWT

if (! $jwt) {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['error' => 'Request incorrecto']);
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
    echo json_encode(['error' => 'Token invalido']);
    exit;
}
?>