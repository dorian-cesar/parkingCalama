<?php
//Muestra registros de la BD en la tabla empresas (dento del modulo de configuracion )

declare(strict_types=1);

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST"); // Permitir solo solicitudes POST

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorize');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use Firebase\JWT\JWT; // Importar la clase JWT de Firebase

require_once('../../vendor/autoload.php'); // Incluir el autoloader de Composer

include("../conf.php"); // Incluir el archivo de configuración de la base de datos

// Obtener registros de listas blancas
// id: ID a obtener (opcional)

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST

    // Si existe json_data asumir que buscaremos por ID
    if($json_data){
        $data = json_decode($json_data, true); // Decodificar los datos JSON

        if($data!==null){
            $id = $data['id']; // Obtener el ID de la solicitud

            // Preparar y ejecutar la consulta SQL para obtener los datos por ID
            $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking WHERE idemp = ?");
            $stmt->bind_param("i",$id);

            try{
                $stmt->execute();
                $result = $stmt->get_result();
                $datos = $result->fetch_assoc(); // Obtener los datos como un array asociativo

                header("Content-Type: application/json");
                echo json_encode($datos); // Devolver los datos como JSON
            } catch(mysqli_sql_exception $e){
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn)); // Devolver el código de error SQL
            }
        } else {
            http_response_code(400);
            echo 'NullData'; // Mensaje de error si los datos JSON son nulos
        }
    }
    // De lo contrario, devolver todos los registros
    else {
        $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking");
        
        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = array();

            // Recorrer los resultados y agregarlos al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            header("Content-Type: application/json");
            echo json_encode($datos); // Devolver los datos como JSON
        } catch(mysqli_sql_exception $e){
            header('Content-Type: application/json');
            echo json_encode(mysqli_errno($conn)); // Devolver el código de error SQL
        }
    }
} else {
    http_response_code(405);
    echo 'InvalidRequest'; // Mensaje de error para solicitudes no permitidas
}

$conn->close(); // Cerrar la conexión a la base de datos
?>