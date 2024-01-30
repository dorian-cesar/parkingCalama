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

$accountExists = false;

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];
        $mail = $data["mail"];
        $lvl = $data["lvl"];
        $passOld = $data['passOld'];
        $passHash = password_hash($data["pass"], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("SELECT iduser, mail, pass, nivel FROM userParking WHERE mail LIKE ?");
        $stmt->bind_param("s", $mail);

        if($stmt->execute()){
            $result = $stmt->get_result();
            if($result->num_rows > 0){
                $retrn = $result->fetch_Assoc();
                if(password_verify($passOld,$retrn['pass'])){
                    $accountExists = true;
                } else {
                    $accountExists = false;
                }
            }
        }

        if($accountExists == true){
            // SQL Seguro
            $stmt = $conn->prepare("UPDATE userParking SET mail = ?, pass = ?, nivel = ? WHERE iduser = ?");
            $stmt->bind_param("ssii", $mail,$passHash, $lvl, $id);
    
            try{
                if($stmt->execute()){
                    $stmt->execute();
                    $id = $conn->insert_id;
                    header('Content-Type: application/json');
                    echo json_encode(true);
                } else {
                    header('Content-Type: application/json');
                    echo json_encode(false);
                }
            } catch(mysqli_sql_exception $e) {
                header('Content-Type: application/json');
                echo json_encode($conn->error);
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(false);
        }

    } else {
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}
$conn->close();
?>