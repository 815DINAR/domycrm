<?php
// api/tariffs/update.php - Обновление тарифа (только админ)

require_once '../config.php';

// Проверяем права администратора
if (!checkAdmin()) {
    http_response_code(403);
    sendJsonResponse(['success' => false, 'error' => 'Access denied']);
}

// Принимаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed']);
}

// Получаем данные
$input = json_decode(file_get_contents('php://input'), true);

$id = $input['id'] ?? null;
$name = $input['name'] ?? null;
$year = $input['year'] ?? null;
$data = $input['data'] ?? null;

// Валидация
if (!$id) {
    sendJsonResponse(['success' => false, 'error' => 'Tariff ID is required']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем существование тарифа
    $checkStmt = $pdo->prepare("SELECT id, name FROM tariffs WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $existingTariff = $checkStmt->fetch();
    
    if (!$existingTariff) {
        sendJsonResponse(['success' => false, 'error' => 'Tariff not found']);
    }
    
    // Если меняем имя, проверяем уникальность
    if ($name && $name !== $existingTariff['name']) {
        $nameCheckStmt = $pdo->prepare("SELECT id FROM tariffs WHERE name = ? AND id != ? LIMIT 1");
        $nameCheckStmt->execute([$name, $id]);
        
        if ($nameCheckStmt->fetch()) {
            sendJsonResponse(['success' => false, 'error' => 'Tariff with this name already exists']);
        }
    }
    
    // Подготавливаем запрос на обновление
    $updateFields = [];
    $updateParams = [];
    
    if ($name !== null) {
        $updateFields[] = "name = ?";
        $updateParams[] = $name;
        // Обновляем имя в data
        if ($data) {
            $data['name'] = $name;
        }
    }
    
    if ($year !== null) {
        $updateFields[] = "year = ?";
        $updateParams[] = $year;
        // Обновляем год в data
        if ($data) {
            $data['year'] = $year;
        }
    }
    
    if ($data !== null) {
        $updateFields[] = "data = ?";
        $updateParams[] = json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    
    if (empty($updateFields)) {
        sendJsonResponse(['success' => false, 'error' => 'No data to update']);
    }
    
    // Добавляем ID в конец параметров
    $updateParams[] = $id;
    
    // Выполняем обновление
    $updateStmt = $pdo->prepare("
        UPDATE tariffs 
        SET " . implode(", ", $updateFields) . ", updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $updateStmt->execute($updateParams);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} updated tariff ID: {$id}");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Tariff updated successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Update tariff error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}