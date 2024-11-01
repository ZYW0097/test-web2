// 顯示或隱藏兒童椅選擇區
document.getElementById('children').addEventListener('change', function () {
    const highChairDiv = document.getElementById('highChairDiv');
    const childrenCount = this.value;

    if (childrenCount > 0) {
        highChairDiv.style.display = 'block';
    } else {
        highChairDiv.style.display = 'none';
        document.getElementById('highChair').value = ''; // 清空兒童椅數量
    }
});

// 限制訂位時間選擇
document.getElementById('time').addEventListener('change', function () {
    const timeValue = this.value;
    const [hours, minutes] = timeValue.split(':').map(Number);

    // 檢查是否在允許的時間範圍內
    if ((hours < 11 || (hours === 15 && minutes > 30) || hours > 20)) {
        alert('請選擇上午11點至下午3點或下午5點至晚上8點的時間');
        this.value = ''; // 清空選擇的時間
    }
});

// 檢查日期限制
document.getElementById('date').addEventListener('change', function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 將時間設置為午夜
    const selectedDate = new Date(this.value);

    if (selectedDate < today) {
        alert('日期不能選擇今天以前的日期');
        this.value = ''; // 清空選擇的日期
    } else {
        // 顯示聯絡資訊填寫區域
        document.getElementById('contactInfoDiv').style.display = 'block';
    }
});

// 提交訂位表單
document.getElementById('reservationForm').addEventListener('submit', function (e) {
    e.preventDefault(); // 防止表單默認提交行為

    const formData = $(this).serialize();

    // 發送 AJAX 請求
    $.post('/reservations', formData)
        .done(function(response) {
            document.getElementById('successMessage').style.display = 'block'; // 顯示成功消息
            document.getElementById('message').innerText = ''; // 清空任何錯誤消息
            $('#reservationForm')[0].reset(); // 清除表單
            document.getElementById('contactInfoDiv').style.display = 'none'; // 隱藏聯絡資訊區域
            
            // 延遲1秒後重新載入頁面
            setTimeout(() => {
                location.reload();
            }, 1000);
        })
        .fail(function(jqXHR) {
            document.getElementById('message').innerText = jqXHR.responseJSON.message; // 顯示錯誤消息
            document.getElementById('successMessage').style.display = 'none'; // 隱藏成功消息
        });
});

// 設定日期選擇器的最小值
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); // 1月是0
const yyyy = today.getFullYear();
const currentDate = `${yyyy}-${mm}-${dd}`;
document.getElementById('date').setAttribute('min', currentDate);

$(document).ready(function () {
    // 當選擇日期時，判斷是平日還是假日
    $('#date').change(function () {
        const selectedDate = new Date($(this).val());
        const dayOfWeek = selectedDate.getDay(); // 0=星期天, 1=星期一, ..., 6=星期六

        // 清空時間按鈕
        $('#time-buttons').empty();

        // 檢查是平日(星期一到五)或假日(星期六和星期天)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // 平日
            createTimeButtons("11:00", "13:30", 15);
            createTimeButtons("17:00", "20:00", 15);
        } else {
            // 假日
            createTimeButtons("11:00", "14:30", 15); // 更新假日的中午時段
            createTimeButtons("17:00", "20:00", 15);
        }

        // 顯示時間選擇器
        $('#time-picker-container').show();
    });

    // 根據開始時間、結束時間和間隔生成按鈕
    function createTimeButtons(startTime, endTime, interval) {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        
        for (let time = start; time <= end; time.setMinutes(time.getMinutes() + interval)) {
            const timeString = time.toTimeString().slice(0, 5); // 取HH:MM
            $('#time-buttons').append(`<button type="button" class="time-button">${timeString}</button>`);
        }
    }
});
