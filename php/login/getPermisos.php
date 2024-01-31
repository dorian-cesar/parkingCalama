<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos
declare(strict_types=1);

// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Verifica si la solicitud es OPTIONS (solicitud de pre-vuelo)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS, se establecen los encabezados permitidos
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Incluye el archivo de configuración de la base de datos
include("../conf.php");

include('../auth.php');

if($token->nivel < $LVLUSER){
    header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
    echo json_encode(['error' => 'Autoridad insuficiente']);
    exit;
}

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
