// API URL для калькулятора КЦ
const CC_API_URL = '/api/call-center';

// Данные услуг (будут загружены из БД)
let ccServices = [];

// Текущий выбранный план
let ccCurrentPlan = 'maximum';

// Флаг инициализации
let ccInitialized = false;

// Инициализация калькулятора КЦ
function initCallCenter() {
    if (ccInitialized) return;
    
    ccInitialized = true;
    loadCCServicesFromDB().then(() => {
        initializeCCPlans();
        renderCCServices();
        attachCCEventListeners();
        calculateCCTotal();
    }).catch(error => {
        console.error('Критическая ошибка при загрузке данных КЦ:', error);
        document.getElementById('ccServicesContainer').innerHTML = 
            '<div style="padding: 20px; text-align: center; color: #e74c3c;">Ошибка загрузки данных. Пожалуйста, обновите страницу.</div>';
    });
}

// Функция загрузки услуг из БД
async function loadCCServicesFromDB() {
    try {
        const response = await fetch(`${CC_API_URL}/get_services.php`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Обновляем массив services данными из БД
            ccServices = result.data.map(service => ({
                id: service.id,
                name: service.name,
                duration: service.duration,
                minRate: parseFloat(service.min_rate),
                fullCost: parseFloat(service.full_cost),
                plans: service.tariff_plans,
                defaultCalls: parseInt(service.default_calls) || 0,
                isPhoneCalls: service.is_phone_calls,
                isMobileApp: service.is_mobile_app
            }));
            
            console.log('Услуги КЦ успешно загружены из БД:', ccServices.length);
        } else {
            throw new Error(result.error || 'Неизвестная ошибка при загрузке данных');
        }
    } catch (error) {
        console.error('Ошибка загрузки услуг КЦ:', error);
        throw error;
    }
}

// Инициализация планов
function initializeCCPlans() {
    updateCCPlanCounts();
}

// Обновление количества услуг в планах
function updateCCPlanCounts() {
    const plans = ['basic', 'control', 'maximum', 'night'];
    plans.forEach(plan => {
        const count = ccServices.filter(s => s.plans.includes(plan)).length;
        const planElement = document.querySelector(`#call-center-section [data-plan="${plan}"] .cc-feature-count`);
        if (planElement) {
            planElement.textContent = `${count} услуг`;
        }
    });
}

// Отрисовка услуг
function renderCCServices() {
    const container = document.getElementById('ccServicesContainer');
    container.innerHTML = '';
    
    ccServices.forEach((service, index) => {
        const serviceEl = createCCServiceElement(service, index);
        container.appendChild(serviceEl);
    });
}

// Создание элемента услуги
function createCCServiceElement(service, index) {
    const div = document.createElement('div');
    div.className = 'cc-service-item';
    div.style.display = service.plans.includes(ccCurrentPlan) ? 'block' : 'none';
    
    div.innerHTML = `
        <div class="cc-service-header">
            <div class="cc-service-name">${service.name}</div>
            <div class="cc-service-input">
                <input type="number" 
                       id="cc-service-${index}" 
                       value="${service.defaultCalls}" 
                       min="0" 
                       data-index="${index}"
                       placeholder="0">
                <span>обращений/мес</span>
            </div>
        </div>
        <div class="cc-service-discount">
            <label>Индивидуальная скидка:</label>
            <input type="number" 
                   id="cc-discount-${index}" 
                   min="0" 
                   max="100" 
                   data-index="${index}"
                   placeholder="0">
            <span>%</span>
        </div>
    `;
    
    return div;
}

// Прикрепление обработчиков событий
function attachCCEventListeners() {
    // Изменение количества помещений или м² на помещение
    document.getElementById('cc-rooms').addEventListener('input', function() {
        updateCCArea();
        calculateCCTotal();
    });
    
    document.getElementById('cc-sqmPerRoom').addEventListener('input', function() {
        updateCCArea();
        calculateCCTotal();
    });
    
    document.getElementById('cc-discount').addEventListener('input', calculateCCTotal);
    
    // Выбор плана
    document.querySelectorAll('#call-center-section .cc-plan').forEach(plan => {
        plan.addEventListener('click', function() {
            document.querySelectorAll('#call-center-section .cc-plan').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            ccCurrentPlan = this.getAttribute('data-plan');
            updateCCVisibleServices();
            calculateCCTotal();
        });
    });
    
    // Изменение количества обращений и скидок (делегирование событий)
    document.getElementById('ccServicesContainer').addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            calculateCCTotal();
        }
    });
}

// Обновление площади
function updateCCArea() {
    const rooms = parseFloat(document.getElementById('cc-rooms').value) || 0;
    const sqmPerRoom = parseFloat(document.getElementById('cc-sqmPerRoom').value) || 55;
    const area = rooms * sqmPerRoom;
    
    document.getElementById('cc-area').value = area > 0 ? area : '';
}

// Обновление видимости услуг
function updateCCVisibleServices() {
    document.querySelectorAll('#call-center-section .cc-service-item').forEach((item, index) => {
        const service = ccServices[index];
        item.style.display = service.plans.includes(ccCurrentPlan) ? 'block' : 'none';
    });
}

