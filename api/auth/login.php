<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, "Método no permitido", null, 405);
    }

    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);

    if (!is_array($input)) {
        jsonResponse(false, "JSON inválido", ["raw" => $raw], 400);
    }

    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (!is_string($email) || !is_string($password)) {
        jsonResponse(false, "Email o password inválidos", [
            "tipo_email" => gettype($email),
            "tipo_password" => gettype($password)
        ], 400);
    }

    $email = trim($email);
    $password = trim($password);

    if ($email === '' || $password === '') {
        jsonResponse(false, "Email y password son requeridos", null, 400);
    }

    $db = new DB();
    $pdo = $db->connect();

    $sql = "SELECT id_usuario, nombre, email, password_hash, activo
            FROM usuarios
            WHERE email = :email
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse(false, "Usuario no encontrado", null, 404);
    }

    if (!(int)$user['activo']) {
        jsonResponse(false, "Usuario inactivo", null, 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(false, "Contraseña incorrecta", null, 401);
    }

    $_SESSION['usuario'] = [
        'id_usuario' => $user['id_usuario'],
        'nombre' => $user['nombre'],
        'email' => $user['email']
    ];

    jsonResponse(true, "Login correcto", [
        'id_usuario' => $user['id_usuario'],
        'nombre' => $user['nombre'],
        'email' => $user['email']
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "message" => "Error interno",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}