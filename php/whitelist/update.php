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

if($token->nivel < $LVLADMIN){
    header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
    echo json_encode(['error' => 'Autoridad insuficiente']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Leer datos JSON del cuerpo de la solicitud POST
    $json_data = file_get_contents("php://input");

    // Decodificar los datos JSON en un array asociativo
    $data = json_decode($json_data, true);

    // Verificar si se decodificó correctamente el JSON
    if ($data !== null) {
        // Obtener datos desde JSON
        $id = $data["id"];
        $patente = $data["patente"];
        $empresa = $data["empresa"];

        // Validar que la entrada existe
        $chck = $conn->prepare("SELECT idwl FROM wlParking WHERE idwl = ?");
        $chck->bind_param("i", $id);
        $chck->execute();
        $result = $chck->get_result();

        // Si la entrada existe, actualizar los datos
        if ($result->num_rows >= 1) {
            // Consulta SQL segura para actualizar la entrada
            $stmt = $conn->prepare("UPDATE wlParking SET patente = ?, empresa = ? WHERE idwl = ?");
            $stmt->bind_param("sii", $patente, $empresa, $id);

            try {
                // Ejecutar la consulta de actualización
                if ($stmt->execute()) {
                    // Si la actualización fue exitosa, devolver true
                    header('Content-Type: application/json');
                    echo json_encode(true);
                } else {
                    // Si hubo un error en la actualización, devolver false
                    header('Content-Type: application/json');
                    echo json_encode(false);
                }
            } catch (mysqli_sql_exception $e) {
                // Capturar excepciones de MySQLi y devolver el código de error
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
                // Cerrar la conexión a la base de datos y terminar la ejecución
                $conn->close();
                return;
            }
        } else {
            // Si la entrada no existe, devolver false
            header('Content-Type: application/json');
            echo json_encode(false);
        }
    } else {
        // Devolver un código de respuesta HTTP 400 si hubo un error al decodificar el JSON
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    // Devolver un código de respuesta HTTP 405 si la solicitud no es POST
    http_response_code(405);
    echo "Solicitud no permitida";
}

// Cerrar la conexión a la base de datos
$conn->close();
?>
