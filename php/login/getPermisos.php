<?php
//Documento para identificar y discriminar nivel de usuario para gestion de acceso


declare(strict_types=1); // Declaración de tipos estrictos para mejorar la seguridad

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST"); // Permitir solicitudes POST

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorize'); // Permitir los encabezados Content-Type y Authorize
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK"); // Respuesta exitosa
    exit;
}

use Firebase\JWT\JWT; // Importar la clase JWT desde la biblioteca Firebase

require_once('../../vendor/autoload.php'); // Incluir la biblioteca autoload de Composer

include("../conf.php"); // Incluir archivo de configuración de base de datos

// Obtener registros de permisos
// id: ID a obtener (opcional)

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST

    // Si existe json_data, asumir que se buscará por ID
    if($json_data){
        $data = json_decode($json_data, true); // Decodificar los datos JSON

        if($data!==null){
            $id = $data['id'];

            // Preparar y ejecutar la consulta SQL para obtener el permiso por su ID
            $stmt = $conn->prepare("SELECT idperm, nivel, descriptor FROM permParking WHERE idperm = ?");
            $stmt->bind_param("i",$id);

            try{
                $stmt->execute(); // Ejecutar la consulta SQL
                $result = $stmt->get_result(); // Obtener el resultado de la consulta
                $datos = $result->fetch_assoc(); // Obtener los datos del permiso como un array asociativo

                header("Content-Type: application/json"); // Establecer el tipo de contenido de la respuesta como JSON
                echo json_encode($datos); // Devolver los datos del permiso como JSON
            } catch(mysqli_sql_exception $e){
                header('Content-Type: application/json'); // Establecer el tipo de contenido de la respuesta como JSON
                echo json_encode(mysqli_errno($conn)); // Devolver el número de error de MySQL como JSON en caso de error
            }
        } else {
            http_response_code(400); // Devolver código de error 400 (Bad Request)
            echo 'NullData'; // Mensaje de error si los datos JSON son nulos o inválidos
        }
    }
    // De lo contrario, devolver todos los permisos
    else {
        // Preparar y ejecutar la consulta SQL para obtener todos los permisos
        $stmt = $conn->prepare("SELECT idperm, nivel, descriptor FROM permParking");
        
        try{
            $stmt->execute(); // Ejecutar la consulta SQL
            $result = $stmt->get_result(); // Obtener el resultado de la consulta
            $datos = array();

            // Recorrer los resultados y agregarlos al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            header("Content-Type: application/json"); // Establecer el tipo de contenido de la respuesta como JSON
            echo json_encode($datos); // Devolver los datos de todos los permisos como JSON
        } catch(mysqli_sql_exception $e){
            header('Content-Type: application/json'); // Establecer el tipo de contenido de la respuesta como JSON
            echo json_encode(mysqli_errno($conn)); // Devolver el número de error de MySQL como JSON en caso de error
        }
    }
} else {
    http_response_code(405); // Devolver código de error 405 (Method Not Allowed)
    echo 'InvalidRequest'; // Mensaje de error para solicitudes no permitidas
}

$conn->close(); // Cerrar la conexión a la base de datos
?>
