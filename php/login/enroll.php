<?php
//Documento para enrolar nuevos usuarios en la tabla userParking

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type'); // Permitir el encabezado Content-Type
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

include("../conf.php"); // Incluir archivo de configuración de base de datos

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
