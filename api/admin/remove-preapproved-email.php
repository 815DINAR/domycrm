<?php
// api/admin/remove-preapproved-email.php - Удаление предодобренного email

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

if (!$id) {
    sendJsonResponse(['success' => false, 'error' => 'ID not provided']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем, существует ли email
    $checkStmt = $pdo->prepare("SELECT email FROM pre_approved_emails WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $emailData = $checkStmt->fetch();
    
    if (!$emailData) {
        sendJsonResponse(['success' => false, 'error' => 'Email not found']);
    }
    
    // Удаляем email
    $deleteStmt = $pdo->prepare("DELETE FROM pre_approved_emails WHERE id = ?");
    $deleteStmt->execute([$id]);
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} removed preapproved email {$emailData['email']}");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Email removed successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Remove preapproved email error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>