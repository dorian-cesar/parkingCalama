<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

use Firebase\JWT\JWT;

require_once('../../vendor/autoload.php');

include("../conf.php");

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $stmt = "SELECT w.idwl, w.patente, e.nombre FROM wlParking AS w JOIN empParking AS e ON w.empresa = e.idemp ORDER BY w.idwl";
    $result = $conn->query($stmt);

    if($result->num_rows > 0){
        $datos = array();

        // Recorrer los resultados y agregarlos al array
        while ($row = $result->fetch_assoc()) {
            $datos[] = $row;
        }

        header("Content-Type: application/json");
        echo json_encode($datos);
    } else {
        header("Content-Type: application/json");
        echo json_encode("No existen registros de empresa");
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}

$conn->close();
?>