// Расчет итоговых сумм
function calculateCCTotal() {
    const rooms = parseFloat(document.getElementById('cc-rooms').value) || 0;
    const area = parseFloat(document.getElementById('cc-area').value) || 0;
    const generalDiscount = parseFloat(document.getElementById('cc-discount').value) || 0;
    
    // Проверяем, заполнены ли обязательные поля
    if (rooms === 0 || area === 0) {
        // Очищаем результаты
        updateCCDisplay({
            monthlySum: 0,
            discountedSum: 0,
            totalWithVAT: 0,
            perRoomNoVAT: 0,
            perRoomWithVAT: 0,
            perSqmNoVAT: 0,
            perSqmWithVAT: 0
        });
        updateCCServicesList([], 0);
        return;
    }
    
    let totalSum = 0;
    let totalDiscountedSum = 0;
    let serviceDetails = [];
    
    // Считаем сумму по всем услугам
    ccServices.forEach((service, index) => {
        if (service.plans.includes(ccCurrentPlan)) {
            const input = document.getElementById(`cc-service-${index}`);
            const discountInput = document.getElementById(`cc-discount-${index}`);
            const calls = parseFloat(input.value) || 0;
            const individualDiscount = parseFloat(discountInput.value) || 0;
            
            if (calls > 0) {
                const serviceSum = calls * service.minRate;
                const effectiveDiscount = individualDiscount || generalDiscount;
                const discountedServiceSum = serviceSum * (1 - effectiveDiscount / 100);
                
                totalSum += serviceSum;
                totalDiscountedSum += discountedServiceSum;
                
                // Добавляем в детализацию
                const pricePerCallWithDiscount = discountedServiceSum / calls;
                serviceDetails.push({
                    name: service.name,
                    calls: calls,
                    price: service.minRate,
                    sum: serviceSum,
                    discount: effectiveDiscount,
                    discountedSum: discountedServiceSum,
                    margin: ((pricePerCallWithDiscount - service.fullCost) / pricePerCallWithDiscount * 100),
                    pricePerCallNoVAT: pricePerCallWithDiscount,
                    pricePerCallWithVAT: pricePerCallWithDiscount * 1.2
                });
            }
        }
    });
    
    const totalWithVAT = totalDiscountedSum * 1.2; // НДС 20%
    
    // Расчет тарифов
    const perRoomNoVAT = rooms > 0 ? totalDiscountedSum / rooms : 0;
    const perRoomWithVAT = rooms > 0 ? totalWithVAT / rooms : 0;
    const perSqmNoVAT = area > 0 ? totalDiscountedSum / area : 0;
    const perSqmWithVAT = area > 0 ? totalWithVAT / area : 0;
    
    // Обновление отображения
    updateCCDisplay({
        monthlySum: totalSum,
        discountedSum: totalDiscountedSum,
        totalWithVAT: totalWithVAT,
        perRoomNoVAT: perRoomNoVAT,
        perRoomWithVAT: perRoomWithVAT,
        perSqmNoVAT: perSqmNoVAT,
        perSqmWithVAT: perSqmWithVAT
    });
    
    // Обновление списка услуг
    updateCCServicesList(serviceDetails, totalDiscountedSum);
}

// Обновление отображения результатов
function updateCCDisplay(results) {
    document.getElementById('cc-monthlySum').textContent = formatCCNumber(results.monthlySum) + ' ₽';
    document.getElementById('cc-discountedSum').textContent = formatCCNumber(results.discountedSum) + ' ₽';
    document.getElementById('cc-totalWithVAT').textContent = formatCCNumber(results.totalWithVAT) + ' ₽';
    
    document.getElementById('cc-perRoom').textContent = 
        `${formatCCNumber(results.perRoomNoVAT)} ₽ / ${formatCCNumber(results.perRoomWithVAT)} ₽`;
    
    document.getElementById('cc-perSqm').textContent = 
        `${formatCCNumber(results.perSqmNoVAT)} ₽ / ${formatCCNumber(results.perSqmWithVAT)} ₽`;
}

// Обновление списка услуг
function updateCCServicesList(services, total) {
    const container = document.getElementById('ccServicesList');
    container.innerHTML = '';
    
    if (services.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Нет выбранных услуг</div>';
        return;
    }
    
    services.forEach(service => {
        const item = document.createElement('div');
        item.className = 'cc-service-list-item';
        item.innerHTML = `
            <div class="cc-service-list-content">
                <div class="cc-service-list-main">
                    <div class="cc-service-list-name">${service.name}</div>
                    <div class="cc-service-list-details">
                        <div class="cc-service-list-quantity">${service.calls} обр. × ${formatCCNumber(service.price)} ₽</div>
                        ${service.discount > 0 ? `<div style="color: #e74c3c; font-size: 0.9em;">-${service.discount}%</div>` : ''}
                        <div class="cc-service-list-price">${formatCCNumber(service.discountedSum)} ₽</div>
                    </div>
                </div>
                <div class="cc-service-list-metrics">
                    <div class="cc-metric-item">
                        <span class="cc-metric-label">Маржа:</span>
                        <span class="cc-metric-value">${service.margin.toFixed(1)}%</span>
                    </div>
                    <div class="cc-metric-item">
                        <span class="cc-metric-label">Цена 1 обр.:</span>
                        <span class="cc-metric-value">${formatCCNumber(service.pricePerCallNoVAT)} ₽ / ${formatCCNumber(service.pricePerCallWithVAT)} ₽</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
    
    // Итоговая строка
    const totalItem = document.createElement('div');
    totalItem.className = 'cc-service-list-total';
    totalItem.innerHTML = `
        <span>Итого (без НДС)</span>
        <span>${formatCCNumber(total)} ₽</span>
    `;
    container.appendChild(totalItem);
}

// Форматирование чисел
function formatCCNumber(num, decimals = 2) {
    return num.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '                        <span class="cc-metric-value">${formatCCNumber(service.pricePerCallNoVAT)} ₽ / ${formatCCNumber(service.pricePerCallWithVAT ');
}