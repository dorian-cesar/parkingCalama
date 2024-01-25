<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

use Firebase\JWT\JWT;

require_once('../../vendor/autoload.php');

include("../conf.php");

$validCred = false;
$retrn = [];

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if($data !== null){
        $mail = $data["mail"];
        $pass = $data["pass"];

        $stmt = $conn->prepare("SELECT id, correo, pass, nivel FROM Usuario WHERE correo LIKE ?");
        $stmt->bind_param("s", $mail);

        if($stmt->execute()){
            $result = $stmt->get_result();
            if($result->num_rows > 0){
                $retrn = $result->fetch_Assoc();
                if(password_verify($pass,$retrn['pass'])){
                    $validCred = true;
                } else {
                    $validCred = false;
                }
            }
        }
    }
}

if($validCred == true){
    $tokenId    = base64_encode(random_bytes(16));
    $issuedAt   = new DateTimeImmutable();
    $expire     = $issuedAt->modify('+1 day')->getTimestamp();
    $serverName = "wit.la";
    $logon      = TRUE;
    $user       = $retrn['correo'];
    $nivel      = $retrn['nivel'];

    $data = [
        'iat'  => $issuedAt->getTimestamp(),
        'jti'  => $tokenId,
        'iss'  => $serverName,
        'nbf'  => $issuedAt->getTimestamp(),
        'exp'  => $expire,
        'logon' => $logon,
        'user' => $user,
        'nivel' => $nivel,
    ];

    header("Content-Type: text/plain");
    echo JWT::encode($data,$secretkey,'HS512');
} else {
    echo "Error";
}