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

// 當選擇日期時，根據平日或假日生成時間按鈕
$(document).ready(function () {
    $('#date').change(function () {
        const selectedDate = new Date($(this).val());
        const dayOfWeek = selectedDate.getDay(); // 0=星期天, 1=星期一, ..., 6=星期六

        // 清空時間按鈕
        $('#time-buttons').empty();

        // 判斷是平日(星期一到五)或假日(星期六和星期天)並生成對應的時間按鈕
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // 平日
            createTimeButtons("11:00", "13:30", 15); // 午餐時段
            createTimeButtons("17:00", "20:00", 15); // 晚餐時段
        } else {
            // 假日
            createTimeButtons("11:00", "14:30", 15); // 更新假日的中午時段
            createTimeButtons("17:00", "20:00", 15); // 晚餐時段
        }

        // 顯示時間選擇器容器
        $('#time-picker-container').show();
    });
});

// 根據開始時間、結束時間和間隔生成時間按鈕
function createTimeButtons(startTime, endTime, interval) {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    for (let time = start; time <= end; time.setMinutes(time.getMinutes() + interval)) {
        const timeString = time.toTimeString().slice(0, 5); // 取HH:MM格式
        $('#time-buttons').append(`<button type="button" class="time-button" data-time="${timeString}">${timeString}</button>`);
    }

    // 為每個生成的時間按鈕添加事件監聽器，以選擇時間
    $('.time-button').on('click', function() {
        // 移除其他按鈕的選中狀態
        $('.time-button').removeClass('selected');
        // 設置選中按鈕樣式
        $(this).addClass('selected');
    });
}
