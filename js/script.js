// Глобальные переменные
let productCounter = 0;

function setupModalListeners() {
    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function initializeProductCategories() {
    const categoriesContainer = document.getElementById('productsCategories');
    categoriesContainer.innerHTML = '';
    
    if (!window.currentTariff || !window.currentTariff.data) {
        categoriesContainer.innerHTML = '<p>Загрузка продуктов...</p>';
        return;
    }
    
    const categories = window.currentTariff.data.categories || {};
    
    // Сортируем категории по order
    const sortedCategories = Object.entries(categories).sort((a, b) => {
        const orderA = a[1].order !== undefined ? a[1].order : 999;
        const orderB = b[1].order !== undefined ? b[1].order : 999;
        return orderA - orderB;
    });
    
    // Создаем категории
    for (const [categoryName, categoryData] of sortedCategories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'product-category';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = categoryName;
        
        const categoryProducts = document.createElement('div');
        categoryProducts.className = 'category-products';
        
        const products = categoryData.products || {};
        
        // Сортируем продукты по order
        const sortedProducts = Object.entries(products).sort((a, b) => {
            const orderA = (a[1] && typeof a[1] === 'object' && !Array.isArray(a[1])) ? (a[1].order !== undefined ? a[1].order : 999) : 999;
            const orderB = (b[1] && typeof b[1] === 'object' && !Array.isArray(b[1])) ? (b[1].order !== undefined ? b[1].order : 999) : 999;
            return orderA - orderB;
        });
        
        for (const [productName, productData] of sortedProducts) {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'product-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `product-${productName.replace(/\s+/g, '-')}`;
            checkbox.value = productName;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = productName;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            categoryProducts.appendChild(checkboxItem);
        }
        
        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(categoryProducts);
        categoriesContainer.appendChild(categoryDiv);
    }
}

// Обновляем функцию обновления категорий
function updateProductCategories() {
    initializeProductCategories();
}

function addSelectedProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox-item input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        addProductItem(checkbox.value);
        checkbox.checked = false;
    });
}

function setDefaultDates() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    document.getElementById('dateFrom').value = today.toISOString().split('T')[0];
    document.getElementById('dateTo').value = nextMonth.toISOString().split('T')[0];
}

function toggleGlobalDates() {
    const globalDates = document.getElementById('globalDates').checked;
    const productDates = document.querySelectorAll('.product-dates');
    const globalDateInputs = document.querySelectorAll('#dateFrom, #dateTo');
    
    // Управляем видимостью полей дат у продуктов
    productDates.forEach(dateGroup => {
        dateGroup.style.display = globalDates ? 'none' : 'grid';
        
        if (!globalDates) {
            // Устанавливаем даты по умолчанию
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            
            const dateFrom = dateGroup.querySelector('.product-date-from');
            const dateTo = dateGroup.querySelector('.product-date-to');
            
            if (!dateFrom.value) dateFrom.value = today.toISOString().split('T')[0];
            if (!dateTo.value) dateTo.value = nextMonth.toISOString().split('T')[0];
        }
    });
    
    // Управляем доступностью глобальных полей дат
    globalDateInputs.forEach(input => {
        input.disabled = !globalDates;
    });
}

function toggleGlobalDiscounts() {
    const globalDiscounts = document.getElementById('globalDiscounts').checked;
    const productDiscounts = document.querySelectorAll('.product-discount');
    const globalDiscountInput = document.getElementById('globalDiscount');
    
    // Управляем видимостью полей скидок у продуктов
    productDiscounts.forEach(discountGroup => {
        discountGroup.style.display = globalDiscounts ? 'none' : 'block';
    });
    
    // Управляем доступностью глобального поля скидки
    globalDiscountInput.disabled = !globalDiscounts;
}

function toggleGlobalUnits() {
    const globalUnits = document.getElementById('globalUnitsEnabled').checked;
    const productUnitsInputs = document.querySelectorAll('.units-input');
    const globalUnitsInput = document.getElementById('globalUnits');
    
    // Управляем видимостью полей количества помещений у продуктов
    productUnitsInputs.forEach(input => {
        input.style.display = globalUnits ? 'none' : 'block';
    });
    
    // Управляем доступностью глобального поля количества помещений
    globalUnitsInput.disabled = !globalUnits;
}

