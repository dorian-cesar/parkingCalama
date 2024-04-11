<?php
//valida credenciales y generacion de token y lo guarda 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS


if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

try {
    header("Content-Type: application/json");
    include("../conf.php"); // Incluir archivo de configuración de base de datos
    
    $validCred = false; // Inicializar variable para indicar si las credenciales son válidas
    $retrn = []; // Inicializar array para almacenar resultados
    $level = 0;
    $level = 'none';
    
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $json_data = file_get_contents("php://input"); // Obtener datos JSON de la solicitud POST
    
        $data = json_decode($json_data, true); // Decodificar los datos JSON
    
        if($data !== null){
            $mail = $data["mail"]; // Obtener el correo electrónico del usuario
            $pass = $data["pass"]; // Obtener la contraseña del usuario
    
            // Preparar y ejecutar la consulta SQL para obtener el usuario por su correo electrónico
            $stmt = $conn->prepare("SELECT u.iduser, u.mail, u.pass, p.nivel FROM userParking AS u JOIN permParking AS p on u.nivel = p.idperm WHERE u.mail LIKE ?");
            $stmt->bind_param("s", $mail);
    
            if($stmt->execute()){
                $result = $stmt->get_result(); // Obtener el resultado de la consulta
    
                if($result->num_rows > 0){
                    $retrn = $result->fetch_Assoc(); // Obtener los datos del usuario como un array asociativo
    
                    // Verificar si la contraseña proporcionada coincide con la almacenada en la base de datos
                    if(password_verify($pass,$retrn['pass'])){
                        $validCred = true; // Las credenciales son válidas si la contraseña coincide
                        $level = $retrn['nivel'];
                        $user = $retrn['mail'];
                    } else {
                        $validCred = false; // Las credenciales no son válidas si la contraseña no coincide
                    }
                }
            }
        }
    }
    echo json_encode([
        'login' => $validCred,
        'level' => $level,
        'user' => $user,
    ]);
    exit;
} catch(Exception $e) {
    echo json_encode($e->getMessage());
    exit;
}
?>