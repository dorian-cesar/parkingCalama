<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos
declare(strict_types=1);

// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Verifica si la solicitud es OPTIONS (solicitud de pre-vuelo)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS, se establecen los encabezados permitidos
    header('Access-Control-Allow-Headers: Content-Type, Authorize');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Usa la clase JWT de Firebase para manejar tokens JWT
use Firebase\JWT\JWT;

// Incluye el archivo autoload.php que contiene las clases necesarias
require_once('../../vendor/autoload.php');

// Incluye el archivo de configuración de la base de datos
include("../conf.php");

// Verifica si la solicitud es POST
if($_SERVER["REQUEST_METHOD"] == "POST"){
    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Si hay datos JSON
    if($json_data){
        // Decodifica los datos JSON
        $data = json_decode($json_data, true);

        // Si la decodificación es exitosa
        if($data!==null){
            // Si hay un ID en los datos, buscar solo ese registro
            $id = $data['id'];

            // Prepara y ejecuta una consulta SQL para obtener el registro por ID
            $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking WHERE iddest = ?");
            $stmt->bind_param("i",$id);

            try{
                $stmt->execute();
                $result = $stmt->get_result();
                $datos = $result->fetch_assoc();

                // Devuelve el resultado en formato JSON
                header("Content-Type: application/json");
                echo json_encode($datos);
            } catch(mysqli_sql_exception $e){
                // En caso de error, devuelve el código de error en formato JSON
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
            }
        } else {
            // Si los datos JSON son nulos, devuelve un código de respuesta HTTP 400 (Bad Request)
            http_response_code(400);
            echo 'NullData';
        }
    }
    // Si no hay datos JSON, devolver todos los registros
    else {
        // Prepara y ejecuta una consulta SQL para obtener todos los registros
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking");
        
        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = array();

            // Recorre los resultados y los agrega al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            // Devuelve todos los resultados en formato JSON
            header("Content-Type: application/json");
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            // En caso de error, devuelve el código de error en formato JSON
            header('Content-Type: application/json');
            echo json_encode(mysqli_errno($conn));
        }
    }
} else {
    // Si la solicitud no es POST, devolver un código de respuesta HTTP 405 (Method Not Allowed)
    http_response_code(405);
    echo 'InvalidRequest';
}

// Cierra la conexión a la base de datos
$conn->close();
?>
