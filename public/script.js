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

document.getElementById('time').addEventListener('change', function () {
    const timeValue = this.value;
    const [hours, minutes] = timeValue.split(':').map(Number);

    if ((hours < 11 || (hours >= 15 && hours < 17) || hours >= 20)) {
        alert('請選擇上午11點至下午3點或下午5點至晚上8點的時間');
        this.value = ''; // 清空選擇的時間
    }
});

document.getElementById('reservationForm').addEventListener('submit', function (e) {
    e.preventDefault(); // 防止表單默認提交行為

    // 收集表單數據
    const formData = $(this).serialize();

    // 發送 AJAX 請求
    $.post('/reservations', formData)
        .done(function(response) {
            document.getElementById('successMessage').style.display = 'block'; // 顯示成功消息
            document.getElementById('message').innerText = ''; // 清空任何錯誤消息
            $('#reservationForm')[0].reset(); // 清除表單
        })
        .fail(function(jqXHR) {
            document.getElementById('message').innerText = jqXHR.responseJSON.message; // 顯示錯誤消息
            document.getElementById('successMessage').style.display = 'none'; // 隱藏成功消息
        });
});
