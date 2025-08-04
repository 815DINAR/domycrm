<?php
// api/call-center/get_services.php - Получение списка услуг КЦ

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

try {
    $pdo = getDbConnection();
    
    // Получаем все услуги с их тарифными планами
    $sql = "SELECT 
                s.id,
                s.name,
                s.duration,
                s.min_rate,
                s.full_cost,
                s.is_phone_calls,
                s.is_mobile_app,
                s.default_calls,
                GROUP_CONCAT(tp.code) as tariff_plans
            FROM services s
            LEFT JOIN service_tariff_plans stp ON s.id = stp.service_id
            LEFT JOIN tariff_plans tp ON stp.tariff_plan_id = tp.id
            GROUP BY s.id
            ORDER BY s.id";
    
    $stmt = $pdo->query($sql);
    $services = $stmt->fetchAll();
    
    // Преобразуем строку tariff_plans в массив
    foreach ($services as &$service) {
        $service['tariff_plans'] = $service['tariff_plans'] ? explode(',', $service['tariff_plans']) : [];
        // Преобразуем числовые строки в числа
        $service['min_rate'] = floatval($service['min_rate']);
        $service['full_cost'] = floatval($service['full_cost']);
        $service['is_phone_calls'] = (bool)$service['is_phone_calls'];
        $service['is_mobile_app'] = (bool)$service['is_mobile_app'];
        $service['default_calls'] = intval($service['default_calls']);
    }
    
    sendJsonResponse([
        'success' => true,
        'data' => $services
    ]);
    
} catch (Exception $e) {
    error_log("Get CC services error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>