function toggleCalculatorType() {
    const calculatorType = document.getElementById('calculatorType').value;
    const increaseFields = document.querySelectorAll('.increase-fields');
    const newDealFields = document.querySelectorAll('.new-deal-fields');
    const globalUnitsCheckbox = document.getElementById('globalUnitsEnabled').parentElement.parentElement;
    
    if (calculatorType === 'new') {
        // Скрываем поля для увеличения
        increaseFields.forEach(field => field.style.display = 'none');
        // Показываем поля для новой сделки
        newDealFields.forEach(field => field.style.display = 'block');
        // Скрываем чекбокс глобальных помещений для новой сделки
        globalUnitsCheckbox.style.display = 'none';
        // Снимаем required с полей увеличения
        document.getElementById('currentUnits').removeAttribute('required');
        document.getElementById('globalUnits').removeAttribute('required');
        // Добавляем required к полю новой сделки
        document.getElementById('totalUnits').setAttribute('required', 'required');
        
        // Скрываем поля количества помещений у продуктов
        document.querySelectorAll('.units-input').forEach(input => {
            input.style.display = 'none';
            input.removeAttribute('required');
        });
    } else {
        // Показываем поля для увеличения
        increaseFields.forEach(field => field.style.display = 'block');
        // Скрываем поля для новой сделки
        newDealFields.forEach(field => field.style.display = 'none');
        // Показываем чекбокс глобальных помещений
        globalUnitsCheckbox.style.display = 'block';
        // Добавляем required к полям увеличения
        document.getElementById('currentUnits').setAttribute('required', 'required');
        document.getElementById('globalUnits').setAttribute('required', 'required');
        // Снимаем required с поля новой сделки
        document.getElementById('totalUnits').removeAttribute('required');
        
        // Восстанавливаем видимость полей количества помещений у продуктов
        toggleGlobalUnits();
    }
}

function addProductItem(productName = null) {
    productCounter++;
    const productsList = document.getElementById('productsList');
    
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.setAttribute('data-id', productCounter);
    productItem.setAttribute('data-product-name', productName);
    
    const globalDates = document.getElementById('globalDates').checked;
    const globalDiscounts = document.getElementById('globalDiscounts').checked;
    const globalUnits = document.getElementById('globalUnitsEnabled').checked;
    const calculatorType = document.getElementById('calculatorType').value;
    
    const productNameDisplay = productName ? `<h4 style="margin: 0 0 10px 0; color: #2d3748;">${productName}</h4>` : '';
    
    productItem.innerHTML = `
        ${productNameDisplay}
        <input type="number" class="units-input" placeholder="Количество помещений" min="1" required style="display: ${globalUnits || calculatorType === 'new' ? 'none' : 'block'};">
        <button type="button" class="remove-product" onclick="removeProduct(${productCounter})">Удалить</button>
        
        <div class="product-dates" style="display: ${globalDates ? 'none' : 'grid'}">
            <div>
                <label>Дата ОТ:</label>
                <input type="date" class="product-date-from date-input-manual">
            </div>
            <div>
                <label>Дата ДО:</label>
                <input type="date" class="product-date-to date-input-manual">
            </div>
        </div>
        
        <div class="product-discount" style="display: ${globalDiscounts ? 'none' : 'block'}">
            <label>Скидка (%):</label>
            <input type="number" class="product-discount-input" min="0" max="100" step="0.01" placeholder="Введите скидку">
        </div>
    `;
    
    productsList.appendChild(productItem);
    
    // Устанавливаем даты по умолчанию для нового продукта
    if (!globalDates) {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        productItem.querySelector('.product-date-from').value = today.toISOString().split('T')[0];
        productItem.querySelector('.product-date-to').value = nextMonth.toISOString().split('T')[0];
    }
}

function removeProduct(id) {
    const productItem = document.querySelector(`[data-id="${id}"]`);
    if (productItem) {
        productItem.remove();
    }
}

