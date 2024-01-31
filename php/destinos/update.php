<?php
declare(strict_types=1);
// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST y OPTIONS
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

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

if($token->nivel < $LVLADMIN){
    header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
    echo json_encode(['error' => 'Autoridad insuficiente']);
    exit;
}

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
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];

        // Prepara y ejecuta una consulta SQL para verificar si existe un registro con el ID dado
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si existe al menos un registro con el ID dado
        if($result->num_rows >= 1){
            // Si existe, prepara y ejecuta una consulta SQL para actualizar el registro
            $stmt = $conn->prepare("UPDATE destParking SET ciudad = ?, valor = ? WHERE iddest = ?");
            $stmt->bind_param("sii", $ciudad, $valor, $id);
    
            // Ejecuta la consulta SQL de actualización
            try{
                if($stmt->execute()){
                    // Si la actualización es exitosa, devuelve true en formato JSON
                    header('Content-Type: application/json');
                    echo json_encode(true);
                } else {
                    // Si hay un error en la actualización, devuelve false en formato JSON
                    header('Content-Type: application/json');
                    echo json_encode(false);
                }
            } catch (mysqli_sql_exception $e){
                // Si hay una excepción en la consulta, devuelve el código de error en formato JSON
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
                $conn->close();
                return;
            }
        } else {
            // Si no existe un registro con el ID dado, devuelve false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }
    } else {
        // Si hay un error al decodificar JSON, devuelve un código de respuesta HTTP 400 (Bad Request) y un mensaje de error
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    // Si la solicitud no es POST, devuelve un código de respuesta HTTP 405 (Method Not Allowed)
    http_response_code(405);
    echo "Solicitud no permitida";
}

// Cierra la conexión a la base de datos
$conn->close();
?>
