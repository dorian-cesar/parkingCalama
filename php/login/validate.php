<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use Firebase\JWT\JWT;

require_once('../../vendor/autoload.php');

require_once('../conf.php');

$headers = apache_request_headers();

if (! preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
    header('HTTP/1.0 400 Bad Request');
    echo 'Token not found in request';
    exit;
}

$jwt = $matches[1];

if (! $jwt) {
    header('HTTP/1.0 400 Bad Request');
    exit;
}

$token = JWT::decode($jwt, $secretkey, ['HS512']);
$now = new DateTimeImmutable();
$serverName = "wit.la";

if ($token->iss !== $serverName ||
    $token->nbf > $now->getTimestamp() ||
    $token->exp < $now->getTimestamp())
{
    header('HTTP/1.1 401 Unauthorized');
    exit;
}

$data = ["logon" = true,
         "user" = $token->user,
         "pass" = $token->nivel];

header("Content-Type: text/plain");
echo json_encode($data);