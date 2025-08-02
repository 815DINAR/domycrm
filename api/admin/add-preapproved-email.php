<?php
// api/admin/add-preapproved-email.php - Добавление предодобренного email

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
$email = $input['email'] ?? null;

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid email address']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем, не существует ли уже такой email
    $checkStmt = $pdo->prepare("SELECT id FROM pre_approved_emails WHERE email = ? LIMIT 1");
    $checkStmt->execute([$email]);
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(['success' => false, 'error' => 'Email already exists in pre-approved list']);
    }
    
    // Добавляем email
    $insertStmt = $pdo->prepare("
        INSERT INTO pre_approved_emails (email, added_by) 
        VALUES (?, ?)
    ");
    $insertStmt->execute([$email, $_SESSION['user_id']]);
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Email added successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Add preapproved email error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>