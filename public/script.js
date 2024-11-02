document.addEventListener('DOMContentLoaded', function () {
    // 生成選項
    const adultsSelect = document.getElementById('adults');
    const childrenSelect = document.getElementById('children');
    const highChairSelect = document.getElementById('highChair');

    for (let i = 0; i <= 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        adultsSelect.appendChild(option);
    }

    for (let i = 0; i <= 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        childrenSelect.appendChild(option);
    }

    for (let i = 0; i <= 10; i++) { // 兒童椅最多10個
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        highChairSelect.appendChild(option);
    }

    // 監聽小孩數量變更事件
    childrenSelect.addEventListener('change', function () {
        const highChairField = document.getElementById('highChairField');
        const childrenCount = this.value;

        if (childrenCount > 0) {
            highChairField.style.display = 'block'; // 顯示兒童椅選項
        } else {
            highChairField.style.display = 'none'; // 隱藏兒童椅選項
            highChairSelect.value = ''; // 清空兒童椅數量
        }
    });
});

// 檢查日期限制
document.getElementById('date').addEventListener('change', function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 將時間設置為午夜
    const selectedDate = new Date(this.value);

    if (selectedDate < today) {
        alert('日期不能選擇今天以前的日期');
        this.value = ''; // 清空選擇的日期
        document.getElementById('contactInfoDiv').style.display = 'none'; // 隱藏聯絡資訊區域
        $('#time-picker-container').hide(); // 隱藏時間選擇器容器
    } else {
        // 顯示聯絡資訊填寫區域
        document.getElementById('contactInfoDiv').style.display = 'block';
        $('#time-picker-container').show(); // 顯示時間選擇器容器
        updateTimeButtons(); // 更新時間按鈕
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
            $('#time-picker-container').hide(); // 隱藏時間選擇器容器
            
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

// 更新時間按鈕函數
function updateTimeButtons() {
    const selectedDate = new Date($('#date').val());
    const dayOfWeek = selectedDate.getDay();

    // 清空時間按鈕
    $('#time-picker-container').empty(); // 清空容器

    // 生成時間按鈕
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        createTimeButtons("11:00", "13:30", 35, "平日上午");
        createTimeButtons("17:00", "20:30", 35, "平日下午");
    } else {
        createTimeButtons("11:00", "14:30", 30, "假日上午");
        createTimeButtons("17:00", "20:30", 30, "假日下午");
    }

    $('#time-picker-container').show();
}

// 根據開始時間、結束時間和間隔生成時間按鈕
function createTimeButtons(startTime, endTime, interval, timeLabel) {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    // 創建新的容器來放置標題和按鈕
    const timeContainer = $('<div class="time-container"></div>');
    timeContainer.append(`<h3>${timeLabel}</h3>`); // 加入上午或下午標籤

    const buttonRow = $('<div class="time-buttons"></div>'); // 新的按鈕行容器

    for (let time = start; time <= end; time.setMinutes(time.getMinutes() + interval)) {
        const timeString = time.toTimeString().slice(0, 5); // 取HH:MM格式
        buttonRow.append(`<button type="button" class="time-button" data-time="${timeString}">${timeString}</button>`);
    }

    // 將按鈕行添加到時間容器中
    timeContainer.append(buttonRow);
    $('#time-picker-container').append(timeContainer); // 將整個容器添加到主容器中

    // 為每個生成的時間按鈕添加事件監聽器，以選擇時間
    $('.time-button').on('click', function() {
        $('.time-button').removeClass('selected'); // 清除已選擇的按鈕樣式
        $(this).addClass('selected'); // 為當前選中的按鈕添加樣式
        
        const selectedTime = $(this).data('time'); // 獲取選中的時間
        $('#selectedTime').val(selectedTime); // 設置隱藏輸入框的值
        console.log("選擇的時間:", selectedTime); // 可以替換成你需要的邏輯
    });
}

// 顯示密碼模態框
document.getElementById('viewReservationsBtn').addEventListener('click', function() {
    document.getElementById('passwordModal').style.display = 'block';
});

// 提交密碼表單
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault(); // 防止默認提交行為
    const password = this.password.value;

    fetch('/protected-views', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url; // 密碼正確，重定向到 reservations
        } else {
            return response.text().then(text => alert(text)); // 顯示錯誤消息
        }
    });
});