function calculateTieredCost(typeData, currentUnits, additionalUnits) {
    let totalCost = 0;
    let remainingUnits = additionalUnits;
    let currentPosition = currentUnits;
    let details = []; // Для детализации
    
    // Проходим по всем диапазонам и заполняем их последовательно
    for (const tier of typeData) {
        if (remainingUnits <= 0) break;
        
        // Определяем сколько помещений можем разместить в текущем диапазоне
        const tierStart = Math.max(tier.min, currentPosition);
        const tierEnd = tier.max;
        
        // Если текущая позиция уже превышает максимум диапазона, переходим к следующему
        if (currentPosition > tierEnd) {
            continue;
        }
        
        // Определяем сколько помещений поместится в этот диапазон
        const availableInTier = tierEnd - tierStart;
        const unitsInThisTier = Math.min(remainingUnits, availableInTier);
        
        if (unitsInThisTier > 0 && tier.unitPrice !== null) {
            const costInTier = unitsInThisTier * tier.unitPrice;
            totalCost += costInTier;
            remainingUnits -= unitsInThisTier;
            currentPosition += unitsInThisTier;
            
            details.push({
                range: tier.range,
                units: unitsInThisTier,
                price: tier.unitPrice,
                cost: costInTier
            });
        }
    }
    
    // Если остались нераспределенные помещения, используем последний доступный тариф
    if (remainingUnits > 0) {
        const lastTier = typeData[typeData.length - 1];
        if (lastTier.unitPrice !== null) {
            const finalCost = remainingUnits * lastTier.unitPrice;
            totalCost += finalCost;
            
            details.push({
                range: `Сверх ${lastTier.range}`,
                units: remainingUnits,
                price: lastTier.unitPrice,
                cost: finalCost
            });
        }
    }
    
    return { totalCost, details };
}

function calculateNewDealCost(typeData, totalUnits) {
    let totalCost = 0;
    let remainingUnits = totalUnits;
    let details = [];
    let currentPosition = 0;
    
    for (const tier of typeData) {
        if (remainingUnits <= 0) break;
        
        // Для первого диапазона с базовой ценой
        if (tier.basePrice !== null && currentPosition === 0) {
            if (totalUnits <= tier.max) {
                // Все помещения попадают в первый диапазон
                totalCost = tier.basePrice;
                details.push({
                    range: tier.range,
                    units: totalUnits,
                    price: 'фиксированная цена',
                    cost: tier.basePrice
                });
                remainingUnits = 0;
                break;
            } else {
                // Используем базовую цену для первого диапазона
                totalCost += tier.basePrice;
                details.push({
                    range: tier.range,
                    units: tier.max,
                    price: 'фиксированная цена',
                    cost: tier.basePrice
                });
                
                // Переходим к следующему диапазону
                const nextTier = typeData.find(t => t.min === tier.max);
                if (nextTier && nextTier.unitPrice !== null) {
                    const unitsInNext = Math.min(remainingUnits - tier.max, nextTier.max - nextTier.min);
                    const costInNext = unitsInNext * nextTier.unitPrice;
                    totalCost += costInNext;
                    details.push({
                        range: nextTier.range,
                        units: unitsInNext,
                        price: nextTier.unitPrice,
                        cost: costInNext
                    });
                    remainingUnits -= (tier.max + unitsInNext);
                    currentPosition = nextTier.min + unitsInNext;
                }
            }
        } else if (tier.unitPrice !== null && currentPosition >= tier.min && currentPosition < tier.max) {
            // Для остальных диапазонов с ценой за единицу
            const unitsInThisTier = Math.min(remainingUnits, tier.max - currentPosition);
            if (unitsInThisTier > 0) {
                const costInTier = unitsInThisTier * tier.unitPrice;
                totalCost += costInTier;
                details.push({
                    range: tier.range,
                    units: unitsInThisTier,
                    price: tier.unitPrice,
                    cost: costInTier
                });
                remainingUnits -= unitsInThisTier;
                currentPosition += unitsInThisTier;
            }
        }
    }
    
    // Если остались нераспределенные помещения
    if (remainingUnits > 0) {
        const lastTier = typeData[typeData.length - 1];
        if (lastTier.unitPrice !== null) {
            const finalCost = remainingUnits * lastTier.unitPrice;
            totalCost += finalCost;
            details.push({
                range: `Сверх ${lastTier.range}`,
                units: remainingUnits,
                price: lastTier.unitPrice,
                cost: finalCost
            });
        }
    }
    
    return { totalCost, details };
}

