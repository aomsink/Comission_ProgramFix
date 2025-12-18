const fs = require('fs'); // 1. ต้อง import fs เพื่อใช้จัดการไฟล์
const path = require('path');

// Allow Thai and Latin letters and spaces only (no digits or special characters)
const nameRegex = /^[A-Za-z\u0E00-\u0E7F\s]+$/;
const isInteger = (value) => Number.isInteger(value);

exports.commission_calculate = (req, res) => {
    // 2. รับ name เข้ามาด้วย
    const { name, stocks, locks, barrels } = req.body;

    try {
        // ตรวจสอบว่ามีค่าครบถ้วน (เพิ่ม check name)
        if (!name || locks === undefined || stocks === undefined || barrels === undefined) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกข้อมูล name, locks, stocks และ barrels ให้ครบถ้วน"
            });
        }

        // ตรวจสอบชื่อ: ห้ามเว้นว่าง, และต้องประกอบด้วยตัวอักษรไทยหรืออังกฤษ (ไม่อนุญาตตัวเลข/อักษรพิเศษ)
        if (!nameRegex.test(name) || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "ชื่อพนักงานต้องเป็นตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น (ห้ามมีตัวเลขหรืออักษรพิเศษ)"
            });
        }

        // แปลงเป็นตัวเลข
        const locksNum = Number(locks);
        const stocksNum = Number(stocks);
        const barrelsNum = Number(barrels);

        // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
        if (isNaN(locksNum) || isNaN(stocksNum) || isNaN(barrelsNum)) {
            return res.status(400).json({
                success: false,
                message: "ข้อมูล locks, stocks, barrels ต้องเป็นตัวเลขเท่านั้น"
            });
        }

        if (isInteger(locksNum) === false || isInteger(stocksNum) === false || isInteger(barrelsNum) === false) {
            return res.status(400).json({
                success: false,
                message: "ข้อมูล locks, stocks, barrels ต้องเป็นจำนวนเต็มเท่านั้น"
            });
        }

        // ตรวจสอบช่วงของค่า (Validation Logic เดิม)
        if (locksNum < 1 || locksNum > 70) return res.status(400).json({ success: false, message: "locks ต้องอยู่ในช่วง 1-70" });
        if (stocksNum < 1 || stocksNum > 80) return res.status(400).json({ success: false, message: "stocks ต้องอยู่ในช่วง 1-80" });
        if (barrelsNum < 1 || barrelsNum > 90) return res.status(400).json({ success: false, message: "barrels ต้องอยู่ในช่วง 1-90" });

        // คำนวณยอดขาย
        const sales = (45 * locksNum) + (30 * stocksNum) + (25 * barrelsNum);

        // คำนวณคอมมิชชั่น
        let commission = 0;

        if (sales <= 1000) {
            commission = sales * 0.10;
        } else if (sales <= 1800) {
            commission = (1000 * 0.10) + ((sales - 1000) * 0.15);
        } else {
            commission = (1000 * 0.10) + (800 * 0.15) + ((sales - 1800) * 0.20);
        }

        // 3. เตรียมข้อมูลที่จะบันทึก
        const newEmployeeData = {
            id: Date.now(), // สร้าง ID แบบง่ายๆ (ถ้าจำเป็น)
            name: name,
            locks: locksNum,
            stocks: stocksNum,
            barrels: barrelsNum,
            sales: parseFloat(sales.toFixed(2)),
            commission: parseFloat(commission.toFixed(2)),
            created_at: new Date().toISOString()
        };

        // 4. ขั้นตอนการบันทึกไฟล์ (Save to JSON)
        const filePath = path.join(__dirname, 'employees.json'); // ระบุตำแหน่งไฟล์ (ไว้ที่เดียวกับ controller นี้ หรือปรับ path ตามต้องการ)
        let employees = [];

        // 4.1 ตรวจสอบว่ามีไฟล์อยู่แล้วหรือไม่ ถ้ามีให้อ่านค่าเดิมมาก่อน
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            if (fileData) {
                employees = JSON.parse(fileData);
            }
        }

        // 4.2 เอาข้อมูลใหม่ใส่เข้าไปใน Array
        employees.push(newEmployeeData);

        // 4.3 เขียนไฟล์ทับลงไปใหม่
        fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), 'utf-8');

        // ส่งผลลัพธ์กลับหน้าบ้าน
        console.log("Commission calculated and data saved:", newEmployeeData);
        return res.status(200).json({
            success: true,
            message: "คำนวณและบันทึกข้อมูลเรียบร้อยแล้ว",
            data: {
                name: name,
                locks: locksNum,
                stocks: stocksNum,
                barrels: barrelsNum,
                sales: sales.toFixed(2),
                commission: commission.toFixed(2)
            }
        });


    } catch (error) {
        console.error("Error calculating commission:", error);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการคำนวณ",
            error: error.message
        });
    }
}

exports.getHistory = (req, res) => {
    try {
        console.log("Retrieving commission calculation history...");
        const filePath = path.join(__dirname, 'employees.json');
        let employees = [];

        // อ่านข้อมูลจากไฟล์ถ้ามี
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            if (fileData) {
                employees = JSON.parse(fileData);
            }
        }

        return res.status(200).json({
            success: true,
            data: employees
        });

    } catch (error) {
        console.error("Error retrieving history:", error);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติ",
            error: error.message
        });
    }
};