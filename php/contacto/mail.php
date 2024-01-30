<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorize');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once('../../vendor/autoload.php');

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    if($json_data){

        try{
            $data = json_decode($json_data, true);
            $nombre = $data['nombre'];
            $telefono = $data['telefono'];
            $mensaje = $data['mensaje'];
            $formText = str_replace("\n","<br/>",$mensaje);

            $phpmailer = new PHPMailer();
            $phpmailer->isSMTP();
            $phpmailer->Host = 'mail.ringring.cl';
            $phpmailer->SMTPAuth = true;
            $phpmailer->Port = 465;
            $phpmailer->Username = 'dgonzalez@ringring.cl';
            $phpmailer->Password = 'Wit2023#';
            $phpmailer->CharSet = "UTF-8";
            $phpmailer->Encoding = 'base64';
            $phpmailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    
            $phpmailer->setFrom('dgonzalez@ringring.cl');

            $phpmailer->addAddress('dgonzalez@wit.la');

            $phpmailer->isHTML(true);
            $phpmailer->Subject = "Comentario de $nombre";
            $phpmailer->Body    = "
            Nombre = $nombre <BR>
            Teléfono = $telefono <HR>
            $formText            
            ";
            $phpmailer->AltBody = "Nombre: $nombre\n---------------\nTeléfono: $telefono\n---------------\n$mensaje";

            $phpmailer->send();
            echo "Enviado correctamente";
        } catch(Exception $e){
            echo $phpmailer->ErrorInfo;
        }
        
    }
}

?>