function calculateProductCost(productName, propertyType, currentUnits, additionalUnits, dateFrom, dateTo, isNewDeal = false, totalUnits = null) {
    if (!window.currentTariff || !window.currentTariff.data) {
        console.error('Тариф не загружен');
        return null;
    }
    
    // Ищем продукт в категориях
    let productData = null;
    const categories = window.currentTariff.data.categories || {};
    
    for (const categoryData of Object.values(categories)) {
        if (categoryData.products && categoryData.products[productName]) {
            productData = categoryData.products[productName];
            break;
        }
    }
    
    if (!productData) {
        console.error(`Продукт "${productName}" не найден в тарифе`);
        return null;
    }
    
    // Сначала проверяем наличие фиксированной цены
    let typeData = null;
    let isFixedPrice = false;
    
    // Если есть фиксированная цена, используем её независимо от типа недвижимости
    if (productData['фиксированная цена']) {
        typeData = productData['фиксированная цена'];
        isFixedPrice = true;
    } else {
        // Иначе ищем данные для конкретного типа недвижимости
        typeData = productData[propertyType];
    }
    
    if (!typeData) {
        console.error(`Тип "${propertyType}" не найден для продукта "${productName}"`);
        return null;
    }
    
    let monthlyCost, details;
    
    // Проверяем, является ли это фиксированной ценой
    if (isFixedPrice || (typeData.length === 1 && 
                        typeData[0].range === 'фиксированный тариф' && 
                        typeData[0].basePrice !== null && 
                        typeData[0].unitPrice === null)) {
        // Для фиксированной цены используем базовую цену
        monthlyCost = typeData[0].basePrice;
        details = [{
            range: 'Фиксированная цена',
            units: isNewDeal ? totalUnits : additionalUnits,
            price: 'фиксированная цена',
            cost: typeData[0].basePrice
        }];
    } else if (isNewDeal) {
        // Расчет для новой сделки
        const result = calculateNewDealCost(typeData, totalUnits);
        monthlyCost = result.totalCost;
        details = result.details;
    } else {
        // Расчет для увеличения помещений
        const result = calculateTieredCost(typeData, currentUnits, additionalUnits);
        monthlyCost = result.totalCost;
        details = result.details;
    }
    
    if (monthlyCost === null || monthlyCost === 0) {
        console.error(`Не удалось рассчитать стоимость для продукта "${productName}"`);
        return null;
    }
    
    // Рассчитываем стоимость с учетом периода
    const periodCalculation = calculatePeriodCostDetailed(monthlyCost, dateFrom, dateTo);
    
    return {
        totalCost: periodCalculation.totalCost,
        monthlyCost: monthlyCost,
        tierDetails: details,
        periodDetails: periodCalculation.details,
        dateFrom: dateFrom,
        dateTo: dateTo,
        isNewDeal: isNewDeal,
        totalUnits: totalUnits
    };
}

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

