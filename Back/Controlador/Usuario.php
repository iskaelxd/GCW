<?php
// Ruta a tu clase de conexión
require_once '../BDConexion/BD.php';

// Valida que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respuestaJson(false, "Método no permitido (Use POST).");
    exit;
}

// Obtenemos los datos que vienen del formulario (AJAX)
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$email    = isset($_POST['email'])    ? trim($_POST['email'])    : '';
$password = isset($_POST['password']) ? $_POST['password']       : '';

// Validaciones básicas en el servidor
if (empty($username) || empty($email) || empty($password)) {
    respuestaJson(false, "Faltan datos. Por favor completa todos los campos.");
    exit;
}

// Aquí podrías validar la longitud del password, etc.
if (strlen($password) < 5) {
    respuestaJson(false, "La contraseña debe tener al menos 5 caracteres.");
    exit;
}

// Instancia la conexión
$conexionObj = new Conexion();
$db = $conexionObj->conectar();

// Verifica si el email o el username ya existen
try {
    $sqlVerificar = "SELECT COUNT(*) as total FROM usuario WHERE email = :email OR username = :username";
    $stmtVerificar = $db->prepare($sqlVerificar);
    $stmtVerificar->bindParam(':email', $email);
    $stmtVerificar->bindParam(':username', $username);
    $stmtVerificar->execute();
    $resultadoVerificar = $stmtVerificar->fetch(PDO::FETCH_ASSOC);

    if ($resultadoVerificar['total'] > 0) {
        respuestaJson(false, "El correo o el nombre de usuario ya está en uso.");
        exit;
    }
} catch (PDOException $e) {
    respuestaJson(false, "Error al verificar usuario: " . $e->getMessage());
    exit;
}

// Si pasa la validación, insertamos en la tabla usuario
try {
    // Encriptar la contraseña (recomendable usar password_hash)
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $sqlInsert = "INSERT INTO usuario (username, email, password) VALUES (:username, :email, :passwordHash)";
    $stmtInsert = $db->prepare($sqlInsert);
    $stmtInsert->bindParam(':username', $username);
    $stmtInsert->bindParam(':email', $email);
    $stmtInsert->bindParam(':passwordHash', $passwordHash);

    $stmtInsert->execute();

    respuestaJson(true, "Registro exitoso. Ahora puedes iniciar sesión.");
} catch (PDOException $e) {
    respuestaJson(false, "Error al registrar usuario: " . $e->getMessage());
    exit;
}

// Función auxiliar para responder en JSON
function respuestaJson($exito, $mensaje) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "exito"   => $exito,
        "mensaje" => $mensaje
    ]);
    exit;
}
