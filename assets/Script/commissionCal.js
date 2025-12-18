// Script extracted from commissionCal.html
import { postCommission } from './api/commissionApi.js';


const form = document.getElementById('commissionForm');


function validateField(field, value) {
    const errorElement = document.getElementById(`error-${field}`);
    let errorMessage = '';

    if (field === 'name') {
        const nameRegex = /^[A-Za-z\u0E00-\u0E7F\s]+$/;
        if (!value.trim()) {
            errorMessage = 'กรุณากรอกชื่อพนักงาน';
        } else if (!nameRegex.test(value)) {
            errorMessage = 'ชื่อพนักงานต้องเป็นตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น (ห้ามมีตัวเลขหรืออักษรพิเศษ)';
        }
    } else {
        if (!value.trim()) {
            errorMessage = 'กรุณาใส่ตัวเลข';
        } else if (!/^\d+$/.test(value)) {
            errorMessage = 'มีตัวอักษรพิเศษ';
        } else {
            const num = Number(value);
            if (field === 'locks' && (num < 1 || num > 70)) {
                errorMessage = 'locks ต้องอยู่ในช่วง 1-70';
            } else if (field === 'stocks' && (num < 1 || num > 80)) {
                errorMessage = 'stocks ต้องอยู่ในช่วง 1-80';
            } else if (field === 'barrels' && (num < 1 || num > 90)) {
                errorMessage = 'barrels ต้องอยู่ในช่วง 1-90';
            }
        }
    }

    if (errorMessage) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}


document.getElementById('name').addEventListener('input', (e) => {
    validateField('name', e.target.value);
});

document.getElementById('locks').addEventListener('input', (e) => {
    validateField('locks', e.target.value);
});

document.getElementById('stocks').addEventListener('input', (e) => {
    validateField('stocks', e.target.value);
});

document.getElementById('barrels').addEventListener('input', (e) => {
    validateField('barrels', e.target.value);
});

// 1. ฟังก์ชันโหลดข้อมูลที่เคยกรอกค้างไว้
function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem('lastInput'));
    if (data) {
        document.getElementById('resultName').innerText = data.name || '-';
        document.getElementById('name').value = data.name || '';
        document.getElementById('locks').value = data.locks || '';
        document.getElementById('stocks').value = data.stocks || '';
        document.getElementById('barrels').value = data.barrels || '';

        if (data.result) {
            updateUI(data.result);
        }
    }
}

// 2. ฟังก์ชันอัปเดตหน้าจอ
function updateUI(data) {
    document.getElementById('resultName').innerText = data.name;
    document.getElementById('resultLocks').innerText = data.locks;
    document.getElementById('resultStocks').innerText = data.stocks;
    document.getElementById('resultBarrels').innerText = data.barrels;
    // จัดรูปแบบตัวเลขให้สวยงาม (มี comma)
    document.getElementById('resultSales').innerText = `${Number(data.sales).toLocaleString(undefined)} ฿`;
    document.getElementById('resultCommission').innerText = `${Number(data.commission).toLocaleString(undefined)} ฿`;
}

// 3. ปุ่มเคลียร์ข้อมูล
document.getElementById('clearStorage').addEventListener('click', () => {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?')) {
        localStorage.removeItem('lastInput');
        form.reset();
        // รีเซ็ตผลลัพธ์เป็น -
        ['resultName', 'resultLocks', 'resultStocks', 'resultBarrels', 'resultSales', 'resultCommission'].forEach(id => {
            document.getElementById(id).innerText = '-';
        });
    }
});

// 4. เมื่อกดปุ่ม Submit (ส่งไปคำนวณที่ Server)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    
    const isNameValid = validateField('name', document.getElementById('name').value);
    const isLocksValid = validateField('locks', document.getElementById('locks').value);
    const isStocksValid = validateField('stocks', document.getElementById('stocks').value);
    const isBarrelsValid = validateField('barrels', document.getElementById('barrels').value);

    if (!isNameValid || !isLocksValid || !isStocksValid || !isBarrelsValid) {
        return; 
    }

    const submitBtn = document.querySelector('.btn-calc');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'กำลังคำนวณ...';
    submitBtn.classList.add('loading');

    const payload = {
        name: document.getElementById('name').value.trim(),
        locks: parseInt(document.getElementById('locks').value),
        stocks: parseInt(document.getElementById('stocks').value),
        barrels: parseInt(document.getElementById('barrels').value)
    };

    try {
        // ใช้ฟังก์ชันดึง API จากไฟล์ CommissionApi
        const resJson = await postCommission(payload);

        if (resJson.success) {
            const serverData = resJson.data;
            updateUI(serverData);

            // บันทึกสถานะล่าสุดลง LocalStorage
            localStorage.setItem('lastInput', JSON.stringify({
                ...payload,
                result: serverData
            }));

        } else {
            alert('ข้อผิดพลาด: ' + resJson.message);
        }

    } catch (err) {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อกับ Server ได้: ' + err.message);
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.classList.remove('loading');
    }
});

// เรียกใช้งานตอนเปิดหน้าเว็บ
loadFromStorage();