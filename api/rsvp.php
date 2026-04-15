<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Método no permitido", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    jsonResponse(false, "JSON inválido", null, 400);
}

$id_evento = isset($input['id_evento']) ? (int)$input['id_evento'] : 0;
$id_invitado = isset($input['id_invitado']) ? (int)$input['id_invitado'] : 0;
$asistencia = trim((string)($input['asistencia'] ?? ''));
$cantidad_confirmada = isset($input['cantidad_confirmada']) ? (int)$input['cantidad_confirmada'] : null;
$mensaje = trim((string)($input['mensaje'] ?? ''));

if ($id_evento <= 0 || $id_invitado <= 0) {
    jsonResponse(false, "Datos incompletos", null, 400);
}

if (!in_array($asistencia, ['si', 'no'], true)) {
    jsonResponse(false, "Valor de asistencia inválido", null, 400);
}

$db = new DB();
$pdo = $db->connect();

$sqlInv = "SELECT id_invitado, nombre, pases, numero_mesa
           FROM invitados
           WHERE id_invitado = :id_invitado
             AND id_evento = :id_evento
           LIMIT 1";

$stmtInv = $pdo->prepare($sqlInv);
$stmtInv->execute([
    'id_invitado' => $id_invitado,
    'id_evento'   => $id_evento
]);

$invitado = $stmtInv->fetch(PDO::FETCH_ASSOC);

if (!$invitado) {
    jsonResponse(false, "Invitado no encontrado", null, 404);
}

$pases = max(1, (int)$invitado['pases']);

if ($asistencia === 'si') {
    if ($cantidad_confirmada === null || $cantidad_confirmada <= 0) {
        $cantidad_confirmada = $pases;
    }

    if ($cantidad_confirmada > $pases) {
        jsonResponse(false, "La cantidad confirmada supera los pases permitidos", null, 400);
    }

    $estado = 'confirmado';
} else {
    $estado = 'rechazado';
    $cantidad_confirmada = 0;
}

$sql = "UPDATE invitados
        SET estado_invitado = :estado,
            cantidad_confirmada = :cantidad_confirmada,
            mensaje_confirmacion = :mensaje,
            fecha_confirmacion = NOW()
        WHERE id_invitado = :id_invitado
          AND id_evento = :id_evento";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    'estado'              => $estado,
    'cantidad_confirmada' => $cantidad_confirmada,
    'mensaje'             => $mensaje !== '' ? $mensaje : null,
    'id_invitado'         => $id_invitado,
    'id_evento'           => $id_evento
]);

jsonResponse(true, "Confirmación registrada correctamente", [
    'id_invitado'         => (int)$invitado['id_invitado'],
    'nombre'              => $invitado['nombre'],
    'estado_invitado'     => $estado,
    'cantidad_confirmada' => $cantidad_confirmada,
    'numero_mesa'         => $invitado['numero_mesa']
]);