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
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];

        // Prepara y ejecuta una consulta SQL para verificar si ya existe una ciudad en la tabla
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE ciudad = ?");
        $chck->bind_param("s",$ciudad);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si no existe ya una ciudad con el mismo nombre en la tabla
        if($result->num_rows == 0){
            // Si no existe, prepara y ejecuta una consulta SQL para insertar una nueva ciudad y su valor en la tabla
            $stmt = $conn->prepare("INSERT INTO destParking (ciudad, valor) VALUES (?, ?)");
            $stmt->bind_param("si", $ciudad, $valor);
    
            // Ejecuta la consulta SQL para insertar los datos
            if($stmt->execute()){
                // Si la inserción es exitosa, devuelve el ID del nuevo registro en formato JSON
                $id = $conn->insert_id;
                header('Content-Type: application/json');
                echo json_encode($id);
            } else {
                // Si hay un error en la inserción, devuelve un mensaje de error en formato JSON
                header('Content-Type: application/json');
                echo json_encode("Error: " . $conn->error);
            }
        } else {
            // Si ya existe una ciudad con el mismo nombre, devuelve false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        // Cierra la conexión a la base de datos
        $conn->close();
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
?>
