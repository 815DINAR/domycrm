<?php
// api/call-center/calculate.php - Расчет стоимости КЦ

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

// Принимаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed']);
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid input data']);
}

$rooms = floatval($input['rooms'] ?? 0);
$area = floatval($input['area'] ?? 0);
$generalDiscount = floatval($input['generalDiscount'] ?? 0);
$tariffPlan = $input['tariffPlan'] ?? 'maximum';
$serviceData = $input['services'] ?? [];

try {
    $pdo = getDbConnection();
    
    // Получаем услуги для выбранного тарифа
    $sql = "SELECT 
                s.id,
                s.name,
                s.min_rate,
                s.full_cost
            FROM services s
            JOIN service_tariff_plans stp ON s.id = stp.service_id
            JOIN tariff_plans tp ON stp.tariff_plan_id = tp.id
            WHERE tp.code = :tariff_plan";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['tariff_plan' => $tariffPlan]);
    $availableServices = $stmt->fetchAll();
    
    $totalSum = 0;
    $totalDiscountedSum = 0;
    $serviceDetails = [];
    
    foreach ($availableServices as $service) {
        $serviceId = $service['id'];
        
        // Проверяем, есть ли данные для этой услуги
        if (isset($serviceData[$serviceId])) {
            $calls = floatval($serviceData[$serviceId]['calls'] ?? 0);
            $individualDiscount = floatval($serviceData[$serviceId]['discount'] ?? 0);
            
            if ($calls > 0) {
                $minRate = floatval($service['min_rate']);
                $fullCost = floatval($service['full_cost']);
                
                $serviceSum = $calls * $minRate;
                $effectiveDiscount = $individualDiscount ?: $generalDiscount;
                $discountedServiceSum = $serviceSum * (1 - $effectiveDiscount / 100);
                
                $totalSum += $serviceSum;
                $totalDiscountedSum += $discountedServiceSum;
                
                $pricePerCallWithDiscount = $discountedServiceSum / $calls;
                $margin = (($pricePerCallWithDiscount - $fullCost) / $pricePerCallWithDiscount * 100);
                
                $serviceDetails[] = [
                    'id' => $serviceId,
                    'name' => $service['name'],
                    'calls' => $calls,
                    'price' => $minRate,
                    'sum' => $serviceSum,
                    'discount' => $effectiveDiscount,
                    'discountedSum' => $discountedServiceSum,
                    'margin' => $margin,
                    'pricePerCallNoVAT' => $pricePerCallWithDiscount,
                    'pricePerCallWithVAT' => $pricePerCallWithDiscount * 1.2
                ];
            }
        }
    }
    
    $totalWithVAT = $totalDiscountedSum * 1.2;
    
    $result = [
        'success' => true,
        'data' => [
            'monthlySum' => $totalSum,
            'discountedSum' => $totalDiscountedSum,
            'totalWithVAT' => $totalWithVAT,
            'perRoomNoVAT' => $rooms > 0 ? $totalDiscountedSum / $rooms : 0,
            'perRoomWithVAT' => $rooms > 0 ? $totalWithVAT / $rooms : 0,
            'perSqmNoVAT' => $area > 0 ? $totalDiscountedSum / $area : 0,
            'perSqmWithVAT' => $area > 0 ? $totalWithVAT / $area : 0,
            'services' => $serviceDetails
        ]
    ];
    
    sendJsonResponse($result);
    
} catch (Exception $e) {
    error_log("Calculate CC error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>