<?php
// api/admin/update-user-role.php - Изменение роли пользователя

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
$newRole = $input['role'] ?? null;

if (!$userId || !$newRole) {
    sendJsonResponse(['success' => false, 'error' => 'User ID and role are required']);
}

// Проверяем валидность роли
$validRoles = ['employee', 'admin'];
if (!in_array($newRole, $validRoles)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid role']);
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
    
    // Защита от удаления прав администратора у последнего админа
    if ($user['role'] === 'admin' && $newRole === 'employee') {
        $adminCountStmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        $adminCountStmt->execute();
        $adminCount = $adminCountStmt->fetch()['count'];
        
        if ($adminCount <= 1) {
            sendJsonResponse(['success' => false, 'error' => 'Cannot remove admin rights from the last administrator']);
        }
    }
    
    // Обновляем роль
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET role = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $updateStmt->execute([$newRole, $userId]);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} changed role of user {$user['email']} from {$user['role']} to {$newRole}");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'User role updated successfully',
        'new_role' => $newRole
    ]);
    
} catch (Exception $e) {
    error_log("Update user role error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>