<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorize');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use Firebase\JWT\JWT;

require_once('../../vendor/autoload.php');

include("../conf.php");

// Obtener registros de listas blancas
// id: ID a obtener (opcional)

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    // Si existe json_data asumir que buscaremos por ID
    if($json_data){
        $data = json_decode($json_data, true);

        if($data!==null){
            $id = $data['id'];

            $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?");
            $stmt->bind_param("i",$id);

            try{
                $stmt->execute();
                $result = $stmt->get_result();
                $datos = $result->fetch_assoc();

                header("Content-Type: application/json");
                echo json_encode($datos);
            } catch(mysqli_sql_exception $e){
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
            }
        } else {
            http_response_code(400);
            echo 'NullData';
        }
    }
    // De lo contrario, devolver todo
    else {
        $stmt = $conn->prepare("SELECT w.idwl, w.patente, e.nombre FROM wlParking AS w JOIN empParking AS e ON w.empresa = e.idemp ORDER BY w.idwl");
        
        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = array();

            // Recorrer los resultados y agregarlos al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            header("Content-Type: application/json");
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            header('Content-Type: application/json');
            echo json_encode(mysqli_errno($conn));
        }
    }
} else {
    http_response_code(405);
    echo 'InvalidRequest';
}

$conn->close();
?>