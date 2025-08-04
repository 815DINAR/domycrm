<?php
// api/admin/update-user-status.php - Изменение статуса пользователя

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

// Получаем данные из запроса
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['user_id'] ?? null;
$newStatus = $input['status'] ?? null;

if (!$userId || !$newStatus) {
    sendJsonResponse(['success' => false, 'error' => 'User ID and status are required']);
}

// Проверяем валидность статуса
$validStatuses = ['pending', 'approved', 'rejected'];
if (!in_array($newStatus, $validStatuses)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid status']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем, существует ли пользователь
    $checkStmt = $pdo->prepare("SELECT id, email, status FROM users WHERE id = ? LIMIT 1");
    $checkStmt->execute([$userId]);
    $user = $checkStmt->fetch();
    
    if (!$user) {
        sendJsonResponse(['success' => false, 'error' => 'User not found']);
    }
    
    // Защита от изменения статуса самому себе (опционально)
    if ($userId == $_SESSION['user_id'] && $newStatus !== 'approved') {
        sendJsonResponse(['success' => false, 'error' => 'Cannot change your own status to ' . $newStatus]);
    }
    
    // Обновляем статус
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET status = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $updateStmt->execute([$newStatus, $userId]);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} changed status of user {$user['email']} from {$user['status']} to {$newStatus}");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'User status updated successfully',
        'new_status' => $newStatus
    ]);
    
} catch (Exception $e) {
    error_log("Update user status error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>