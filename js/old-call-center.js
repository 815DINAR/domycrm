// old-call-center.js - Калькулятор для старых партнеров КЦ

// Глобальная функция инициализации старого КЦ
window.initOldCallCenter = function() {
    console.log('Инициализация старого КЦ');
    
    // Установка текущей даты при инициализации
    const today = new Date();
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    
    if (startDateEl && endDateEl) {
        startDateEl.value = formatDate(today);
        
        // Установка даты окончания через месяц минус 1 день
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        endDateEl.value = formatDate(endDate);
    }
    
    // Привязываем обработчики событий
    attachOldCCEventListeners();
}

// Форматирование даты для input
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Привязка обработчиков событий
function attachOldCCEventListeners() {
    console.log('Привязка обработчиков старого КЦ');
    
    // Обработчик изменения типа расчета
    const calculationTypeEl = document.getElementById('calculationType');
    if (calculationTypeEl) {
        calculationTypeEl.addEventListener('change', function() {
            const isIncrease = this.value === 'increase';
            document.getElementById('roomsSection').style.display = isIncrease ? 'none' : 'block';
            document.getElementById('increaseSection').style.display = isIncrease ? 'block' : 'none';
        });
    }
    
    // Обработчики для кнопок периода
    document.querySelectorAll('#old-call-center-section .period-btn').forEach(button => {
        button.addEventListener('click', function() {
            const months = parseInt(this.dataset.months);
            const startDate = new Date(document.getElementById('startDate').value);
            
            // Снимаем активный класс со всех кнопок в этой секции
            document.querySelectorAll('#old-call-center-section .period-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Устанавливаем дату окончания (добавляем месяцы и вычитаем 1 день)
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + months);
            endDate.setDate(endDate.getDate() - 1);
            document.getElementById('endDate').value = formatDate(endDate);
        });
    });
    
    // При изменении даты начала обновляем дату окончания если активна кнопка периода
    const startDateEl = document.getElementById('startDate');
    if (startDateEl) {
        startDateEl.addEventListener('change', function() {
            const activeButton = document.querySelector('#old-call-center-section .period-btn.active');
            if (activeButton) {
                const months = parseInt(activeButton.dataset.months);
                const startDate = new Date(this.value);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + months);
                endDate.setDate(endDate.getDate() - 1);
                document.getElementById('endDate').value = formatDate(endDate);
            }
        });
    }
    
    // Основная кнопка расчета
    const calculateBtn = document.getElementById('old-cc-calculate');
    if (calculateBtn) {
        console.log('Кнопка расчета найдена, привязываем обработчик');
        calculateBtn.addEventListener('click', handleCalculate);
    } else {
        console.error('Кнопка old-cc-calculate не найдена!');
    }
    
    // Кнопка копирования
    const copyBtn = document.getElementById('copyButtonOldCC');
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
    }
}

