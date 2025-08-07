// API URL для калькулятора КЦ
const CC_API_URL = '/api/call-center';

// Данные услуг (будут загружены из БД)
let ccServices = [];

// Текущий выбранный план
let ccCurrentPlan = 'maximum';

// Флаг инициализации
let ccInitialized = false;

// Результаты расчета для детализации
let ccCalculationResults = [];

// Инициализация калькулятора КЦ
function initCallCenter() {
    if (ccInitialized) return;
    
    ccInitialized = true;
    
    // Устанавливаем даты по умолчанию
    setDefaultCCDates();
    
    loadCCServicesFromDB().then(() => {
        initializeCCPlans();
        renderCCServices();
        attachCCEventListeners();
        attachPeriodButtonListeners();
        calculateCCTotal();
    }).catch(error => {
        console.error('Критическая ошибка при загрузке данных КЦ:', error);
        document.getElementById('ccServicesContainer').innerHTML = 
            '<div style="padding: 20px; text-align: center; color: #e74c3c;">Ошибка загрузки данных. Пожалуйста, обновите страницу.</div>';
    });
}

// Установка дат по умолчанию
function setDefaultCCDates() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    document.getElementById('cc-dateFrom').value = today.toISOString().split('T')[0];
    document.getElementById('cc-dateTo').value = nextMonth.toISOString().split('T')[0];
}

// Обновление даты окончания на основе выбранного периода
function updateCCEndDate(months) {
    const dateFromInput = document.getElementById('cc-dateFrom');
    const dateToInput = document.getElementById('cc-dateTo');
    
    if (!dateFromInput.value) {
        // Если дата начала не установлена, устанавливаем сегодня
        const today = new Date();
        dateFromInput.value = today.toISOString().split('T')[0];
    }
    
    const startDate = new Date(dateFromInput.value);
    const endDate = new Date(startDate);
    
    // Добавляем месяцы
    endDate.setMonth(endDate.getMonth() + months);
    
    // Вычитаем один день, чтобы период был ровно N месяцев
    endDate.setDate(endDate.getDate() - 1);
    
    // Устанавливаем дату окончания
    dateToInput.value = endDate.toISOString().split('T')[0];
    
    // Вызываем пересчет
    calculateCCTotal();
}

