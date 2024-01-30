<?php
//Update de tabla userparking (bd) 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type'); // Permitir el encabezado Content-Type
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

include("../conf.php"); // Incluir archivo de configuración de la base de datos

$accountExists = false; // Inicializar variable para verificar si la cuenta existe

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST

    $data = json_decode($json_data, true); // Decodificar los datos JSON

    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"]; // ID del usuario
        $mail = $data["mail"]; // Correo electrónico
        $lvl = $data["lvl"]; // Nivel
        $passOld = $data['passOld']; // Contraseña antigua
        $passHash = password_hash($data["pass"], PASSWORD_DEFAULT); // Hash de la nueva contraseña

        // Preparar y ejecutar la consulta SQL para verificar la existencia de la cuenta
        $stmt = $conn->prepare("SELECT iduser, mail, pass, nivel FROM userParking WHERE mail LIKE ?");
        $stmt->bind_param("s", $mail);

        if($stmt->execute()){
            $result = $stmt->get_result(); // Obtener el resultado de la consulta

            if($result->num_rows > 0){
                $retrn = $result->fetch_Assoc(); // Obtener los datos del usuario como un array asociativo

                // Verificar si la contraseña antigua proporcionada coincide con la almacenada en la base de datos
                if(password_verify($passOld,$retrn['pass'])){
                    $accountExists = true; // La cuenta existe si la contraseña coincide
                } else {
                    $accountExists = false; // La cuenta no existe si la contraseña no coincide
                }
            }
        }

        if($accountExists == true){
            // Actualizar los datos de la cuenta si la cuenta existe
            $stmt = $conn->prepare("UPDATE userParking SET mail = ?, pass = ?, nivel = ? WHERE iduser = ?");
            $stmt->bind_param("ssii", $mail,$passHash, $lvl, $id);
    
            try{
                if($stmt->execute()){
                    $stmt->execute();
                    $id = $conn->insert_id; // Obtener el ID de inserción
                    header('Content-Type: application/json');
                    echo json_encode(true); // Devolver true si la actualización fue exitosa
                } else {
                    header('Content-Type: application/json');
                    echo json_encode(false); // Devolver false si la actualización falló
                }
            } catch(mysqli_sql_exception $e) {
                header('Content-Type: application/json');
                echo json_encode($conn->error); // Devolver el error si ocurrió una excepción SQL
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(false); // Devolver false si la cuenta no existe
        }

    } else {
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON"; // Devolver mensaje de error si ocurrió un problema al decodificar JSON
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida"; // Devolver mensaje de error si la solicitud no es de tipo POST
}
$conn->close(); // Cerrar la conexión a la base de datos
?>
