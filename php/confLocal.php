<?php
//To-Do: Transformar a objeto
$secretkey = "aqui no va a estar";

$server = "localhost";
$user = "root";
$pass = "";
$db = "Parking";

$conn = new mysqli($server,$user,$pass,$db);

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}
?>