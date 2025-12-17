// 1. ประกาศตัวแปร Global เพื่อเก็บข้อมูลไว้ใช้งานตอน Sort
let globalData = [];

async function loadHistory() {
    try {
        // ดึงข้อมูลจาก API
        const res = await fetch('http://localhost:3000/api/commissions/history');
        const result = await res.json();

        // ตรวจสอบโครงสร้างข้อมูล (เผื่อ API ส่งมาเป็น {data: [...]} )
        if (result.data) {
            globalData = result.data;
        } else if (Array.isArray(result)) {
            globalData = result;
        } else {
            globalData = [];
        }

        // เรียกฟังก์ชันจัดเรียง (ค่าเริ่มต้นคือวันที่ล่าสุด)
        applySort();

    } catch (err) {
        console.error("โหลดข้อมูลผิดพลาด:", err);
        document.getElementById('historyBody').innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">ไม่สามารถเชื่อมต่อ Server ได้</td></tr>`;
    }
}

// 2. ฟังก์ชันแสดงตาราง (แยกออกมาเพื่อให้เรียกใช้ซ้ำได้)
function renderTable(data) {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">ไม่มีข้อมูลประวัติ</td></tr>`;
        return;
    }

    data.forEach(item => {
        const dateObj = new Date(item.created_at);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.locks}</td>
                    <td>${item.stocks}</td>
                    <td>${item.barrels}</td>
                    <td>$${Number(item.sales).toLocaleString()}</td>
                    <td>$${Number(item.commission).toLocaleString()}</td>
                    <td>${formattedDate}</td>
                </tr>`;
        tbody.innerHTML += row;
    });
}

// 3. ฟังก์ชันจัดเรียงข้อมูล (ทำงานในเครื่อง ไม่ต้องโหลดหน้าใหม่)
function applySort() {
    const sortType = document.getElementById("sortSelect").value;

    // Copy ข้อมูลมาเพื่อไม่ให้กระทบต้นฉบับ
    let sortedData = [...globalData];

    switch (sortType) {
        case 'date_desc': // วันที่ ล่าสุด
            sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'date_asc': // วันที่ เก่าสุด
            sortedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'name': // ชื่อ
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'sales_desc': // ยอดขาย มาก->น้อย
            sortedData.sort((a, b) => b.sales - a.sales);
            break;
        case 'commission_desc': // คอมมิชชั่น มาก->น้อย
            sortedData.sort((a, b) => b.commission - a.commission);
            break;
    }

    // วาดตารางใหม่ด้วยข้อมูลที่เรียงแล้ว
    renderTable(sortedData);
}

function goBack() {
    window.location.href = "/";
}
window.applySort = applySort;
window.goBack = goBack;

// โหลดข้อมูลเมื่อเปิดหน้า
loadHistory();
