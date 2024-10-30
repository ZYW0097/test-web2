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

    if (
        (hours < 11 || (hours >= 15 && hours < 17) || hours >= 20)
    ) {
        alert('請選擇上午11點至下午3點或下午5點至晚上8點的時間');
        this.value = '';
    }
});

document.getElementById('reservationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    // 模擬提交成功
    document.getElementById('successMessage').style.display = 'block';
});