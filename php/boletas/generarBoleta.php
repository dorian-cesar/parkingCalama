<?php

$data = [
    "codigoEmpresa" => "89",  
    "tipoDocumento" => "39",  
    "total" => (string)$valorTot,  // Usar el valor calculado como string
    "detalleBoleta" => "53-" . (string)$valorTot . "-1-dsa-BANO"  // Concatenar todo como string
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
    $result = [
        'success' => false,
        'message' => 'Error en la solicitud: ' . curl_error($curl)
    ];
} elseif ($httpCode !== 200) {
    $result = [
        'success' => false,
        'message' => "Error HTTP: Código $httpCode",
        'response' => $response
    ];
} else {
    $responseData = json_decode($response, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        if (isset($responseData['respuesta']) && $responseData['respuesta'] === 'OK') {
            if (isset($responseData['rutaAcepta']) && filter_var($responseData['rutaAcepta'], FILTER_VALIDATE_URL)) {
                // La boleta fue generada con éxito y la URL es válida
                $result = [
                    'success' => true,
                    'boletaUrl' => $responseData['rutaAcepta']  // Ruta de la boleta generada
                ];
            } else {
                $result = [
                    'success' => false,
                    'message' => 'La boleta fue generada, pero la URL de la boleta no es válida o no está presente.'
                ];
            }
        } else {
            $result = [
                'success' => false,
                'message' => "Error en la generación de la boleta: " . ($responseData['respuesta'] ?? 'Respuesta desconocida')
            ];
        }
    } else {
        $result = [
            'success' => false,
            'message' => "Error al decodificar la respuesta JSON: " . json_last_error_msg()
        ];
    }
}

curl_close($curl);

// Enviar la respuesta como JSON
header('Content-Type: application/json');
echo json_encode($result);

?>
