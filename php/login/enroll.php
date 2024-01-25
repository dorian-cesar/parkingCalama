<?php
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

include("../conf.php");

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $mail = $data["mail"];
        $lvl = $data["lvl"];
        $pass = password_hash($data["pass"], PASSWORD_DEFAULT);

        // SQL Seguro
        $stmt = $conn->prepare("INSERT INTO userParking (mail, pass, nivel) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $mail,$pass, $lvl);

        try{
            $stmt->execute();
            $id = $conn->insert_id;
            header('Content-Type: application/json');
            echo json_encode($id);
        } catch(mysqli_sql_exception $e) {
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        $conn->close();
    } else {
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}
?>