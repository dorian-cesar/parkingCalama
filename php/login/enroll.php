<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos


// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Verifica si la solicitud es OPTIONS (solicitud de pre-vuelo)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS, se establecen los encabezados permitidos
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Incluye el archivo de configuración de la base de datos
include(dirname(__DIR__)."/conf.php"); 

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST

    $data = json_decode($json_data, true); // Decodificar los datos JSON

    if ($data !== null){
        // Obtener datos desde JSON y hashear la contraseña
        $mail = $data["mail"];
        $lvl = $data["lvl"];
        $pass = password_hash($data["pass"], PASSWORD_DEFAULT); // Hashear la contraseña

        // Preparar y ejecutar la consulta SQL para insertar un nuevo usuario
        $stmt = $conn->prepare("INSERT INTO userParking (mail, pass, nivel) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $mail,$pass, $lvl);

        try{
            $stmt->execute(); // Ejecutar la consulta SQL
            $id = $conn->insert_id; // Obtener el ID del nuevo registro
            header('Content-Type: application/json');
            echo json_encode($id); // Devolver el ID como JSON
        } catch(mysqli_sql_exception $e) {
            header('Content-Type: application/json');
            echo json_encode($conn->error); // Devolver el error como JSON en caso de falla en la ejecución de la consulta
        }

    } else {
        http_response_code(400); // Devolver código de error 400 (Bad Request)
        echo $data;
        echo "Error al decodificar JSON"; // Mensaje de error si los datos JSON son nulos o inválidos
    }
} else {
    http_response_code(405); // Devolver código de error 405 (Method Not Allowed)
    echo "Solicitud no permitida"; // Mensaje de error para solicitudes no permitidas
}
$conn->close(); // Cerrar la conexión a la base de datos
?>
