// Элементы страницы
const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const calendarContainer = document.getElementById('calendarContainer');
const calendarTitle = document.getElementById('calendarTitle');

let currentDate = new Date();
let allData = {}; // данные из Firebase

// Ссылка на базу Firebase
const dbRef = firebase.database().ref("calendarData");

// Загружаем данные из Firebase и слушаем изменения
dbRef.on("value", snapshot => {
  allData = snapshot.val() || {};
  generateCalendar(currentDate);
});

// Темы для месяцев
const themes = {
  0: { bg: '#d9f0ff', title: 'Январь ❄️', weekdayColor: '#0077cc', buttonColor: '#0077cc' },
  1: { bg: '#ffd9e0', title: 'Февраль 💘', weekdayColor: '#cc0055', buttonColor: '#cc0055' },
  2: { bg: '#e0ffe0', title: 'Март 🌱', weekdayColor: '#228822', buttonColor: '#228822' },
  3: { bg: '#e6ffe6', title: 'Апрель 🌷', weekdayColor: '#33aa33', buttonColor: '#33aa33' },
  4: { bg: '#fff4d9', title: 'Май 🌸', weekdayColor: '#ff8800', buttonColor: '#ff8800' },
  5: { bg: '#fff0d9', title: 'Июнь ☀️', weekdayColor: '#ffbb33', buttonColor: '#ffbb33' },
  6: { bg: '#ffe6d9', title: 'Июль 🌞', weekdayColor: '#ff8800', buttonColor: '#ff8800' },
  7: { bg: '#ffd9d9', title: 'Август 🌻', weekdayColor: '#dd3300', buttonColor: '#dd3300' },
  8: { bg: '#fff0e0', title: 'Сентябрь 🍂', weekdayColor: '#aa6600', buttonColor: '#aa6600' },
  9: { bg: '#ffe0d9', title: 'Октябрь 🎃', weekdayColor: '#ff6600', buttonColor: '#ff6600' },
  10: { bg: '#e0e0ff', title: 'Ноябрь 🍁', weekdayColor: '#5555cc', buttonColor: '#5555cc' },
  11: { bg: '#d9f0ff', title: 'Декабрь 🎄❄️', weekdayColor: '#0077cc', buttonColor: '#0077cc' }
};

// Применение темы
function applyTheme(month) {
  const theme = themes[month] || { bg: '#fff', title: '', weekdayColor: '#000', buttonColor: '#000' };
  calendarContainer.style.background = theme.bg;
  calendarTitle.textContent = theme.title;

  document.querySelectorAll('.weekday').forEach(el => el.style.background = theme.weekdayColor);
  document.querySelectorAll('.add-btn').forEach(btn => btn.style.background = theme.buttonColor);
}

// Генерация календаря
function generateCalendar(date) {
  calendarEl.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  monthYearEl.textContent = `${date.toLocaleString('ru-RU', { month: 'long' })} ${year}`;
  applyTheme(month);

  const today = new Date();
  const key = `${year}-${month + 1}`;
  if (!allData[key]) allData[key] = {};

  const weekdays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  weekdays.forEach(day => {
    const wdEl = document.createElement('div');
    wdEl.className = 'weekday';
    wdEl.textContent = day;
    calendarEl.appendChild(wdEl);
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = 1 - (firstWeekday - 1);

  for (let i = 0; i < 35; i++, startDay++) {
    let cellDate, cellMonth, cellYear, isCurrentMonth;
    if (startDay < 1) {
      cellMonth = month - 1; cellYear = year;
      if (cellMonth < 0) { cellMonth = 11; cellYear -= 1; }
      const prevDays = new Date(cellYear, cellMonth + 1, 0).getDate();
      cellDate = prevDays + startDay; isCurrentMonth = false;
    } else if (startDay > daysInMonth) {
      cellMonth = month + 1; cellYear = year;
      if (cellMonth > 11) { cellMonth = 0; cellYear += 1; }
      cellDate = startDay - daysInMonth; isCurrentMonth = false;
    } else {
      cellMonth = month; cellYear = year; cellDate = startDay; isCurrentMonth = true;
    }

    const cellKey = `${cellYear}-${cellMonth + 1}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    if (!isCurrentMonth) dayEl.classList.add('other-month','disabled');
    if (isCurrentMonth && cellDate === today.getDate() && cellMonth === today.getMonth() && cellYear === today.getFullYear()) {
      dayEl.classList.add('today');
    }

    dayEl.dataset.day = cellDate;
    dayEl.dataset.month = cellMonth + 1;
    dayEl.dataset.year = cellYear;

    dayEl.innerHTML = `<strong>${cellDate}</strong><div class="activities"></div>${isCurrentMonth ? '<button class="add-btn">Добавить</button>' : ''}`;
    calendarEl.appendChild(dayEl);

    const activitiesEl = dayEl.querySelector('.activities');
    const activities = allData[cellKey]?.[cellDate] || [];

    // Отображение активностей
    activities.forEach((act, index) => {
      const actEl = document.createElement('div');
      actEl.className = 'activity';

      const textEl = document.createElement('span');
      textEl.textContent = act.name.length > 10 ? act.name.slice(0, 10) + '…' : act.name;
      textEl.title = act.name;
      if (act.done) textEl.classList.add('done');
      actEl.appendChild(textEl);

      // Отметка выполнения
      if (isCurrentMonth) {
        textEl.addEventListener('click', () => {
          act.done = !act.done;
          firebase.database().ref(`calendarData/${cellKey}/${cellDate}/${index}/done`).set(act.done);
        });
      }

      // Кнопка удаления
      const delBtn = document.createElement('button');
      delBtn.textContent = '×';
      delBtn.className = 'del-btn';
      delBtn.addEventListener('click', () => {
        const updated = [...activities];
        updated.splice(index, 1);
        firebase.database().ref(`calendarData/${cellKey}/${cellDate}`).set(updated);
      });
      actEl.appendChild(delBtn);

      activitiesEl.appendChild(actEl);
    });

    // Добавление новой активности
    if (isCurrentMonth) {
      const addBtn = dayEl.querySelector('.add-btn');
      addBtn.style.background = themes[month].buttonColor;
      addBtn.addEventListener('click', () => {
        const name = prompt('Название активности:');
        if (name) {
          const updated = [...activities, { name, done: false }];
          firebase.database().ref(`calendarData/${cellKey}/${cellDate}`).set(updated);
        }
      });
    }
  }
}

// Навигация по месяцам
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate);
});
