<?php
// api/admin/reject-user.php - Отклонение заявки пользователя

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

if (!$userId) {
    sendJsonResponse(['success' => false, 'error' => 'User ID not provided']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем пользователя
    $checkStmt = $pdo->prepare("SELECT id, status, email FROM users WHERE id = ? LIMIT 1");
    $checkStmt->execute([$userId]);
    $user = $checkStmt->fetch();
    
    if (!$user) {
        sendJsonResponse(['success' => false, 'error' => 'User not found']);
    }
    
    if ($user['status'] !== 'pending') {
        sendJsonResponse(['success' => false, 'error' => 'User is not in pending status']);
    }
    
    // Отклоняем пользователя
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET status = 'rejected', 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $updateStmt->execute([$userId]);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} rejected user {$user['email']} (ID: {$userId})");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'User rejected successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Reject user error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>