// Основная функция расчета
function handleCalculate() {
    console.log('Начинаем расчет старого КЦ');
    
    const calculationType = document.getElementById('calculationType').value;
    const objectType = document.getElementById('objectType').value;
    const tariffPrice = parseFloat(document.getElementById('tariffPrice').value);
    const discount = parseFloat(document.getElementById('discount').value) / 100;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let rooms, currentRooms, additionalRooms;
    
    if (calculationType === 'new') {
        rooms = parseInt(document.getElementById('rooms').value);
        if (!rooms || rooms <= 0) {
            alert('Введите корректное количество помещений');
            return;
        }
    } else {
        currentRooms = parseInt(document.getElementById('currentRooms').value);
        additionalRooms = parseInt(document.getElementById('additionalRooms').value);
        
        if (!currentRooms || currentRooms <= 0 || !additionalRooms || additionalRooms <= 0) {
            alert('Введите корректное количество текущих и добавляемых помещений');
            return;
        }
        
        rooms = currentRooms + additionalRooms;
    }
    
    // Валидация
    if (!startDate || !endDate) {
        alert('Выберите даты начала и окончания');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Дата начала не может быть позже даты окончания');
        return;
    }
    
    // Расчет для итогового количества помещений
    let licenseDataTotal;
    if (objectType === 'МКД') {
        licenseDataTotal = calculateMKDLicense(rooms);
    } else {
        licenseDataTotal = calculateKPLicense(rooms);
    }
    
    // Расчет для текущего количества (если увеличение)
    let licenseDataCurrent = null;
    if (calculationType === 'increase') {
        if (objectType === 'МКД') {
            licenseDataCurrent = calculateMKDLicense(currentRooms);
        } else {
            licenseDataCurrent = calculateKPLicense(currentRooms);
        }
    }
    
    // Расчет общего количества дней
    const totalDays = calculateTotalDays(startDate, endDate);
    
    // Базовые месячные ставки для платежа за услуги
    const serviceFeeMonthlyTotal = tariffPrice * rooms;
    const serviceFeeMonthiyCurrent = calculationType === 'increase' ? tariffPrice * currentRooms : 0;
    
    // Расчет платежа за услуги через дни
    const serviceFeeTotal = calculatePeriodCost(serviceFeeMonthlyTotal, startDate, endDate).total;
    const serviceFeeCurrent = calculationType === 'increase' ? calculatePeriodCost(serviceFeeMonthiyCurrent, startDate, endDate).total : 0;
    
    // Расчет лицензионного платежа с учетом периода
    const periodLicenseDataTotal = calculatePeriodCost(licenseDataTotal.fee, startDate, endDate);
    const periodLicenseTotal = periodLicenseDataTotal.total;
    
    let periodLicenseCurrent = 0;
    let periodLicenseDataCurrent = null;
    if (calculationType === 'increase') {
        periodLicenseDataCurrent = calculatePeriodCost(licenseDataCurrent.fee, startDate, endDate);
        periodLicenseCurrent = periodLicenseDataCurrent.total;
    }
    
    // Определяем отображаемые суммы
    let displayLicense, displayService, displayTotal, displayTotalWithDiscount;
    
    if (calculationType === 'new') {
        displayLicense = periodLicenseTotal;
        displayService = serviceFeeTotal;
        displayTotal = displayLicense + displayService;
        displayTotalWithDiscount = displayTotal * (1 - discount);
    } else {
        // Для увеличения показываем только разницу
        displayLicense = periodLicenseTotal - periodLicenseCurrent;
        displayService = serviceFeeTotal - serviceFeeCurrent;
        displayTotal = displayLicense + displayService;
        displayTotalWithDiscount = displayTotal * (1 - discount);
    }
    
    // Расчет лимитов (для итогового количества)
    const dailyLimit = Math.ceil(rooms * 0.015);
    const monthlyLimit = Math.ceil(dailyLimit * 0.85 * 30);
    
    // Тариф на помещение (среднемесячный)
    const avgMonthsInPeriod = totalDays / 30.4375; // среднее количество дней в месяце
    const totalAmount = periodLicenseTotal + serviceFeeTotal;
    const tariffPerRoom = (totalAmount * (1 - discount)) / rooms / avgMonthsInPeriod;
    
    // Показать/скрыть заголовок для типа расчета
    const resultTitle = document.getElementById('resultTitle');
    if (calculationType === 'increase') {
        resultTitle.textContent = `Доплата за увеличение с ${currentRooms} до ${rooms} помещений`;
        resultTitle.style.display = 'block';
    } else {
        resultTitle.style.display = 'none';
    }
    
    // Отображение результатов
    document.getElementById('licenseFee').textContent = formatCurrency(displayLicense);
    document.getElementById('serviceFee').textContent = formatCurrency(displayService);
    document.getElementById('totalNoDiscount').textContent = formatCurrency(displayTotal);
    document.getElementById('totalWithDiscount').textContent = formatCurrency(displayTotalWithDiscount);
    document.getElementById('dailyLimit').textContent = `${dailyLimit} звонков`;
    document.getElementById('monthlyLimit').textContent = `${monthlyLimit} звонков`;
    document.getElementById('tariffPerRoom').textContent = formatCurrency(tariffPerRoom);
    
    // Формирование детализации расчета
    let detailsHTML = generateCalculationDetails(
        calculationType, objectType, currentRooms, additionalRooms, rooms,
        licenseDataTotal, licenseDataCurrent, totalDays, serviceFeeMonthlyTotal, 
        serviceFeeMonthiyCurrent, serviceFeeTotal, serviceFeeCurrent,
        periodLicenseDataTotal, periodLicenseDataCurrent, periodLicenseTotal, 
        periodLicenseCurrent, displayLicense, displayService, displayTotal,
        discount, displayTotalWithDiscount, avgMonthsInPeriod, tariffPerRoom,
        dailyLimit, monthlyLimit, tariffPrice, startDate, endDate
    );
    
    // Добавляем детализацию в HTML
    const existingDetails = document.getElementById('calculationDetails');
    if (existingDetails) {
        existingDetails.innerHTML = detailsHTML;
    } else {
        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'calculationDetails';
        detailsDiv.innerHTML = detailsHTML;
        document.getElementById('old-cc-results').appendChild(detailsDiv);
    }
    
    // Формирование итогового текста
    const periodText = formatPeriod(startDate, endDate);
    let summaryText;
    
    if (calculationType === 'increase') {
        summaryText = `ТИП: ${objectType}
Текущее количество помещений: ${currentRooms}
Добавляемые помещения: ${additionalRooms}
Итоговое количество: ${rooms}
Скидка: ${(discount * 100).toFixed(0)}%
Период: ${formatDateRu(startDate)} - ${formatDateRu(endDate)} (${periodText})
Доплата: ${formatCurrency(displayTotalWithDiscount)}`;
    } else {
        summaryText = `ТИП: ${objectType}
Помещений: ${rooms}
Скидка: ${(discount * 100).toFixed(0)}%
Период: ${formatDateRu(startDate)} - ${formatDateRu(endDate)} (${periodText})
Услуга: ${formatCurrency(displayTotalWithDiscount)}`;
    }
    
    document.getElementById('summaryTextOldCC').textContent = summaryText;
    document.getElementById('old-cc-results').style.display = 'block';
}