// Обработчик для кнопок периодов
function attachPeriodButtonListeners() {
    document.querySelectorAll('.cc-period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок
            document.querySelectorAll('.cc-period-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            this.classList.add('active');
            
            // Обновляем дату окончания
            const months = parseInt(this.getAttribute('data-months'));
            updateCCEndDate(months);
        });
    });
    
    // Обработчик изменения даты начала
    document.getElementById('cc-dateFrom').addEventListener('change', function() {
        // Проверяем, есть ли активная кнопка периода
        const activeBtn = document.querySelector('.cc-period-btn.active');
        if (activeBtn) {
            const months = parseInt(activeBtn.getAttribute('data-months'));
            updateCCEndDate(months);
        }
    });
    
    // При изменении даты окончания вручную снимаем выделение с кнопок
    document.getElementById('cc-dateTo').addEventListener('change', function() {
        document.querySelectorAll('.cc-period-btn').forEach(b => b.classList.remove('active'));
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
    
    // Изменение дат
    document.getElementById('cc-dateFrom').addEventListener('change', calculateCCTotal);
    document.getElementById('cc-dateTo').addEventListener('change', calculateCCTotal);
    
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

// Расчет стоимости за период с детализацией
function calculatePeriodCostDetailed(monthlyCost, dateFrom, dateTo) {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    let totalCost = 0;
    let details = [];
    
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
        const monthStart = new Date(currentDate);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        let periodEnd = new Date(Math.min(monthEnd.getTime(), endDate.getTime()));
        
        let monthCost = 0;
        let description = '';
        
        // Если это первый месяц и начинаем не с 1 числа
        if (currentDate.getTime() === startDate.getTime() && startDate.getDate() !== 1) {
            const daysInMonth = monthEnd.getDate();
            const remainingDays = daysInMonth - startDate.getDate() + 1;
            
            if (periodEnd.getMonth() === startDate.getMonth() && periodEnd.getFullYear() === startDate.getFullYear()) {
                // Период в рамках одного месяца
                const periodDays = Math.ceil((periodEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                monthCost = (monthlyCost / daysInMonth) * periodDays;
                description = `${monthStart.toLocaleDateString('ru-RU')} - ${periodEnd.toLocaleDateString('ru-RU')} (${periodDays} дней из ${daysInMonth})`;
            } else {
                // Первый неполный месяц
                monthCost = (monthlyCost / daysInMonth) * remainingDays;
                description = `${monthStart.toLocaleDateString('ru-RU')} - ${monthEnd.toLocaleDateString('ru-RU')} (${remainingDays} дней из ${daysInMonth})`;
            }
        } 
        // Если это последний месяц и заканчиваем не в последний день
        else if (periodEnd.getTime() === endDate.getTime() && 
                 endDate.getDate() !== monthEnd.getDate() && 
                 endDate.getMonth() === monthEnd.getMonth()) {
            const daysInMonth = monthEnd.getDate();
            const usedDays = endDate.getDate();
            monthCost = (monthlyCost / daysInMonth) * usedDays;
            description = `${monthStart.toLocaleDateString('ru-RU')} - ${periodEnd.toLocaleDateString('ru-RU')} (${usedDays} дней из ${daysInMonth})`;
        }
        // Полный месяц
        else {
            monthCost = monthlyCost;
            description = `${monthStart.toLocaleDateString('ru-RU')} - ${monthEnd.toLocaleDateString('ru-RU')} (полный месяц)`;
        }
        
        totalCost += monthCost;
        details.push({
            period: description,
            cost: monthCost,
            isFullMonth: monthCost === monthlyCost
        });
        
        // Переходим к следующему месяцу
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        
        // Защита от бесконечного цикла
        if (currentDate.getFullYear() > endDate.getFullYear() + 1) {
            break;
        }
    }
    
    return {
        totalCost: Math.round(totalCost * 100) / 100,
        details: details
    };
}

// Расчет итоговых сумм
function calculateCCTotal() {
    const rooms = parseFloat(document.getElementById('cc-rooms').value) || 0;
    const area = parseFloat(document.getElementById('cc-area').value) || 0;
    const generalDiscount = parseFloat(document.getElementById('cc-discount').value) || 0;
    const dateFrom = document.getElementById('cc-dateFrom').value;
    const dateTo = document.getElementById('cc-dateTo').value;
    
    // Проверяем, заполнены ли обязательные поля
    if (rooms === 0 || area === 0 || !dateFrom || !dateTo) {
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
        updateCCPeriodTotal(0, '', '');
        return;
    }
    
    // Проверяем корректность дат только если обе даты полностью введены
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    if (startDate >= endDate) {
        // Не показываем ошибку, просто не производим расчет
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
        updateCCPeriodTotal(0, '', '');
        return;
    }
    
    let totalSum = 0;
    let totalDiscountedSum = 0;
    let serviceDetails = [];
    ccCalculationResults = []; // Очищаем предыдущие результаты
    
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
                
                // Расчет за период
                const periodCalc = calculatePeriodCostDetailed(discountedServiceSum, dateFrom, dateTo);
                
                totalSum += serviceSum;
                totalDiscountedSum += discountedServiceSum;
                
                // Добавляем в детализацию
                const pricePerCallWithDiscount = discountedServiceSum / calls;
                const serviceDetail = {
                    name: service.name,
                    calls: calls,
                    price: service.minRate,
                    sum: serviceSum,
                    discount: effectiveDiscount,
                    discountedSum: discountedServiceSum,
                    margin: ((pricePerCallWithDiscount - service.fullCost) / pricePerCallWithDiscount * 100),
                    pricePerCallNoVAT: pricePerCallWithDiscount,
                    pricePerCallWithVAT: pricePerCallWithDiscount * 1.2,
                    periodCost: periodCalc.totalCost,
                    periodCostWithVAT: periodCalc.totalCost * 1.2
                };
                
                serviceDetails.push(serviceDetail);
                
                // Сохраняем детализацию для показа
                ccCalculationResults.push({
                    serviceIndex: index,
                    serviceName: service.name,
                    details: {
                        rooms: rooms,
                        calls: calls,
                        pricePerCall: service.minRate,
                        monthlySum: serviceSum,
                        discount: effectiveDiscount,
                        discountedMonthlySum: discountedServiceSum,
                        periodDetails: periodCalc.details,
                        periodTotal: periodCalc.totalCost,
                        periodTotalWithVAT: periodCalc.totalCost * 1.2
                    }
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
    
    // Расчет общей суммы за период
    let totalPeriodCost = 0;
    serviceDetails.forEach(service => {
        totalPeriodCost += service.periodCost;
    });
    const totalPeriodCostWithVAT = totalPeriodCost * 1.2;
    
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
    
    // Обновление списка услуг с кнопками детализации
    updateCCServicesList(serviceDetails, totalDiscountedSum);
    
    // Обновление итоговой суммы за период
    updateCCPeriodTotal(totalPeriodCostWithVAT, dateFrom, dateTo);
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

// Обновление итоговой суммы за период
function updateCCPeriodTotal(total, dateFrom, dateTo) {
    const periodTotalElement = document.getElementById('cc-periodTotal');
    const periodDatesElement = document.getElementById('cc-periodDates');
    
    if (total > 0 && dateFrom && dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        
        // Вычисляем количество месяцев и дней
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months += endDate.getMonth() - startDate.getMonth();
        
        let days = endDate.getDate() - startDate.getDate();
        if (days < 0) {
            months--;
            const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days = prevMonth.getDate() - startDate.getDate() + endDate.getDate() + 1;
        } else {
            days++; // Включаем последний день
        }
        
        const periodText = `с ${startDate.toLocaleDateString('ru-RU')} по ${endDate.toLocaleDateString('ru-RU')} (${months} мес. ${days} дн.)`;
        
        periodDatesElement.textContent = periodText;
        periodTotalElement.textContent = formatCCNumber(total) + ' ₽';
    } else {
        periodDatesElement.textContent = '-';
        periodTotalElement.textContent = '0 ₽';
    }
}

// Обновление списка услуг с кнопками детализации
function updateCCServicesList(services, total) {
    const container = document.getElementById('ccServicesList');
    container.innerHTML = '';
    
    if (services.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Нет выбранных услуг</div>';
        return;
    }
    
    services.forEach((service, index) => {
        const item = document.createElement('div');
        item.className = 'cc-service-list-item';
        item.innerHTML = `
            <div class="cc-service-list-content">
                <div class="cc-service-list-main">
                    <div class="cc-service-list-name">${service.name}</div>
                    <div class="cc-service-list-details">
                        <div class="cc-service-list-quantity">${service.calls} обр. × ${formatCCNumber(service.price)} ₽</div>
                        ${service.discount > 0 ? `<div style="color: #e74c3c; font-size: 0.9em;">-${service.discount}%</div>` : ''}
                        <div class="cc-service-list-price">${formatCCNumber(service.discountedSum)} ₽/мес</div>
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
                    <div class="cc-metric-item">
                        <span class="cc-metric-label">За период:</span>
                        <span class="cc-metric-value" style="color: #6029E5; font-weight: 600;">${formatCCNumber(service.periodCostWithVAT)} ₽</span>
                    </div>
                </div>
            </div>
            <button class="btn-secondary show-details" onclick="showCCCalculationDetails(${index})" style="margin-top: 10px; width: auto; padding: 8px 16px; font-size: 14px;">
                Показать детализацию расчета
            </button>
            <div id="cc-details-${index}" class="calculation-details" style="display: none; margin-top: 15px; padding: 15px; background: #f7fafc; border-radius: 8px;"></div>
        `;
        container.appendChild(item);
    });
    
    // Итоговая строка
    const totalItem = document.createElement('div');
    totalItem.className = 'cc-service-list-total';
    totalItem.innerHTML = `
        <span>Итого в месяц (без НДС)</span>
        <span>${formatCCNumber(total)} ₽</span>
    `;
    container.appendChild(totalItem);
}

// Показать детализацию расчета для услуги
window.showCCCalculationDetails = function(index) {
    const detailsDiv = document.getElementById(`cc-details-${index}`);
    const button = detailsDiv.previousElementSibling;
    
    if (detailsDiv.style.display === 'none') {
        // Находим соответствующий результат
        const result = ccCalculationResults.find(r => r.serviceName === ccServicesList.children[index].querySelector('.cc-service-list-name').textContent);
        
        if (!result) {
            detailsDiv.innerHTML = '<p>Данные для детализации не найдены</p>';
            detailsDiv.style.display = 'block';
            return;
        }
        
        const details = result.details;
        
        let detailsHTML = `
            <h5 style="margin-bottom: 15px; color: #2d3748;">Детализация расчета для "${result.serviceName}"</h5>
            
            <div style="margin-bottom: 15px;">
                <strong>Исходные данные:</strong>
                <div>• Количество помещений: ${details.rooms}</div>
                <div>• Количество обращений в месяц: ${details.calls}</div>
                <div>• Цена за 1 обращение: ${formatCCNumber(details.pricePerCall)} ₽</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Расчет месячной стоимости:</strong>
                <div style="margin-left: 15px; padding: 8px; background: white; border-radius: 4px;">
                    ${details.calls} обращений × ${formatCCNumber(details.pricePerCall)} ₽ = ${formatCCNumber(details.monthlySum)} ₽
                </div>
            </div>
        `;
        
        if (details.discount > 0) {
            detailsHTML += `
                <div style="margin-bottom: 15px;">
                    <strong>Применена скидка ${details.discount}%:</strong>
                    <div style="margin-left: 15px; padding: 8px; background: white; border-radius: 4px;">
                        ${formatCCNumber(details.monthlySum)} ₽ - ${details.discount}% = ${formatCCNumber(details.discountedMonthlySum)} ₽/мес
                    </div>
                </div>
            `;
        }
        
        detailsHTML += `
            <div style="margin-bottom: 15px;">
                <strong>Стоимость за месяц: ${formatCCNumber(details.discountedMonthlySum)} ₽</strong>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Расчет по периодам:</strong>
        `;
        
        details.periodDetails.forEach(period => {
            detailsHTML += `
                <div style="margin-left: 15px; padding: 8px; background: white; border-radius: 4px; margin-bottom: 5px;">
                    • ${period.period}: ${formatCCNumber(period.cost)} ₽
                </div>
            `;
        });
        
        detailsHTML += `
            </div>
            
            <div style="font-weight: bold; font-size: 16px; color: #667eea;">
                Итого за весь период (без НДС): ${formatCCNumber(details.periodTotal)} ₽
            </div>
            
            <div style="margin-top: 10px; padding: 10px; background: #e6fffa; border-radius: 4px; border-left: 4px solid #38b2ac;">
                <strong>С учетом НДС 20%:</strong><br>
                <strong>Финальная стоимость: ${formatCCNumber(details.periodTotalWithVAT)} ₽</strong>
            </div>
        `;
        
        detailsDiv.innerHTML = detailsHTML;
        detailsDiv.style.display = 'block';
        button.textContent = 'Скрыть детализацию расчета';
    } else {
        // Скрываем детализацию
        detailsDiv.style.display = 'none';
        button.textContent = 'Показать детализацию расчета';
    }
}

// Форматирование чисел
function formatCCNumber(num, decimals = 2) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}