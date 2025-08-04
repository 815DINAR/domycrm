<?php
// api/tariffs/create.php - Создание нового тарифа (только админ)

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

$name = $input['name'] ?? null;
$year = $input['year'] ?? null;
$data = $input['data'] ?? null;
$copyFromId = $input['copy_from_id'] ?? null;

// Валидация
if (!$name || !$year) {
    sendJsonResponse(['success' => false, 'error' => 'Name and year are required']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем уникальность имени
    $checkStmt = $pdo->prepare("SELECT id FROM tariffs WHERE name = ? LIMIT 1");
    $checkStmt->execute([$name]);
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(['success' => false, 'error' => 'Tariff with this name already exists']);
    }
    
    // Если копируем из существующего тарифа
    if ($copyFromId && !$data) {
        $copyStmt = $pdo->prepare("SELECT data FROM tariffs WHERE id = ? LIMIT 1");
        $copyStmt->execute([$copyFromId]);
        $sourceTariff = $copyStmt->fetch();
        
        if ($sourceTariff) {
            $data = json_decode($sourceTariff['data'], true);
            // Обновляем название и год в копии
            $data['name'] = $name;
            $data['year'] = $year;
        }
    }
    
    // Если данных нет, создаем пустую структуру
    if (!$data) {
        $data = [
            'name' => $name,
            'year' => $year,
            'categories' => []
        ];
    }
    
    // Вставляем новый тариф
    $insertStmt = $pdo->prepare("
        INSERT INTO tariffs (name, year, data, is_active, is_default, created_by) 
        VALUES (?, ?, ?, TRUE, FALSE, ?)
    ");
    
    $insertStmt->execute([
        $name,
        $year,
        json_encode($data, JSON_UNESCAPED_UNICODE),
        $_SESSION['user_id']
    ]);
    
    $newId = $pdo->lastInsertId();
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} created tariff: {$name} (ID: {$newId})");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Tariff created successfully',
        'id' => $newId
    ]);
    
} catch (Exception $e) {
    error_log("Create tariff error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}