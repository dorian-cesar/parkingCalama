<?php
// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST y OPTIONS
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

// Verifica si la solicitud es OPTIONS (solicitud de pre-vuelo)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS, se establecen los encabezados permitidos
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Incluye el archivo de configuración de la base de datos
include("../conf.php");

// Verifica si la solicitud es POST
if($_SERVER["REQUEST_METHOD"] == "POST"){
    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];

        // Preparar y ejecutar consulta SQL para verificar la existencia del registro
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verificar si hay al menos una fila devuelta
        if($result->num_rows >= 1){
            // Preparar y ejecutar consulta SQL para eliminar el registro
            $stmt = $conn->prepare("DELETE FROM destParking WHERE iddest = ?");
            $stmt->bind_param("i", $id);
    
            // Ejecutar la consulta SQL para eliminar el registro
            if($stmt->execute()){
                // Si se elimina correctamente, devolver true en formato JSON
                header('Content-Type: application/json');
                echo json_encode(true);
            } else {
                // Si hay un error al eliminar, devolver false en formato JSON
                header('Content-Type: application/json');
                echo json_encode(false);
            }
        } else {
            // Si no se encuentra el registro, devolver false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        // Cerrar la conexión a la base de datos
        $conn->close();
    } else {
        // Si hay un error al decodificar JSON, devolver un código de respuesta HTTP 400 (Bad Request)
        http_response_code(400);
        echo "Error al decodificar JSON";
    }
} else {
    // Si la solicitud no es POST, devolver un código de respuesta HTTP 405 (Method Not Allowed)
    http_response_code(405);
    echo "Solicitud no permitida";
}
?>
