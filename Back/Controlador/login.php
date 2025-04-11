<?php
session_start();

// Incluir la conexión
require_once '../BDConexion/BD.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respuestaJson(false, "Método no permitido (Use POST).");
    exit;
}

// Obtenemos datos
$usuarioIngresado = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
$passwordIngresado = isset($_POST['password']) ? $_POST['password'] : '';

// Validar campos
if (empty($usuarioIngresado) || empty($passwordIngresado)) {
    respuestaJson(false, "Todos los campos son obligatorios.");
    exit;
}

// Conexión a BD
$conexionObj = new Conexion();
$db = $conexionObj->conectar();

try {
    // Buscamos al usuario por email O username
    $sql = "SELECT * FROM usuario 
            WHERE email = :usuario OR username = :usuario 
            LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':usuario', $usuarioIngresado, PDO::PARAM_STR);
    $stmt->execute();
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
        // No se encontró usuario
        respuestaJson(false, "El usuario o email no existe.");
        exit;
    }
    
    // Verificamos la contraseña con password_verify
    if (!password_verify($passwordIngresado, $fila['password'])) {
        respuestaJson(false, "Contraseña incorrecta.");
        exit;
    }

    // Si pasó la verificación, guardamos datos de sesión
    $_SESSION['usuario_id'] = $fila['id'];
    $_SESSION['usuario_nombre'] = $fila['username'];
    // $_SESSION['usuario_email'] = $fila['email']; // si necesitas

    // Enviamos respuesta exitosa
    respuestaJson(true, "Inicio de sesión exitoso.");
} catch (PDOException $e) {
    respuestaJson(false, "Error en la base de datos: " . $e->getMessage());
}

function respuestaJson($exito, $mensaje) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'exito'   => $exito,
        'mensaje' => $mensaje
    ]);
    exit;
}
