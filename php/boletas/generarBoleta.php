<?php

$data = [
  "codigoEmpresa" => "89",
  "tipoDocumento" => "39",  // Tipo de boleta afecta
  "total" => (string)$valorTot,  // Usar el valor calculado
  "detalleBoleta" => "53-" . $valorTot . "-1-dsa-BANO"  
];


$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => 'https://qa.pullman.cl/srv-dte-web/rest/emisionDocumentoElectronico/generarDocumento',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'
    ],
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if (curl_errno($curl)) {
    echo 'Error en la solicitud: ' . curl_error($curl);
} elseif ($httpCode !== 200) {
    echo "Error HTTP: Código $httpCode - Respuesta: $response";
} else {
    $responseData = json_decode($response, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        if (isset($responseData['respuesta']) && $responseData['respuesta'] === 'OK') {
            echo "Boleta generada con éxito: " . $responseData['rutaAcepta'];
        } else {
            echo "Error en la generación de la boleta: " . ($responseData['respuesta'] ?? 'Respuesta desconocida');
        }
    } else {
        echo "Error al decodificar la respuesta JSON: " . json_last_error_msg();
    }
}

curl_close($curl);