// Функция копирования
function handleCopy() {
    const summaryText = document.getElementById('summaryTextOldCC').textContent;
    navigator.clipboard.writeText(summaryText).then(() => {
        this.textContent = '✓ Скопировано!';
        this.classList.add('copied');
        
        setTimeout(() => {
            this.textContent = '📋 Копировать';
            this.classList.remove('copied');
        }, 2000);
    });
}

// Расчет лицензионного платежа для МКД
function calculateMKDLicense(rooms) {
    let baseFee;
    let formula = '';
    
    if (rooms <= 300) {
        baseFee = 10000;
        formula = `10,000`;
    } else if (rooms <= 1000) {
        baseFee = 10000 + (rooms - 300) * 22;
        formula = `10,000 + (${rooms} - 300) × 22 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 2000) {
        baseFee = 25400 + (rooms - 1000) * 20;
        formula = `25,400 + (${rooms} - 1,000) × 20 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 5000) {
        baseFee = 45400 + (rooms - 2000) * 18;
        formula = `45,400 + (${rooms} - 2,000) × 18 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 10000) {
        baseFee = 99400 + (rooms - 5000) * 16;
        formula = `99,400 + (${rooms} - 5,000) × 16 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 15000) {
        baseFee = 179400 + (rooms - 10000) * 14;
        formula = `179,400 + (${rooms} - 10,000) × 14 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 20000) {
        baseFee = 249400 + (rooms - 15000) * 12;
        formula = `249,400 + (${rooms} - 15,000) × 12 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 50000) {
        baseFee = 309400 + (rooms - 20000) * 10;
        formula = `309,400 + (${rooms} - 20,000) × 10 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 100000) {
        baseFee = 609400 + (rooms - 50000) * 8;
        formula = `609,400 + (${rooms} - 50,000) × 8 = ${baseFee.toLocaleString('ru-RU')}`;
    } else {
        baseFee = 1009400 + (rooms - 100000) * 6;
        formula = `1,009,400 + (${rooms} - 100,000) × 6 = ${baseFee.toLocaleString('ru-RU')}`;
    }
    
    return {
        fee: baseFee * 1.2,
        formula: formula,
        baseFee: baseFee
    };
}

// Расчет лицензионного платежа для КП
function calculateKPLicense(rooms) {
    let baseFee;
    let formula = '';
    
    if (rooms <= 50) {
        baseFee = 15000;
        formula = `15,000`;
    } else if (rooms <= 100) {
        baseFee = 15000 + (rooms - 50) * 53;
        formula = `15,000 + (${rooms} - 50) × 53 = ${baseFee.toLocaleString('ru-RU')}`;
    } else if (rooms <= 500) {
        baseFee = 17650 + (rooms - 100) * 43;
        formula = `17,650 + (${rooms} - 100) × 43 = ${baseFee.toLocaleString('ru-RU')}`;
    } else {
        baseFee = 34850 + (rooms - 500) * 33;
        formula = `34,850 + (${rooms} - 500) × 33 = ${baseFee.toLocaleString('ru-RU')}`;
    }
    
    return {
        fee: baseFee * 1.2,
        formula: formula,
        baseFee: baseFee
    };
}

// Расчет количества дней в месяце
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Расчет стоимости с учетом периода через дневную ставку
function calculatePeriodCost(monthlyRate, startDate, endDate) {
    let totalCost = 0;
    let details = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Проходим по каждому месяцу в периоде
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        
        // Определяем начало и конец периода в текущем месяце
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month, daysInMonth);
        
        const periodStart = currentDate > monthStart ? currentDate : monthStart;
        const periodEnd = end < monthEnd ? end : monthEnd;
        
        // Считаем дни использования - ПРАВИЛЬНАЯ ФОРМУЛА
        const startDay = periodStart.getDate();
        const endDay = periodEnd.getDate();
        let daysUsed;
        
        // Если в пределах одного месяца
        if (periodStart.getMonth() === periodEnd.getMonth() && periodStart.getFullYear() === periodEnd.getFullYear()) {
            daysUsed = endDay - startDay + 1;
        } else {
            // Если переходим на следующий месяц
            daysUsed = daysInMonth - startDay + 1;
        }
        
        // Рассчитываем дневную ставку и стоимость
        const dailyRate = monthlyRate / daysInMonth;
        const monthCost = dailyRate * daysUsed;
        
        totalCost += monthCost;
        
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        
        details.push({
            month: `${monthNames[month]} ${year}`,
            days: daysInMonth,
            usedDays: daysUsed,
            cost: monthCost,
            dailyRate: dailyRate,
            monthlyRate: monthlyRate
        });
        
        // Переходим к следующему месяцу
        currentDate = new Date(year, month + 1, 1);
    }
    
    return { total: totalCost, details: details };
}

// Расчет общего количества дней в периоде
function calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Правильный расчет включая оба дня
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Форматирование периода для отображения
function formatPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    
    // Корректировка дней
    if (days < 0) {
        months--;
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    // Корректировка месяцев
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Добавляем 1 день, так как период включительный
    days++;
    
    // Если дней больше или равно количеству дней в месяце, корректируем
    const daysInEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    if (days >= daysInEndMonth) {
        months++;
        days = 0;
    }
    
    // Формируем текст
    let periodText = '';
    if (years > 0) {
        periodText += `${years} г. `;
    }
    if (months > 0) {
        periodText += `${months} мес. `;
    }
    if (days > 0) {
        periodText += `${days} дн.`;
    }
    
    return periodText.trim();
}

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Форматирование даты по-русски
function formatDateRu(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Генерация HTML детализации расчета
function generateCalculationDetails(
    calculationType, objectType, currentRooms, additionalRooms, rooms,
    licenseDataTotal, licenseDataCurrent, totalDays, serviceFeeMonthlyTotal, 
    serviceFeeMonthiyCurrent, serviceFeeTotal, serviceFeeCurrent,
    periodLicenseDataTotal, periodLicenseDataCurrent, periodLicenseTotal, 
    periodLicenseCurrent, displayLicense, displayService, displayTotal,
    discount, displayTotalWithDiscount, avgMonthsInPeriod, tariffPerRoom,
    dailyLimit, monthlyLimit, tariffPrice, startDate, endDate
) {
    let detailsHTML = '<div class="calculation-details">';
    detailsHTML += '<h3>Детализация расчета:</h3>';
    
    if (calculationType === 'increase') {
        // Детализация для увеличения помещений
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>1. Расчет для текущего количества помещений:</h4>';
        detailsHTML += `<p>Тип объекта: <strong>${objectType}</strong></p>`;
        detailsHTML += `<p>Текущее количество помещений: <strong>${currentRooms}</strong></p>`;
        detailsHTML += `<p>Период: ${totalDays} дней</p>`;
        
        // Детализация лицензионного платежа
        detailsHTML += '<p><strong>Лицензионный платеж:</strong></p>';
        detailsHTML += '<ul>';
        periodLicenseDataCurrent.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p>Итого лицензия: ${formatCurrency(periodLicenseCurrent)}</p>`;
        
        // Платеж за услуги
        const serviceCurrent = calculatePeriodCost(serviceFeeMonthiyCurrent, startDate, endDate);
        detailsHTML += '<p><strong>Платеж за услуги:</strong></p>';
        detailsHTML += '<ul>';
        serviceCurrent.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p>Итого услуги: ${formatCurrency(serviceFeeCurrent)}</p>`;
        
        detailsHTML += `<p><strong>Итого для ${currentRooms} помещений: ${formatCurrency(periodLicenseCurrent + serviceFeeCurrent)}</strong></p>`;
        detailsHTML += '</div>';
        
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>2. Расчет для нового количества помещений:</h4>';
        detailsHTML += `<p>Новое количество помещений: <strong>${rooms}</strong> (${currentRooms} + ${additionalRooms})</p>`;
        detailsHTML += `<p>Период: ${totalDays} дней</p>`;
        
        // Детализация лицензионного платежа
        detailsHTML += '<p><strong>Лицензионный платеж:</strong></p>';
        detailsHTML += '<ul>';
        periodLicenseDataTotal.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p>Итого лицензия: ${formatCurrency(periodLicenseTotal)}</p>`;
        
        // Платеж за услуги
        const serviceTotal = calculatePeriodCost(serviceFeeMonthlyTotal, startDate, endDate);
        detailsHTML += '<p><strong>Платеж за услуги:</strong></p>';
        detailsHTML += '<ul>';
        serviceTotal.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p>Итого услуги: ${formatCurrency(serviceFeeTotal)}</p>`;
        
        detailsHTML += `<p><strong>Итого для ${rooms} помещений: ${formatCurrency(periodLicenseTotal + serviceFeeTotal)}</strong></p>`;
        detailsHTML += '</div>';
        
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>3. Необходимая доплата:</h4>';
        detailsHTML += `<p>Доплата за лицензию: ${formatCurrency(periodLicenseTotal)} - ${formatCurrency(periodLicenseCurrent)} = <strong>${formatCurrency(displayLicense)}</strong></p>`;
        detailsHTML += `<p>Доплата за услуги: ${formatCurrency(serviceFeeTotal)} - ${formatCurrency(serviceFeeCurrent)} = <strong>${formatCurrency(displayService)}</strong></p>`;
        detailsHTML += `<p><strong>Итого доплата: ${formatCurrency(displayTotal)}</strong></p>`;
        if (discount > 0) {
            detailsHTML += `<p>С учетом скидки ${(discount * 100).toFixed(0)}%: <strong>${formatCurrency(displayTotalWithDiscount)}</strong></p>`;
        }
        detailsHTML += '</div>';
    } else {
        // Обычная детализация для новой сделки
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>1. Лицензионный платеж:</h4>';
        detailsHTML += `<p>Тип объекта: <strong>${objectType}</strong></p>`;
        detailsHTML += `<p>Количество помещений: <strong>${rooms}</strong></p>`;
        detailsHTML += `<p>Формула: ${licenseDataTotal.formula}</p>`;
        detailsHTML += `<p>Базовая ставка: ${licenseDataTotal.baseFee.toLocaleString('ru-RU')} руб.</p>`;
        detailsHTML += `<p>С НДС (×1.2): <strong>${licenseDataTotal.fee.toLocaleString('ru-RU')} руб./мес.</strong></p>`;
        
        // Детализация по дням
        detailsHTML += '<p class="month-details">Расчет по периоду:</p>';
        detailsHTML += '<ul>';
        periodLicenseDataTotal.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × (${formatCurrency(detail.monthlyRate)} ÷ ${detail.days}) = ${detail.usedDays} × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p><strong>Итого лицензионный платеж за период: ${formatCurrency(periodLicenseTotal)}</strong></p>`;
        detailsHTML += '</div>';
        
        // Платеж за услуги
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>2. Платеж за услуги:</h4>';
        detailsHTML += `<p>Цена тарифа: ${tariffPrice} руб. за помещение в месяц</p>`;
        detailsHTML += `<p>Месячный платеж: ${tariffPrice} × ${rooms} = ${serviceFeeMonthlyTotal.toLocaleString('ru-RU')} руб./мес.</p>`;
        
        const serviceDetails = calculatePeriodCost(serviceFeeMonthlyTotal, startDate, endDate);
        detailsHTML += '<p class="month-details">Расчет по периоду:</p>';
        detailsHTML += '<ul>';
        serviceDetails.details.forEach(detail => {
            detailsHTML += `<li>${detail.month}: ${detail.usedDays} дн. × (${formatCurrency(detail.monthlyRate)} ÷ ${detail.days}) = ${detail.usedDays} × ${formatCurrency(detail.dailyRate)} = ${formatCurrency(detail.cost)}</li>`;
        });
        detailsHTML += '</ul>';
        detailsHTML += `<p><strong>Итого платеж за услуги: ${formatCurrency(serviceFeeTotal)}</strong></p>`;
        detailsHTML += '</div>';
    }
    
    // Итоговый расчет
    detailsHTML += '<div class="detail-section">';
    detailsHTML += `<h4>${calculationType === 'increase' ? '4' : '3'}. Итоговый расчет:</h4>`;
    detailsHTML += `<p>Лицензионный платеж: ${formatCurrency(displayLicense)}</p>`;
    detailsHTML += `<p>Платеж за услуги: ${formatCurrency(displayService)}</p>`;
    detailsHTML += `<p><strong>Итого без скидки: ${formatCurrency(displayTotal)}</strong></p>`;
    
    if (discount > 0) {
        detailsHTML += `<p>Применена скидка: ${(discount * 100).toFixed(0)}%</p>`;
        detailsHTML += `<p>Сумма скидки: ${formatCurrency(displayTotal * discount)}</p>`;
        detailsHTML += `<p><strong>Итого со скидкой: ${formatCurrency(displayTotalWithDiscount)}</strong></p>`;
    }
    detailsHTML += '</div>';
    
    // Расчет тарифа (только для новой сделки)
    if (calculationType === 'new') {
        detailsHTML += '<div class="detail-section">';
        detailsHTML += '<h4>4. Тариф на 1 помещение:</h4>';
        detailsHTML += `<p>Формула: Итого со скидкой ÷ Помещения ÷ Средн. месяцы</p>`;
        detailsHTML += `<p>${formatCurrency(displayTotalWithDiscount)} ÷ ${rooms} ÷ ${avgMonthsInPeriod.toFixed(3)} = <strong>${formatCurrency(tariffPerRoom)}</strong></p>`;
        detailsHTML += '</div>';
    }
    
    // Лимиты
    detailsHTML += '<div class="detail-section">';
    detailsHTML += `<h4>${calculationType === 'increase' ? '5' : '5'}. Лимиты звонков (для ${rooms} помещений):</h4>`;
    detailsHTML += `<p>Дневной лимит: ${rooms} × 0.015 = ${rooms * 0.015} ≈ <strong>${dailyLimit} звонков</strong></p>`;
    detailsHTML += `<p>Месячный лимит: ${dailyLimit} × 0.85 × 30 = ${dailyLimit * 0.85 * 30} ≈ <strong>${monthlyLimit} звонков</strong></p>`;
    detailsHTML += '</div>';
    
    detailsHTML += '</div>';
    
    return detailsHTML;
}