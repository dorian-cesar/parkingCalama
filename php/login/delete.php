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
        $id = $data["id"];

        $chck = $conn->prepare("SELECT iduser FROM userParking WHERE iduser = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        if($result->num_rows >= 1){
            // SQL Seguro
            $stmt = $conn->prepare("DELETE FROM userParking WHERE iduser = ?");
            $stmt->bind_param("i", $id);
    
            if($stmt->execute()){
                header('Content-Type: application/json');
                echo json_encode(true);
            } else {
                header('Content-Type: application/json');
                echo json_encode(false);
            }
        } else {
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