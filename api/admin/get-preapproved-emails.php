<?php
// api/admin/get-preapproved-emails.php - Получение списка предодобренных email

require_once '../config.php';

// Проверяем права администратора
if (!checkAdmin()) {
    http_response_code(403);
    sendJsonResponse(['success' => false, 'error' => 'Access denied']);
}

try {
    $pdo = getDbConnection();
    
    // Получаем список предодобренных email
    $stmt = $pdo->prepare("
        SELECT id, email, created_at
        FROM pre_approved_emails 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $emails = $stmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'emails' => $emails
    ]);
    
} catch (Exception $e) {
    error_log("Get preapproved emails error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>