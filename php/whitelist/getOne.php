<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use Firebase\JWT\JWT;

require_once('../../vendor/autoload.php');

include("../conf.php");

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];

        $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?");
        $stmt->bind_param("i",$id);
        $stmt->execute();
        $result = $stmt->get_result();

        if($result->num_rows > 0){
            $datos = $result->fetch_assoc();

            header("Content-Type: application/json");
            echo json_encode($datos);
        } else {
            header("Content-Type: application/json");
            echo json_encode("No existen registros de empresa");
        }
    } else {
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}

$conn->close();
?>