function calculatePeriodCost(monthlyCost, dateFrom, dateTo) {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    let totalCost = 0;
    
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
        const monthStart = new Date(currentDate);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        let periodEnd = new Date(Math.min(monthEnd.getTime(), endDate.getTime()));
        
        // Если это первый месяц и начинаем не с 1 числа
        if (currentDate.getTime() === startDate.getTime() && startDate.getDate() !== 1) {
            const daysInMonth = monthEnd.getDate();
            const remainingDays = daysInMonth - startDate.getDate() + 1;
            
            if (periodEnd.getMonth() === startDate.getMonth() && periodEnd.getFullYear() === startDate.getFullYear()) {
                // Период в рамках одного месяца
                const periodDays = Math.ceil((periodEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                totalCost += (monthlyCost / daysInMonth) * periodDays;
            } else {
                // Первый неполный месяц
                totalCost += (monthlyCost / daysInMonth) * remainingDays;
            }
        } 
        // Если это последний месяц и заканчиваем не в последний день
        else if (periodEnd.getTime() === endDate.getTime() && 
                 endDate.getDate() !== monthEnd.getDate() && 
                 endDate.getMonth() === monthEnd.getMonth()) {
            const daysInMonth = monthEnd.getDate();
            const usedDays = endDate.getDate();
            totalCost += (monthlyCost / daysInMonth) * usedDays;
        }
        // Полный месяц
        else {
            totalCost += monthlyCost;
        }
        
        // Переходим к следующему месяцу
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        
        // Защита от бесконечного цикла
        if (currentDate.getFullYear() > endDate.getFullYear() + 1) {
            break;
        }
    }
    
    return Math.round(totalCost * 100) / 100; // Округляем до копеек
}

function calculateCosts() {
    const calculatorType = document.getElementById('calculatorType').value;
    const propertyType = document.getElementById('propertyType').value;
    const globalDates = document.getElementById('globalDates').checked;
    const globalDiscounts = document.getElementById('globalDiscounts').checked;
    const globalUnitsEnabled = document.getElementById('globalUnitsEnabled').checked;
    
    // Глобальные значения дат и скидок
    const globalDateFrom = globalDates ? new Date(document.getElementById('dateFrom').value) : null;
    const globalDateTo = globalDates ? new Date(document.getElementById('dateTo').value) : null;
    const globalDiscount = globalDiscounts ? parseFloat(document.getElementById('globalDiscount').value) || 0 : 0;
    
    let currentUnits, globalUnits, totalUnits;
    
    if (calculatorType === 'new') {
        // Новая сделка
        totalUnits = parseInt(document.getElementById('totalUnits').value);
        
        if (!propertyType || !totalUnits) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
    } else {
        // Увеличение помещений
        currentUnits = parseInt(document.getElementById('currentUnits').value);
        globalUnits = globalUnitsEnabled ? parseInt(document.getElementById('globalUnits').value) : null;
        
        if (!propertyType || isNaN(currentUnits)) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        if (globalUnitsEnabled && !globalUnits) {
            alert('Пожалуйста, укажите количество помещений для добавления');
            return;
        }
    }
    
    if (globalDates && (!globalDateFrom || !globalDateTo || globalDateFrom >= globalDateTo)) {
        alert('Проверьте корректность глобальных дат');
        return;
    }
    
    const productItems = document.querySelectorAll('.product-item');
    const results = [];
    let totalCost = 0;
    
    productItems.forEach(item => {
        const productName = item.getAttribute('data-product-name');
        
        if (!productName) {
            return;
        }
        
        let units;
        if (calculatorType === 'new') {
            // Для новой сделки всегда используем totalUnits
            units = totalUnits;
        } else {
            // Для увеличения помещений
            if (globalUnitsEnabled) {
                units = globalUnits;
            } else {
                units = parseInt(item.querySelector('.units-input').value);
                if (!units) {
                    alert(`Пожалуйста, укажите количество помещений для продукта "${productName}"`);
                    return;
                }
            }
        }
        
        // Определяем даты для продукта
        let dateFrom, dateTo;
        if (globalDates) {
            dateFrom = globalDateFrom;
            dateTo = globalDateTo;
        } else {
            dateFrom = new Date(item.querySelector('.product-date-from').value);
            dateTo = new Date(item.querySelector('.product-date-to').value);
            
            if (!dateFrom || !dateTo || dateFrom >= dateTo) {
                alert(`Проверьте корректность дат для продукта "${productName}"`);
                return;
            }
        }
        
        // Определяем скидку для продукта
        let discount;
        if (globalDiscounts) {
            discount = globalDiscount;
        } else {
            discount = parseFloat(item.querySelector('.product-discount-input').value) || 0;
        }
        
        let costResult;
        if (calculatorType === 'new') {
            costResult = calculateProductCost(productName, propertyType, 0, 0, dateFrom, dateTo, true, units);
        } else {
            costResult = calculateProductCost(productName, propertyType, currentUnits, units, dateFrom, dateTo, false, null);
        }
        
        if (costResult !== null) {
            // Применяем скидку
            const discountAmount = (costResult.totalCost * discount) / 100;
            const finalCost = costResult.totalCost - discountAmount;
            
            results.push({
                productName,
                additionalUnits: calculatorType === 'new' ? units : units,
                cost: finalCost,
                originalCost: costResult.totalCost,
                discount: discount,
                discountAmount: discountAmount,
                dateFrom: dateFrom.toLocaleDateString('ru-RU'),
                dateTo: dateTo.toLocaleDateString('ru-RU'),
                // Детализация расчета
                calculationDetails: {
                    currentUnits: calculatorType === 'new' ? 0 : currentUnits,
                    additionalUnits: units,
                    monthlyCost: costResult.monthlyCost,
                    tierDetails: costResult.tierDetails,
                    periodDetails: costResult.periodDetails,
                    propertyType: propertyType,
                    isNewDeal: calculatorType === 'new',
                    totalUnits: calculatorType === 'new' ? units : currentUnits + units
                }
            });
            totalCost += finalCost;
        }
    });
    
    if (results.length === 0) {
        alert('Не удалось рассчитать стоимость. Проверьте введенные данные.');
        return;
    }
    
    displayResults(results, totalCost, globalDateFrom || results[0].dateFrom, globalDateTo || results[0].dateTo);
}

function displayResults(results, totalCost, dateFrom, dateTo) {
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const totalCostElement = document.getElementById('totalCost');
    const calculatorType = document.getElementById('calculatorType').value;
    
    resultsContent.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const discountInfo = result.discount > 0 ? 
            `<div><strong>Скидка:</strong> ${result.discount}% (-${result.discountAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.)</div>
             <div><strong>Стоимость без скидки:</strong> ${result.originalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</div>` : '';
        
        const unitsInfo = calculatorType === 'new' ? 
            `<div><strong>Количество помещений:</strong> ${result.additionalUnits}</div>` :
            `<div><strong>Количество добавляемых помещений:</strong> ${result.additionalUnits}</div>`;
        
        resultItem.innerHTML = `
            <h4>${result.productName}</h4>
            <div class="result-details">
                <div><strong>Период:</strong> ${result.dateFrom} - ${result.dateTo}</div>
                ${unitsInfo}
                ${discountInfo}
            </div>
            <div class="result-cost">Итоговая стоимость: ${result.cost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</div>
            <button class="btn-secondary show-details" onclick="showCalculationDetails(${index})" style="margin-top: 10px; width: auto;">
                Показать детализацию расчета
            </button>
            <div id="details-${index}" class="calculation-details" style="display: none; margin-top: 15px; padding: 15px; background: #f7fafc; border-radius: 8px;"></div>
        `;
        
        resultsContent.appendChild(resultItem);
    });
    
    // Сохраняем результаты в глобальную переменную для доступа к детализации
    window.calculationResults = results;
    
    // Рассчитываем общую скидку
    const totalOriginalCost = results.reduce((sum, result) => sum + result.originalCost, 0);
    const totalDiscountAmount = totalOriginalCost - totalCost;
    
    const totalDiscountInfo = totalDiscountAmount > 0 ? 
        `<div>Общая экономия: ${totalDiscountAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</div>
         <div>Стоимость без скидки: ${totalOriginalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</div>` : '';
    
    const displayDateFrom = typeof dateFrom === 'string' ? dateFrom : dateFrom.toLocaleDateString('ru-RU');
    const displayDateTo = typeof dateTo === 'string' ? dateTo : dateTo.toLocaleDateString('ru-RU');
    
    totalCostElement.innerHTML = `
        <div>Общая стоимость всех продуктов</div>
        <div>Период: ${displayDateFrom} - ${displayDateTo}</div>
        ${totalDiscountInfo}
        <div style="font-size: 24px; margin-top: 10px;">${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Генерируем итоговый текст для копирования
    generateSummaryText(results, totalCost, dateFrom, dateTo);
}

function generateSummaryText(results, totalCost, dateFrom, dateTo) {
    const calculatorType = document.getElementById('calculatorType').value;
    const propertyType = document.getElementById('propertyType').value;
    const globalDates = document.getElementById('globalDates').checked;
    const globalDiscounts = document.getElementById('globalDiscounts').checked;
    const globalUnitsEnabled = document.getElementById('globalUnitsEnabled').checked;
    
    // Получаем информацию о выбранном тарифе
    const tariffSelect = document.getElementById('tariffSelect');
    const selectedTariff = tariffSelect.options[tariffSelect.selectedIndex].text;
    
    let summaryText = '';
    
    // Добавляем информацию о тарифе
    summaryText += `Расчет по тарифу: ${selectedTariff}\n\n`;
    
    // Тип сделки
    summaryText += `Тип сделки: ${calculatorType === 'new' ? 'Новая сделка' : 'Увеличение помещений'}\n\n`;
    
    // Период
    summaryText += 'Период: ';
    if (globalDates) {
        const displayDateFrom = typeof dateFrom === 'string' ? dateFrom : dateFrom.toLocaleDateString('ru-RU');
        const displayDateTo = typeof dateTo === 'string' ? dateTo : dateTo.toLocaleDateString('ru-RU');
        
        // Рассчитываем количество месяцев и дней правильно
        const startDate = new Date(typeof dateFrom === 'string' ? dateFrom.split('.').reverse().join('-') : dateFrom);
        const endDate = new Date(typeof dateTo === 'string' ? dateTo.split('.').reverse().join('-') : dateTo);
        
        // Вычисляем полные месяцы
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months += endDate.getMonth() - startDate.getMonth();
        
        // Корректируем, если день конца меньше дня начала
        let days = endDate.getDate() - startDate.getDate();
        if (days < 0) {
            months--;
            // Получаем количество дней в предыдущем месяце
            const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days = prevMonth.getDate() - startDate.getDate() + endDate.getDate() + 1;
        } else {
            days++; // Включаем последний день
        }
        
        summaryText += `с ${displayDateFrom} по ${displayDateTo} на ${months} месяцев ${days} дней\n\n`;
    } else {
        summaryText += '\n';
        results.forEach(result => {
            const startDate = new Date(result.dateFrom.split('.').reverse().join('-'));
            const endDate = new Date(result.dateTo.split('.').reverse().join('-'));
            
            // Вычисляем полные месяцы
            let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
            months += endDate.getMonth() - startDate.getMonth();
            
            // Корректируем, если день конца меньше дня начала
            let days = endDate.getDate() - startDate.getDate();
            if (days < 0) {
                months--;
                // Получаем количество дней в предыдущем месяце
                const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                days = prevMonth.getDate() - startDate.getDate() + endDate.getDate() + 1;
            } else {
                days++; // Включаем последний день
            }
            
            summaryText += `${result.productName}: с ${result.dateFrom} по ${result.dateTo} на ${months} месяцев ${days} дней\n`;
        });
        summaryText += '\n';
    }
    
    // Тип недвижимости
    summaryText += `Тип: ${propertyType}\n\n`;
    
    // Продукты
    const productNames = results.map(result => result.productName).join(', ');
    summaryText += `Продукты: ${productNames}\n\n`;
    
    // Количество помещений
    if (calculatorType === 'new') {
        const totalUnits = parseInt(document.getElementById('totalUnits').value);
        summaryText += `Количество помещений (лицевых счетов): ${totalUnits}\n`;
    } else {
        const currentUnits = parseInt(document.getElementById('currentUnits').value);
        summaryText += `Текущее количество помещений у партнера: ${currentUnits}\n`;
        
        if (globalUnitsEnabled) {
            const globalUnits = parseInt(document.getElementById('globalUnits').value);
            summaryText += `Количество добавляемых помещений: ${globalUnits}\n`;
        } else {
            summaryText += `Количество добавляемых помещений:\n`;
            results.forEach(result => {
                summaryText += `  ${result.productName}: ${result.additionalUnits}\n`;
            });
        }
    }
    
    // Скидка
    const hasDiscount = results.some(result => result.discount > 0);
    if (hasDiscount) {
        if (globalDiscounts) {
            const globalDiscount = parseFloat(document.getElementById('globalDiscount').value) || 0;
            summaryText += `Скидка: да, ${globalDiscount}%\n`;
        } else {
            summaryText += `Скидка: да, индивидуально:\n`;
            results.forEach(result => {
                if (result.discount > 0) {
                    summaryText += `  ${result.productName}: ${result.discount}%\n`;
                }
            });
        }
        
        const totalOriginalCost = results.reduce((sum, result) => sum + result.originalCost, 0);
        const totalSavings = totalOriginalCost - totalCost;
        summaryText += `Общая экономия: ${totalSavings.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.\n\n`;
    } else {
        summaryText += `Скидка: нет\n\n`;
    }
    
    // Итоговая сумма
    summaryText += `Итоговая сумма: ${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} рублей`;
    
    // Заполняем textarea
    document.getElementById('summaryText').value = summaryText;
}

function showCalculationDetails(index) {
    const detailsDiv = document.getElementById(`details-${index}`);
    const result = window.calculationResults[index];
    const details = result.calculationDetails;
    
    if (detailsDiv.style.display === 'none') {
        // Показываем детализацию
        let detailsHTML = `
            <h5 style="margin-bottom: 15px; color: #2d3748;">Детализация расчета для "${result.productName}"</h5>
            
            <div style="margin-bottom: 15px;">
                <strong>Исходные данные:</strong>
                <div>• Тип недвижимости: ${details.propertyType}</div>
        `;
        
        if (details.isNewDeal) {
            detailsHTML += `
                <div>• Тип сделки: Новая сделка</div>
                <div>• Количество помещений (лицевых счетов): ${details.totalUnits}</div>
            `;
        } else {
            detailsHTML += `
                <div>• Тип сделки: Увеличение помещений</div>
                <div>• Текущее количество помещений у партнера: ${details.currentUnits}</div>
                <div>• Дополнительно запрашивается: ${details.additionalUnits} помещений</div>
                <div>• Итого после добавления: ${details.currentUnits + details.additionalUnits} помещений</div>
            `;
        }
        
        detailsHTML += `
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Распределение по тарифным диапазонам:</strong>
        `;
        
        details.tierDetails.forEach(tier => {
            const priceInfo = tier.price === 'фиксированная цена' ? 
                tier.price : 
                `${tier.price} руб. за 1 пом.`;
            
            detailsHTML += `
                <div style="margin-left: 15px; padding: 8px; background: white; border-radius: 4px; margin-bottom: 5px;">
                    • Диапазон "${tier.range}": ${tier.units} ${tier.units === 1 ? 'помещение' : 'помещений'} × ${priceInfo} = ${tier.cost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.
                </div>
            `;
        });
        
        detailsHTML += `
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Стоимость за месяц: ${details.monthlyCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</strong>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Расчет по периодам:</strong>
        `;
        
        details.periodDetails.forEach(period => {
            detailsHTML += `
                <div style="margin-left: 15px; padding: 8px; background: white; border-radius: 4px; margin-bottom: 5px;">
                    • ${period.period}: ${period.cost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.
                </div>
            `;
        });
        
        detailsHTML += `
            </div>
            
            <div style="font-weight: bold; font-size: 16px; color: #667eea;">
                Итого за весь период: ${result.originalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.
            </div>
        `;
        
        if (result.discount > 0) {
            detailsHTML += `
                <div style="margin-top: 10px; padding: 10px; background: #e6fffa; border-radius: 4px; border-left: 4px solid #38b2ac;">
                    <strong>Применена скидка ${result.discount}%:</strong><br>
                    Экономия: ${result.discountAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.<br>
                    <strong>Финальная стоимость: ${result.cost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} руб.</strong>
                </div>
            `;
        }
        
        detailsDiv.innerHTML = detailsHTML;
        detailsDiv.style.display = 'block';
        
        // Меняем текст кнопки
        const button = detailsDiv.previousElementSibling;
        button.textContent = 'Скрыть детализацию расчета';
    } else {
        // Скрываем детализацию
        detailsDiv.style.display = 'none';
        
        // Меняем текст кнопки обратно
        const button = detailsDiv.previousElementSibling;
        button.textContent = 'Показать детализацию расчета';
    }
}

function copySummaryText() {
    const summaryTextarea = document.getElementById('summaryText');
    summaryTextarea.select();
    summaryTextarea.setSelectionRange(0, 99999); // Для мобильных устройств
    
    try {
        document.execCommand('copy');
        
        // Показываем уведомление об успешном копировании
        const button = document.getElementById('copySummary');
        const originalText = button.textContent;
        button.textContent = 'Скопировано!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        alert('Не удалось скопировать текст. Пожалуйста, выделите и скопируйте вручную.');
    }
}

function initializeEventListeners() {
    // Кнопка добавления выбранных продуктов
    document.getElementById('addSelectedProducts').addEventListener('click', addSelectedProducts);
    
    // Кнопка расчета
    document.getElementById('calculate').addEventListener('click', calculateCosts);
    
    // Кнопка копирования итогового текста
    document.getElementById('copySummary').addEventListener('click', copySummaryText);
    
    // Чекбоксы для глобальных настроек
    document.getElementById('globalDates').addEventListener('change', toggleGlobalDates);
    document.getElementById('globalDiscounts').addEventListener('change', toggleGlobalDiscounts);
    document.getElementById('globalUnitsEnabled').addEventListener('change', toggleGlobalUnits);
    
    // Переключение типа калькулятора
    document.getElementById('calculatorType').addEventListener('change', toggleCalculatorType);
    
    // Модальные окна
    setupModalListeners();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setDefaultDates();
    
    // Устанавливаем начальное состояние полей
    setTimeout(() => {
        toggleGlobalDates();
        toggleGlobalDiscounts();
        toggleGlobalUnits();
    }, 100);
});