<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    header("HTTP/1.1 200 OK");
    exit;
}

include("../conf.php");
include('../auth.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    include('get_movimientos.php');
} elseif ($method == 'POST') {
    include('insert_movimiento.php');
} elseif ($method == 'PUT') {
    include('update_movimientos.php');
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Método no permitido']);
}
