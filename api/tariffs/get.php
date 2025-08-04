<?php
// api/tariffs/get.php - Получение данных конкретного тарифа

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

// Получаем ID тарифа
$tariffId = $_GET['id'] ?? null;

// Если ID не указан, берем тариф по умолчанию
if (!$tariffId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT id FROM tariffs WHERE is_default = TRUE AND is_active = TRUE LIMIT 1");
        $stmt->execute();
        $defaultTariff = $stmt->fetch();
        
        if ($defaultTariff) {
            $tariffId = $defaultTariff['id'];
        } else {
            // Если нет тарифа по умолчанию, берем первый активный
            $stmt = $pdo->prepare("SELECT id FROM tariffs WHERE is_active = TRUE ORDER BY year DESC, id DESC LIMIT 1");
            $stmt->execute();
            $firstTariff = $stmt->fetch();
            
            if ($firstTariff) {
                $tariffId = $firstTariff['id'];
                // Устанавливаем его как тариф по умолчанию
                $updateStmt = $pdo->prepare("UPDATE tariffs SET is_default = TRUE WHERE id = ?");
                $updateStmt->execute([$tariffId]);
            } else {
                sendJsonResponse(['success' => false, 'error' => 'No active tariffs found']);
            }
        }
    } catch (Exception $e) {
        error_log("Get default tariff error: " . $e->getMessage());
        sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
    }
}

try {
    $pdo = getDbConnection();
    
    // Получаем тариф
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            year,
            data,
            is_active,
            is_default,
            created_at,
            updated_at
        FROM tariffs
        WHERE id = ? AND is_active = TRUE
        LIMIT 1
    ");
    $stmt->execute([$tariffId]);
    $tariff = $stmt->fetch();
    
    if (!$tariff) {
        sendJsonResponse(['success' => false, 'error' => 'Tariff not found']);
    }
    
    // Декодируем JSON data
    $tariff['data'] = json_decode($tariff['data'], true);
    
    sendJsonResponse([
        'success' => true,
        'tariff' => $tariff
    ]);
    
} catch (Exception $e) {
    error_log("Get tariff error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}