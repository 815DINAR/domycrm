// kp-generator.js - Функционал генерации коммерческих предложений

// URL вашего Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwHwGVDHQTFDk3dgnYyYSfZ9WSv6YWGha9G2Jdt_3VOJaJQ9Xr_gCzEL_FMOeBo_y3rg/exec';

// Сохраняем последние данные расчета глобально
window.lastCalculationData = null;

// Функция генерации КП
async function generateCommercialProposal() {
    // Проверяем, есть ли результаты расчета
    if (!window.calculationResults || window.calculationResults.length === 0) {
        alert('Сначала выполните расчет стоимости');
        return;
    }
    
    // Запрашиваем название клиента
    const clientName = prompt('Введите название клиента для КП:', 'ООО "Название компании"');
    if (!clientName) return;
    
    // Показываем индикатор загрузки
    const button = document.getElementById('generateKP');
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Генерация...';
    button.disabled = true;
    
    try {
        // Собираем данные для отправки
        const data = collectDataForKP(clientName);
        
        // Отправляем запрос на Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Показываем модальное окно с результатом
            showKPResultModal(result);
        } else {
            alert('Ошибка генерации КП: ' + (result.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при генерации КП. Попробуйте еще раз.');
    } finally {
        // Восстанавливаем кнопку
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Сбор данных для КП
function collectDataForKP(clientName) {
    const calculatorType = document.getElementById('calculatorType').value;
    const propertyType = document.getElementById('propertyType').value;
    const tariffSelect = document.getElementById('tariffSelect');
    const tariffName = tariffSelect.options[tariffSelect.selectedIndex]?.text || '';
    
    // Определяем количество помещений
    let roomsCount = 0;
    let currentUnits = 0;
    let additionalUnits = 0;
    
    if (calculatorType === 'new') {
        roomsCount = parseInt(document.getElementById('totalUnits').value) || 0;
        additionalUnits = roomsCount;
    } else {
        currentUnits = parseInt(document.getElementById('currentUnits').value) || 0;
        additionalUnits = parseInt(document.getElementById('globalUnits').value) || 0;
        roomsCount = currentUnits + additionalUnits;
    }
    
    // Получаем даты
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    // Получаем скидку
    const discount = parseFloat(document.getElementById('globalDiscount').value) || 0;
    
    // Получаем общую стоимость из последнего расчета
    const totalCostElement = document.querySelector('#totalCost div[style*="font-size: 24px"]');
    let totalCost = 0;
    if (totalCostElement) {
        const costText = totalCostElement.textContent;
        totalCost = parseFloat(costText.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    }
    
    // Подготавливаем продукты для отправки
    const products = window.calculationResults.map(result => ({
        productName: result.productName,
        cost: result.cost,
        originalCost: result.originalCost,
        discount: result.discount,
        units: result.additionalUnits,
        dateFrom: result.dateFrom,
        dateTo: result.dateTo
    }));
    
    return {
        client: clientName,
        propertyType: propertyType,
        roomsCount: roomsCount,
        currentUnits: currentUnits,
        additionalUnits: additionalUnits,
        products: products,
        totalCost: totalCost,
        dateFrom: dateFrom,
        dateTo: dateTo,
        calculatorType: calculatorType,
        tariffName: tariffName,
        discount: discount
    };
}

// Показать модальное окно с результатом
function showKPResultModal(result) {
    const modal = document.getElementById('kpModal');
    const modalContent = document.getElementById('kpModalContent');
    
    modalContent.innerHTML = `
        <div style="padding: 10px; background: #f0f9ff; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #666;">Файл создан:</p>
            <p style="margin: 0; font-weight: 600; color: #333;">${result.fileName || 'Коммерческое предложение'}</p>
        </div>
        
        <a href="${result.slidesUrl}" target="_blank" 
           style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #4285f4; color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <rect x="2" y="4" width="20" height="16" rx="2"/>
               <path d="M8 9h8"/>
               <path d="M8 13h6"/>
           </svg>
           <span>Открыть в Google Slides</span>
       </a>
       
       <a href="${result.pdfUrl}" target="_blank" 
          style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #ea4335; color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s;">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
               <polyline points="14 2 14 8 20 8"/>
               <line x1="16" y1="13" x2="8" y2="13"/>
               <line x1="16" y1="17" x2="8" y2="17"/>
               <polyline points="10 9 9 9 8 9"/>
           </svg>
           <span>Скачать PDF</span>
       </a>
       
       <div style="padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
           <p style="margin: 0; color: #856404; font-size: 14px;">
               💡 Совет: Откройте презентацию в Google Slides для добавления индивидуальных условий или корректировки данных перед отправкой клиенту.
           </p>
       </div>
   `;
   
   modal.style.display = 'block';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
   // Добавляем обработчик для кнопки генерации КП
   const generateKPBtn = document.getElementById('generateKP');
   if (generateKPBtn) {
       generateKPBtn.addEventListener('click', generateCommercialProposal);
   }
   
   // Обработчик закрытия модального окна КП
   const kpModal = document.getElementById('kpModal');
   if (kpModal) {
       const closeBtn = kpModal.querySelector('.close');
       if (closeBtn) {
           closeBtn.addEventListener('click', function() {
               kpModal.style.display = 'none';
           });
       }
       
       // Закрытие при клике вне модального окна
       window.addEventListener('click', function(event) {
           if (event.target === kpModal) {
               kpModal.style.display = 'none';
           }
       });
   }
   
   // Перехватываем функцию displayResults для сохранения данных
   const originalDisplayResults = window.displayResults;
   if (originalDisplayResults) {
       window.displayResults = function(results, totalCost, dateFrom, dateTo) {
           // Сохраняем данные последнего расчета
           window.lastCalculationData = {
               results: results,
               totalCost: totalCost,
               dateFrom: dateFrom,
               dateTo: dateTo
           };
           
           // Вызываем оригинальную функцию
           originalDisplayResults.apply(this, arguments);
           
           // Показываем кнопку генерации КП
           const generateKPBtn = document.getElementById('generateKP');
           if (generateKPBtn) {
               generateKPBtn.style.display = 'inline-block';
           }
       };
   }
});

// Вспомогательная функция для форматирования даты
function formatDateForKP(dateStr) {
   if (!dateStr) return '';
   
   // Если дата уже в формате ДД.ММ.ГГГГ
   if (dateStr.includes('.')) return dateStr;
   
   // Конвертируем из YYYY-MM-DD в ДД.ММ.ГГГГ
   const parts = dateStr.split('-');
   if (parts.length === 3) {
       return `${parts[2]}.${parts[1]}.${parts[0]}`;
   }
   
   return dateStr;
}

// Экспорт функций для использования в других модулях
window.generateCommercialProposal = generateCommercialProposal;
window.collectDataForKP = collectDataForKP;
window.showKPResultModal = showKPResultModal;