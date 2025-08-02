<?php
// api/admin/delete-user.php - Удаление пользователя

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
    
    // Проверяем, существует ли пользователь
    $checkStmt = $pdo->prepare("SELECT id, email, role FROM users WHERE id = ? LIMIT 1");
    $checkStmt->execute([$userId]);
    $user = $checkStmt->fetch();
    
    if (!$user) {
        sendJsonResponse(['success' => false, 'error' => 'User not found']);
    }
    
    // Защита от удаления самого себя
    if ($userId == $_SESSION['user_id']) {
        sendJsonResponse(['success' => false, 'error' => 'Cannot delete your own account']);
    }
    
    // Защита от удаления последнего администратора
    if ($user['role'] === 'admin') {
        $adminCountStmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        $adminCountStmt->execute();
        $adminCount = $adminCountStmt->fetch()['count'];
        
        if ($adminCount <= 1) {
            sendJsonResponse(['success' => false, 'error' => 'Cannot delete the last administrator']);
        }
    }
    
    // Удаляем пользователя
    $deleteStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $deleteStmt->execute([$userId]);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} deleted user {$user['email']} (ID: {$userId})");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'User deleted successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Delete user error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>