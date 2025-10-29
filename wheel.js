const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');
const segmentInput = document.getElementById('segmentInput');
const updateWheelBtn = document.getElementById('updateWheel');

// Начальные сегменты
let segments = ["1","2","3","4","5","6","7","8"];
let colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#8DD8F8","#FFB6C1"];

let startAngle = 0;
let arc = (2 * Math.PI) / segments.length;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

// Рисуем колесо
function drawWheel() {
  const outsideRadius = 200;
  const textRadius = outsideRadius - 30; // смещаем текст внутрь сегмента
  const centerX = canvas.width/2;
  const centerY = canvas.height/2;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  for(let i=0; i<segments.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i % colors.length];

    // сектор
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
    ctx.fill();
    ctx.save();

    // текст сегмента
    ctx.translate(centerX + Math.cos(angle + arc/2)*textRadius,
                  centerY + Math.sin(angle + arc/2)*textRadius);
    ctx.rotate(angle + arc/2 + Math.PI/2);
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(segments[i], 0, 0);
    ctx.restore();
  }

  // стрелка сверху
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - (outsideRadius + 10));
  ctx.lineTo(centerX + 10, centerY - (outsideRadius + 10));
  ctx.lineTo(centerX, centerY - (outsideRadius - 10));
  ctx.fill();
}

// Вращение колеса
function spin() {
  spinAngleStart = Math.random() * 10 + 10;  // стартовая скорость
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000; // 4-7 секунд
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal){
    stopRotateWheel();
    return;
  }
  const spinAngle = spinAngleStart * (1 - spinTime / spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel(){
  clearTimeout(spinTimeout);
  const degrees = startAngle * 180 / Math.PI + 90;
  const arcd = arc * 180 / Math.PI;
  const index = Math.floor((360 - degrees % 360) / arcd);
  resultDiv.textContent = "Выпало: " + segments[index];
}

// Кнопка крутить
spinButton.addEventListener('click', spin);

// Обновление сегментов из textarea по новой строке
updateWheelBtn.addEventListener('click', () => {
  const input = segmentInput.value.trim();
  if(input){
    segments = input.split('\n').map(s => s.trim()).filter(s => s);
    arc = (2 * Math.PI) / segments.length;
    drawWheel();
  }
});

// начальное рисование
drawWheel();
