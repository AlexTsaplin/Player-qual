// Ініціалізація порожнього списку пісень
let currentSong = -1; 
let currentSongs = [];
const currentLang = localStorage.getItem("playerLanguage") || "uk";
// Глобальна змінна для зберігання відкоригованих кольорів
let correctedColors = {};

// Функція калібрування кольору на пристрої
function detectColorCorrection() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d", { willReadFrequently: true }); 
    canvas.width = 100;
    canvas.height = 100;

    // Задаємо еталонні кольори
    const testColors = {
        white: "rgb(255, 255, 255)",
        black: "rgb(0, 0, 0)",
        red: "rgb(255, 0, 0)",
        green: "rgb(0, 255, 0)",
        blue: "rgb(0, 0, 255)",
        purple: "rgb(128, 0, 128)",
        brown: "rgb(165, 42, 42)",
        yellow: "rgb(255, 255, 0)"
    };

    for (let color in testColors) {
        ctx.fillStyle = testColors[color];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let imageData = ctx.getImageData(50, 50, 1, 1).data;
        correctedColors[color] = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    }
}

// Викликаємо функцію після завантаження сторінки
window.onload = function() {
    detectColorCorrection();
    loadSongs(); 
};

// Функція для завантаження JSON з піснями
async function loadSongs() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) throw new Error("Ошибка загрузки данных");
        songs = await response.json();
        currentSongs = [...songs];
        
        if (songs.length > 0) {
            init(); // Запускаємо ініціалізацію лише після завантаження пісень
        } else {
            console.error('Список песен пуст');
        }
    } catch (error) {
        console.error('Ошибка загрузки списка песен:', error);
    }
}

// Ініціалізація плеєра
function init() {
    updatePlaylist(currentSongs);

    // Якщо пісню не вибрано, очищаємо інформацію
    if (currentSong === -1) {
        infoWrapper.innerHTML = `<h2></h2><h3></h3>`;
        currentSongTitle.innerHTML = "";
    }
}

// Фільтрування пісень за кольором з урахуванням корекції
function filterSongsByColor(color) {
    const correctedColor = correctedColors[color] || color;
    const filteredSongs = songs.filter(song => song.colors && song.colors[color]);
    updatePlaylist(filteredSongs); // ця функція оновить currentSongs
}

// Функція для завантаження пісні
function loadSong(num, onLoaded) {
  if (num === -1 || !currentSongs[num]) {
      infoWrapper.innerHTML = `<h2></h2><h3></h3>`;
      currentSongTitle.innerHTML = "";
      return;
  }

  audio.pause();
  audio.src = "";
  audio.load();
  audio.currentTime = 0;

  const song = currentSongs[num];

  infoWrapper.innerHTML = `<h2>${song.title}</h2><h3>${song.artist}</h3>`;
  currentSongTitle.innerHTML = song.title;
  coverImage.style.backgroundImage = `url(${baseImagePath}${song.img_src})`;

  audio.src = `${baseAudioPath}${song.src}`;
  audio.load();

  audio.addEventListener("canplaythrough", function handlePlay() {
      audio.removeEventListener("canplaythrough", handlePlay);
      if (typeof onLoaded === "function") onLoaded(); // викликаємо play ззовні
  });

  currentFavourite.classList.toggle("active", favourites.includes(num));
}


const playerContent = document.querySelector(".player-content");
const openPlayerBtn = document.getElementById("openPlayer");
const menuBtn = document.querySelector(".menu-btn");
const backToMenuBtn = document.getElementById("backToMenu");
const mainMenu = document.querySelector(".main-menu");
const playerBody = document.querySelector(".player-body");
const container = document.querySelector(".container");
const progressBar = document.querySelector(".bar");
const progressDot = document.querySelector(".dot");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const playlistContainer = document.querySelector("#playlist");
const infoWrapper = document.querySelector(".info");
const coverImage = document.querySelector(".cover-image");
const currentSongTitle = document.querySelector(".current-song-title");
const currentFavourite = document.querySelector("#current-favourite");
const playPauseBtn = document.querySelector("#playpause");
const nextBtn = document.querySelector("#next");
const prevBtn = document.querySelector("#prev");
const shuffleBtn = document.querySelector("#shuffle");
const repeatBtn = document.querySelector("#repeat");
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
const volumeControl = document.querySelector('#volume-control');
const volumePercentage = document.querySelector('#volume-percentage');
const optionBtn = document.querySelector('#option');
const trackInfoModal = document.querySelector('#trackInfoModal');
const closeTrackInfoBtn = document.querySelector('#closeTrackInfo');
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');
const trackCover = document.querySelector('.track-cover');

const baseAudioPath = "data/audio/";
const baseImagePath = "data/image/";

// --- Вікно вибору опцій --- //
const choiceModal = document.getElementById("choiceModal");
const chooseLuscherBtn = document.getElementById("chooseLuscher");
const closeChoiceModalBtn = document.getElementById("closeChoiceModal");

// --- ЗА ЖАНРАМИ --- //
const chooseGenreTestBtn = document.getElementById("chooseGenreTest");
const genreTestModal = document.getElementById("genreTestModal");
const closeGenreTestModalButton = document.getElementById("closeGenreTestModal");
const genreButtons = document.querySelectorAll(".genre-choice");

// Відкриття модального вікна тесту "За жанрами"
function openGenreTestModal() {
    genreTestModal.style.display = "flex";
}

// Закриття модального вікна тесту "За жанрами"
function closeGenreTestModal() {
    genreTestModal.style.display = "none";
}

// Фільтрація пісень за жанром
function filterSongsByGenre(genre) {
    const filteredSongs = songs.filter(song => song.genre && song.genre.toLowerCase() === genre);
    updatePlaylist(filteredSongs);

    if (filteredSongs.length === 0) {
        playlistContainer.innerHTML = '<tr><td colspan="4">На жаль, немає пісень у цьому жанрі.</td></tr>';
    }
}

// Додаємо обробники подій для кнопок жанрів
genreButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterSongsByGenre(button.getAttribute("data-genre"));
        closeGenreTestModal();
    });
});

// Обробник для кнопки відкриття тесту "За жанрами"
chooseGenreTestBtn.addEventListener("click", () => {
    choiceModal.style.display = "none";
    openGenreTestModal();
});

// Обробник для кнопки закриття тесту "За жанрами"
closeGenreTestModalButton.addEventListener("click", closeGenreTestModal);
// --- BY GENRE --- //

// --- ТЕСТ ЛЮШЕРА --- //
const luscherModal = document.getElementById("luscherModal");
const closeLuscherModalButton = document.getElementById("closeLuscherModal");
const colorButtons = document.querySelectorAll(".color-choice");
const timerElement = document.getElementById("timer"); 
let luscherTimer, interval; // Таймери для закриття модального вікна та зворотного відліку

// Функція для запуску таймера
function startLuscherTimer(duration) {
    clearTimeout(luscherTimer);
    clearInterval(interval);

    let remainingTime = duration / 1000; 
    interval = setInterval(() => {
        remainingTime > 0 
            ? timerElement.textContent = `${--remainingTime} секунд залишилося` 
            : endTimer();
    }, 1000);

    luscherTimer = setTimeout(endTimer, duration);
}

// Завершення таймера
function endTimer() {
    clearInterval(interval);
    timerElement.textContent = `0 секунд залишилося`;
    closeLuscherModal();
}

// Закриття вікна Люшера
function closeLuscherModal() {
    luscherModal.style.display = "none";
    clearTimeout(luscherTimer);
    clearInterval(interval);
}

closeLuscherModalButton.addEventListener("click", closeLuscherModal);

// Обробка вибору кольору
colorButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterSongsByColor(button.getAttribute("data-color"));
        closeLuscherModal();
    });
});

// Відкриття вікна Люшера
function openLuscherModal() {
    luscherModal.style.display = "flex";
    startLuscherTimer(10000); 
}

// Фільтрування пісень за кольором
function filterSongsByColor(color) {

  // Наводимо назву кольору до нижнього регістру, якщо в об'єкті ключі в нижньому регістрі
  const colorKey = color.toLowerCase();
  const filteredSongs = songs
      .filter(song => song.colors && song.colors[colorKey] !== undefined)
      .sort((a, b) => b.colors[colorKey] - a.colors[colorKey]); // Сортування за зменшенням коефіцієнта

  updatePlaylist(filteredSongs);

  if (filteredSongs.length === 0) {
      playlistContainer.innerHTML = '<tr><td colspan="4">На жаль, немає пісень з таким кольором.</td></tr>';
  }
}
// --- ТЕСТ ЛЮШЕРА --- //

// --- MBTI ТЕСТ --- //
// Глобальні змінні для пісень (передбачається, що є функція loadSongs, яка завантажує дані в songs)
let songsWithMbti = [];     

const mbtiTypes = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

// Функція для обчислення масиву пісень з MBTI
function computeSongsWithMbti() {
  return songs.map(song => {
    return {
      ...song,
      // Якщо у пісні вже заданий MBTI (і не порожній), залишаємо його, інакше призначаємо циклічно
      mbti: song.mbti && song.mbti.trim() !== ""
            ? song.mbti.trim().toUpperCase()
            : mbtiTypes[song.id % mbtiTypes.length]
    };
  });
}

// Після завантаження пісень (наприклад, у loadSongs) необхідно перерахувати songsWithMbti
function loadSongs() {
  fetch('songs.json')
    .then(response => {
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      return response.json();
    })
    .then(data => {
      songs = data;
      assignTemperamentsByColor();
      currentSongs = [...songs]; // зберігаємо копію
      updatePlaylist(currentSongs);
      // Перераховуємо songsWithMbti після завантаження пісень
      songsWithMbti = computeSongsWithMbti();
      if (songs.length > 0) {
        init(); 
      } else {
        console.error('Список песен пуст');
      }
    })
    .catch(error => console.error('Ошибка загрузки списка песен:', error));
}

// Масив питань MBTI-тесту
const mbtiQuestions = [
  {
    question: "mbtiQuestion1",
    options: [
      { text: "mbtiOptionE", value: "E" },
      { text: "mbtiOptionI", value: "I" }
    ]
  },
  {
    question: "mbtiQuestion2",
    options: [
      { text: "mbtiOptionS", value: "S" },
      { text: "mbtiOptionN", value: "N" }
    ]
  },
  {
    question: "mbtiQuestion3",
    options: [
      { text: "mbtiOptionT", value: "T" },
      { text: "mbtiOptionF", value: "F" }
    ]
  },
  {
    question: "mbtiQuestion4",
    options: [
      { text: "mbtiOptionJ", value: "J" },
      { text: "mbtiOptionP", value: "P" }
    ]
  }
];

// Функція фільтрації пісень за типом MBTI
function filterSongsByMbti(mbtiType) {
  mbtiType = mbtiType.trim().toUpperCase();
  console.log("Filtering songs for MBTI:", mbtiType);
  const filteredSongs = songsWithMbti.filter(song =>
    song.mbti && song.mbti === mbtiType
  );
  currentSongs = filteredSongs;
  updatePlaylist(filteredSongs);
}

// Функція оновлення плейлиста (приклад)
function updatePlaylist(songsList) {
  document.getElementById("playlist").innerHTML =
    songsList.map(song => `<div>${song.title} (${song.mbti})</div>`).join("");
}

// Глобальні змінні для тесту MBTI
let mbtiCurrentQuestionIndex = 0;
let mbtiAnswers = [];
let selectedMbtiAnswer = null;

// Функція відкриття MBTI-тесту
function openMbtiTest() {
  const mbtiModal = document.getElementById("mbtiModal");
  mbtiModal.style.display = "flex";
// Приховуємо кнопку закриття тільки для тесту MBTI
  document.getElementById("closeMbtiModal").style.display = "none";
  
  mbtiCurrentQuestionIndex = 0;
  mbtiAnswers = [];
  selectedMbtiAnswer = null;
  displayMbtiQuestion();
  document.getElementById("mbtiNextButton").style.display = "inline-block";
  document.getElementById("mbtiNextButton").disabled = true;
}

const mbtiDescriptions = {
  "INTJ": {
    name: "Архітектор",
    description: "Творчі та стратегічні мислителі, які мають план для всього."
  },
  "INTP": {
    name: "Логік",
    description: "Винахідники-новатори з невгамовною жагою до знань."
  },
  "ENTJ": {
    name: "Командир",
    description: "Сміливі, винахідливі та вольові лідери, які завжди знаходять вихід – або прокладають його самі."
  },
  "ENTP": {
    name: "Полеміст",
    description: "Кмітливі й допитливі мислителі, які не можуть відмовитися від інтелектуального виклику."
  },
  "INFJ": {
    name: "Адвокат",
    description: "Спокійні й загадкові, проте дуже натхненні та невтомні ідеалісти."
  },
  "INFP": {
    name: "Посередник",
    description: "Поетичні, добрі та альтруїстичні особистості, завжди готові допомогти у добрій справі."
  },
  "ENFJ": {
    name: "Протагоніст",
    description: "Харизматичні й натхненні лідери, що зачаровують своїх слухачів."
  },
  "ENFP": {
    name: "Активіст",
    description: "Завзяті, креативні та комунікабельні вільні духом люди, які завжди можуть знайти причину для посмішки."
  },
  "ISTJ": {
    name: "Логіст",
    description: "Практичні індивіди, що віддають перевагу фактам. Їхня надійність не піддається сумніву."
  },
  "ISFJ": {
    name: "Захисник",
    description: "Дуже віддані та щирі захисники, завжди готові стати на захист своїх близьких."
  },
  "ESTJ": {
    name: "Керівник",
    description: "Чудові адміністратори, неперевершені в управлінні справами та людьми."
  },
  "ESFJ": {
    name: "Консул",
    description: "Надзвичайно турботливі, комунікабельні та популярні люди, завжди готові прийти на допомогу."
  },
  "ISTP": {
    name: "Віртуоз",
    description: "Сміливі та практичні експериментатори, які майстерно володіють усіма видами інструментів."
  },
  "ISFP": {
    name: "Авантюрист",
    description: "Гнучкі та чарівні митці, завжди готові досліджувати та пізнавати щось нове."
  },
  "ESTP": {
    name: "Підприємець",
    description: "Кмітливі, енергійні та дуже проникливі люди, яким подобається жити на межі."
  },
  "ESFP": {
    name: "Артист",
    description: "Спонтанні, енергійні та завзяті люди, з якими ніколи не буває нудно."
  }
};

// Функція відображення поточного питання тесту MBTI
function displayMbtiQuestion() {
  const questionContainer = document.getElementById("mbtiQuestionContainer");
  questionContainer.innerHTML = ""; 

  function getLang() {
    return localStorage.getItem("playerLanguage") || "uk";
}

  const lang = getLang();

  if (mbtiCurrentQuestionIndex < mbtiQuestions.length) {
      const currentQ = mbtiQuestions[mbtiCurrentQuestionIndex];

      // Відображаємо питання з перекладом
      const questionElement = document.createElement("p");
      questionElement.textContent = translations[lang][currentQ.question]; 
      questionContainer.appendChild(questionElement);

      // Відображаємо варіанти відповідей
      const optionsDiv = document.createElement("div");
      optionsDiv.className = "mbti-options";

      currentQ.options.forEach(option => {
          const btn = document.createElement("button");
          btn.className = "mbti-option";
          btn.textContent = translations[lang][option.text]; // Отримуємо переклад
          btn.dataset.value = option.value;

          btn.addEventListener("click", () => {
              selectedMbtiAnswer = option.value;
              document.querySelectorAll(".mbti-option").forEach(b => b.style.backgroundColor = "");
              btn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
              document.getElementById("mbtiNextButton").disabled = false;
          });

          optionsDiv.appendChild(btn);
      });

      questionContainer.appendChild(optionsDiv);
  } else {
      // Після завершення тесту
      const mbtiType = mbtiAnswers.join("");
      const nameKey = `mbti_${mbtiType}_name`;
      const descKey = `mbti_${mbtiType}_desc`;

      const name = translations[lang][nameKey] || mbtiType;
      const description = translations[lang][descKey] || "Опис не знайдено.";

      questionContainer.innerHTML = `
        <p>${translations[lang]["mbtiResult"]} <strong>${mbtiType} — ${name}</strong></p>
        <p style="margin-top: 10px;">${description}</p>`;

      document.getElementById("mbtiNextButton").style.display = "none";

      // Фільтрація пісень за MBTI
      setTimeout(() => {
          document.getElementById("mbtiModal").style.display = "none";
          filterSongsByMbti(mbtiType);
      }, 7000);
  }
}

// Обробник кнопки "Далі"
document.getElementById("mbtiNextButton").addEventListener("click", () => {
  if (selectedMbtiAnswer) {
    mbtiAnswers.push(selectedMbtiAnswer);
    selectedMbtiAnswer = null;
    mbtiCurrentQuestionIndex++;
    displayMbtiQuestion();
    document.getElementById("mbtiNextButton").disabled = true;
  }
});

// Обробник кнопки "Закрити" у MBTI-тесті
document.getElementById("closeMbtiModal").addEventListener("click", () => {
  const mbtiModal = document.getElementById("mbtiModal");
  mbtiModal.style.display = "none";
});

// Обробник для кнопки відкриття тесту MBTI з вікна вибору тестів
document.getElementById("chooseMbtiTest")?.addEventListener("click", () => {
  const choiceModal = document.getElementById("choiceModal");
  if (choiceModal) {
    choiceModal.style.display = "none";
  }
  openMbtiTest();
});
// --- MBTI TEST --- //

// --- РИТМ. ТЕСТ --- //
// Передбачається, що глобальний масив songs вже завантажений (наприклад, через loadSongs)
let songsWithTemp = [];

// Функція для визначення "temp" за кольором
function getTempByColor(color) {
  if (!color) return "neutral";
  const energeticColors = ["red", "yellow", "purple", "blue"];
  const calmColors = ["black", "white", "brown"];
  if (energeticColors.includes(color.toLowerCase())) return "energetic";
  if (calmColors.includes(color.toLowerCase())) return "calm";
  return "neutral";
}

// Функція для обчислення нового масиву пісень із властивістю temp.
// Викликайте її після завантаження пісень (наприклад, у loadSongs).
function computeSongsWithTemp() {
  songsWithTemp = songs.map(song => {
    let dominantColor = "";
    if (song.colors) {
      // Знаходимо колір із максимальним значенням
      dominantColor = Object.entries(song.colors).reduce((maxEntry, entry) => {
        return entry[1] > maxEntry[1] ? entry : maxEntry;
      }, ["", 0])[0];
    }
    return { ...song, temp: getTempByColor(dominantColor) };
  });
}

function filterSongsByRhythm(bpm) {
  const tempMap = {
    energetic: bpm >= 200,
    calm: bpm <= 150,
    neutral: bpm > 150 && bpm < 200,
  };

  const filteredSongs = songsWithTemp.filter(song =>
    tempMap[song.temp]
  );
  
  currentSongs = filteredSongs;
  updatePlaylist(filteredSongs);
}

// Глобальні змінні для ритмічного тесту
let tapTimes = [];
let startTime = 0;
let rhythmInterval;
let rhythmTimeout;

function openRhythmModal() {
  const rhythmModal = document.getElementById("rhythmModal");
  const rhythmResult = document.getElementById("rhythmResult");
  const rhythmTimer = document.getElementById("rhythmTimer");
  const tapButton = document.getElementById("rhythmTapButton");

  tapTimes = [];
  startTime = Date.now();
  rhythmResult.textContent = "BPM: --";
  rhythmTimer.textContent = "Час: 0 с";
  tapButton.disabled = false;
  rhythmModal.style.display = "flex";

  rhythmInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    rhythmTimer.textContent = "Час: " + elapsed + " с";
  }, 1000);

  rhythmTimeout = setTimeout(() => {
    clearInterval(rhythmInterval);
    tapButton.disabled = true;

    let finalBPM;
    if (tapTimes.length > 1) {
      const totalTime = tapTimes[tapTimes.length - 1] - tapTimes[0];
      const avgInterval = totalTime / (tapTimes.length - 1);
      finalBPM = Math.round(60000 / avgInterval);
      rhythmResult.textContent = "Final BPM: " + finalBPM;
    } else {
      rhythmResult.textContent = "Недостатньо натискань";
      finalBPM = 0;
    }

    setTimeout(() => {
      rhythmModal.style.display = "none";
      if (finalBPM > 0) {
        filterSongsByRhythm(finalBPM);
      }
    }, 2000);
  }, 5000);  
}

document.getElementById("rhythmTapButton").addEventListener("click", () => {
  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 1) {
    const totalTime = tapTimes[tapTimes.length - 1] - tapTimes[0];
    const avgInterval = totalTime / (tapTimes.length - 1);
    const bpm = Math.round(60000 / avgInterval);
    document.getElementById("rhythmResult").textContent = "BPM: " + bpm;
  }
});

document.getElementById("closeRhythmModal").addEventListener("click", () => {
  const rhythmModal = document.getElementById("rhythmModal");
  rhythmModal.style.display = "none";
  clearInterval(rhythmInterval);
  clearTimeout(rhythmTimeout);
});

// Обробник кнопки "Ритмічний тест" у вікні вибору тестів
document.getElementById("chooseRhythmTest")?.addEventListener("click", () => {
  const choiceModal = document.getElementById("choiceModal");
  if (choiceModal) {
    choiceModal.style.display = "none";
  }
  computeSongsWithTemp();
  openRhythmModal();
});
// --- РИТМ. ТЕСТ --- //

// --- Тест на темперамент --- //
const temperamentDescriptions = {
  "choleric": {
    name: "Холерик",
    description: "Імпульсивний, енергійний, схильний до швидких рішень та дій. Часто керується емоціями."
  },
  "sanguine": {
    name: "Сангвінік",
    description: "Життєрадісний, комунікабельний та активний. Легко адаптується та знаходить спільну мову."
  },
  "melancholic": {
    name: "Меланхолік",
    description: "Глибокий мислитель, емоційний, схильний до саморефлексії. Потребує стабільності та спокою."
  },
  "phlegmatic": {
    name: "Флегматик",
    description: "Спокійний, надійний та розсудливий. Не любить поспішати, але має стабільний характер."
  }
};

const chooseTemperamentTestBtn = document.getElementById("chooseTemperamentTest");

chooseTemperamentTestBtn.addEventListener("click", () => {
  const lang = localStorage.getItem("playerLanguage") || "uk";
  choiceModal.style.display = "none";
  document.getElementById("temperamentModal").style.display = "flex";
  document.getElementById("temperamentTitle").textContent = translations[lang]["temperamentTestTitle"];
  document.getElementById("temperamentForm").reset();
  document.getElementById("temperamentForm").style.display = "block";
  document.getElementById("temperamentResult").style.display = "none";
  document.getElementById("closeTemperamentModal").style.display = "none";
});

document.getElementById("temperamentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const lang = localStorage.getItem("playerLanguage") || "uk";
  const formData = new FormData(this);
  const answers = [...formData.values()];

  const tempCount = answers.reduce((acc, val) => {
    if (["choleric", "sanguine", "melancholic", "phlegmatic"].includes(val)) {
      acc[val] = (acc[val] || 0) + 1;
    }
    return acc;
  }, {});

  if (Object.keys(tempCount).length === 0) return;

  const temperament = Object.entries(tempCount).sort((a, b) => b[1] - a[1])[0][0];

  const resultContainer = document.getElementById("temperamentResult");
  const name = translations[lang][`temperament_${temperament}_name`];
  const description = translations[lang][`temperament_${temperament}_desc`];

  resultContainer.innerHTML = `
    <p><strong>${name}</strong></p>
    <p>${description}</p>`;
  
  document.getElementById("temperamentForm").style.display = "none";
  document.getElementById("temperamentTitle").textContent = translations[lang]["temperamentResultTitle"];
  resultContainer.style.display = "block";

  setTimeout(() => {
    document.getElementById("temperamentModal").style.display = "none";
    filterSongsByTemperament(temperament);
  }, 5000);
});

function assignTemperamentsByColor() {
  songs.forEach(song => {
    if (!song.colors) return;

    const dominantColor = Object.entries(song.colors)
      .sort((a, b) => b[1] - a[1])[0][0]; // Найсильніший колір

    let temperament = "sanguine"; // За замовчуванням

    switch (dominantColor) {
      case "red":
      case "yellow":
        temperament = "choleric";
        break;
      case "blue":
      case "green":
        temperament = "sanguine";
        break;
      case "black":
      case "brown":
        temperament = "melancholic";
        break;
      case "white":
      case "purple":
        temperament = "phlegmatic";
        break;
    }

    song.temperament = temperament;
  });
}

// Функція для фільтрації пісень за темпераментом
function filterSongsByTemperament(temperament) {
  const lang = localStorage.getItem("playerLanguage") || "uk";
  const filteredSongs = songs.filter(song => song.temperament === temperament);

  if (filteredSongs.length > 0) {
    updatePlaylist(filteredSongs);
  } else {
    alert(`Пісень для темпераменту ${translations[lang][`temperament_${temperament}_name`]} не знайдено.`);
  }
}

// Функція для відображення відфільтрованих пісень
function displayFilteredSongs(filteredSongs) {
  const songsList = document.getElementById("songsList");
  songsList.innerHTML = ''; // Очищаємо поточний список

  filteredSongs.forEach(song => {
    const songElement = document.createElement("li");
    songElement.textContent = `${song.title} — ${song.artist}`;
    songsList.appendChild(songElement);
  });
}
// --- Тест на темперамент --- //

// Відкрити вибір опцій
openPlayerBtn.addEventListener("click", () => {
    choiceModal.style.display = "flex";
});

// Закрити вибір опцій
closeChoiceModalBtn.addEventListener("click", () => {
    choiceModal.style.display = "none";
});


// Вибір тесту Люшера
chooseLuscherBtn.addEventListener("click", () => {
    choiceModal.style.display = "none";
    openLuscherModal();
});

// Змінні для стану програвача
let playing = false, 
  shuffle = false, 
  repeat = 0, 
  favourites = [], 
  audio = new Audio(); 
audio.volume = volumeControl.value;
volumePercentage.innerText = `${Math.floor(volumeControl.value * 100)}%`;

// Перехід до плеєра
openPlayerBtn.addEventListener("click", () => {
  mainMenu.style.display = "none"; 
  playerContent.style.display = "block"; 
  playerBody.style.display = "block";
  container.classList.add("active");
});

// Повернення в меню
backToMenuBtn.addEventListener("click", () => {
  mainMenu.style.display = "block"; 

  // Зупиняємо відтворення
  audio.pause();

  // Міняємо значок на "Play"
  playPauseBtn.classList.replace("fa-pause", "fa-play");
  playing = false; // Оновлюємо стан

  // Приховуємо інтерфейс програвача
  playerContent.style.display = "none"; 
  playerBody.style.display = "none"; 

  // Знімаємо клас active у контейнера
  container.classList.remove('active');

  // Приховуємо поле пошуку та оновлюємо плейлист
  searchInput.style.display = 'none';
  searchInput.value = '';
  currentSongs = [...songs]; // скидаємо фільтри
  updatePlaylist(currentSongs);
});

// Функція для відкриття вікна з інформацією про трек
function openTrackInfo() {
  trackInfoModal.style.display = 'block';
  setTimeout(() => trackInfoModal.style.opacity = '1', 0); 

  const song = currentSongs[currentSong]; 

  trackTitle.innerText = song.title;
  trackArtist.innerText = song.artist;
  trackCover.style.backgroundImage = `url(${baseImagePath}${song.img_src})`;
}


// Функція для закриття вікна з інформацією про трек
function closeTrackInfo() {
  trackInfoModal.style.opacity = '0'; 
  setTimeout(() => trackInfoModal.style.display = 'none', 300); 
}

// Обробник кліка за кнопкою опцій
optionBtn.addEventListener('click', openTrackInfo);

// Обробник кліка по стрілочці для закриття вікна
closeTrackInfoBtn.addEventListener('click', closeTrackInfo);

// Функція для оновлення громкості
function updateVolume() {
  const volumeValue = Math.floor(volumeControl.value * 100);
  volumePercentage.innerText = `${volumeValue}%`;
  audio.volume = volumeControl.value;
}

// Оновлення відсотків за зміни гучності
volumeControl.addEventListener('input', updateVolume);

// Функція для пошуку пісень
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query)  
  );
  updatePlaylist(filteredSongs);
});

// Обробник кліка по іконці пошуку
searchBtn.addEventListener('click', () => {
  if (searchInput.style.display === 'none' || !searchInput.style.display) {
    searchInput.style.display = 'inline-block';
    searchInput.focus();
  } else {
    searchInput.style.display = 'none';
    searchInput.value = '';
    updatePlaylist(currentSongs);;
  }
});

// Обробник зміни стану контейнера
menuBtn.addEventListener('click', () => {
  container.classList.toggle('active');

  // Якщо контейнер стає неактивним, приховуємо поле пошуку
  if (!container.classList.contains('active')) {
    searchInput.style.display = 'none';
    searchInput.value = '';
    updatePlaylist(currentSongs);;
  } else {
    updatePlaylist(currentSongs);;
  }
});

// Ініціалізація програвача
function init() {
  updatePlaylist(currentSongs);;
  loadSong(currentSong);
}

// Оновлення плейлиста
function updatePlaylist(songList) {
  currentSongs = songList;

  const playlistContainer = document.querySelector("#playlist");
  playlistContainer.innerHTML = songList.map((song, index) => `
      <tr class="song" data-index="${index}">
          <td class="no"><h5>${index + 1}</h5></td>
          <td class="title">
              <h6>${song.title}</h6>
              <h6 class="artist small-artist">${song.artist}</h6>
          </td>
          <td class="length"><h5>0:00</h5></td>
          <td><i class="fas fa-heart ${favourites.includes(index) ? "active" : ""}"></i></td>
      </tr>
  `).join("");

  // Додаємо обробники кліку
  document.querySelectorAll(".song").forEach(row => {
      row.addEventListener("click", (e) => {
          const index = parseInt(row.getAttribute("data-index"));

          if (e.target.classList.contains("fa-heart")) {
              addToFavourites(index);
              e.target.classList.toggle("active");
              return;
          }

          currentSong = index;
          loadSong(currentSong, () => {
              playing = true;
              audio.play();
              playPauseBtn.classList.replace("fa-play", "fa-pause");
          });
      });

      // Оновлюємо тривалість
      const index = parseInt(row.getAttribute("data-index"));
      const audioForDuration = new Audio(`${baseAudioPath}${currentSongs[index].src}`);
      audioForDuration.addEventListener("loadedmetadata", () => {
          const duration = formatTime(audioForDuration.duration);
          row.querySelector(".length h5").innerText = duration;
      });
  });
}

// Форматування часу (мм:сс)
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Перемикання кнопки "відтворити/пауза"
function togglePlayPause() {
  if (playing) {
    playPauseBtn.classList.replace("fa-pause", "fa-play");
    audio.pause();
  } else {
    playPauseBtn.classList.replace("fa-play", "fa-pause");
    audio.play();
  }
  playing = !playing;
}
// Обробник кліку для кнопки "відтворити/пауза"
playPauseBtn.addEventListener("click", togglePlayPause);

// Функція для відтворення наступної пісні
function nextSong() {
  if (shuffle) shuffleFunc();
  currentSong = (currentSong + 1) % currentSongs.length;
  loadSong(currentSong, () => {
      if (playing) audio.play();
  });
}

// Обробник кліку для кнопки "наступна пісня"
nextBtn.addEventListener("click", nextSong);

// Функція для відтворення попередньої пісні
function prevSong() {
  if (shuffle) shuffleFunc();
  currentSong = (currentSong - 1 + currentSongs.length) % currentSongs.length;
  loadSong(currentSong, () => {
      if (playing) audio.play();
  });
}

// Обробник кліку для кнопки "попередня пісня"
prevBtn.addEventListener("click", prevSong);

// Додавання або видалення пісні з улюблених
function addToFavourites(index) {
  if (favourites.includes(index)) {
    favourites = favourites.filter(item => item !== index);
    currentFavourite.classList.remove("active");
  } else {
    favourites.push(index);
    if (index === currentSong) currentFavourite.classList.add("active");
  }
  updatePlaylist(currentSongs);;
}

// Обробник кліку для кнопки "додати в улюблені"
currentFavourite.addEventListener("click", () => {
  currentFavourite.classList.toggle("active");
  addToFavourites(currentSong);
});

// Ввімкнення або вимкнення shuffle
shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;

  shuffleBtn.classList.toggle("active");
});

// Функція для випадкового вибору пісні
function shuffleFunc() {
  currentSong = Math.floor(Math.random() * songs.length);
}

// Обробник кліку для кнопки "повтор"
repeatBtn.addEventListener("click", () => {
  repeat = (repeat + 1) % 2;
  console.log("Repeat mode:", repeat);  // Додаємо повідомлення для відладки
  repeatBtn.classList.toggle("active", repeat > 0);
});

// Автоматичний перехід до наступної пісні після завершення поточної
audio.addEventListener("ended", () => {
  if (repeat === 1) {
    loadSong(currentSong);
    audio.play();
  } else if (repeat === 2) {
    nextSong();
    audio.play();
  } else {
    nextSong();
  }
});

// Оновлення прогрес-бару під час відтворення пісні
function progress() {
  let { duration, currentTime } = audio;
  currentTimeEl.innerHTML = formatTime(currentTime || 0);
  durationEl.innerHTML = formatTime(duration || 0);
  progressDot.style.left = `${(currentTime / duration) * 100}%`;
}
// Обробник оновлення часу пісні
audio.addEventListener("timeupdate", progress);

// Переміщення по треку через прогрес-бар
progressBar.addEventListener("click", (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

//Про програму
document.getElementById("openAboutApp").addEventListener("click", function () {
  document.getElementById("aboutAppModal").style.display = "flex";
});

document.getElementById("closeAboutApp").addEventListener("click", function () {
  document.getElementById("aboutAppModal").style.display = "none";
});

// НАЛАШТУВАННЯ
const openSettingsBtn = document.getElementById("openSettings");
const closeSettingsBtn = document.getElementById("closeSettings");
const settingsModal = document.getElementById("settingsModal");
const languageSelect = document.getElementById("languageSelect");

// Глобальная переменная для хранения переводов
let translations = {};

// Відкриття налаштувань
openSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "block";
});

// Закриття налаштувань
closeSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

// Функція зміни мови
function updateLanguage(translations, lang) {
    document.documentElement.lang = lang;
    localStorage.setItem("playerLanguage", lang);

    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Оновлення тестів
    if (document.getElementById("luscherModal")?.style.display === "flex") {
        document.getElementById("timer").textContent = translations[lang]["timerText"];
    }

    if (document.getElementById("mbtiModal")?.style.display === "flex") {
        displayMbtiQuestion();
    }

    if (document.getElementById("rhythmModal")?.style.display === "flex") {
        document.getElementById("rhythmResult").textContent = translations[lang]["bpm"];
        document.getElementById("rhythmTimer").textContent = translations[lang]["timeLeft"];
    }
}

// Функція завантаження перекладів
function loadTranslations() {
  fetch('language.json')
    .then(response => response.json())
    .then(data => {
      translations = data;
      const savedLang = localStorage.getItem("playerLanguage") || "uk";
      updateLanguage(translations, savedLang);
      document.getElementById("languageSelect").value = savedLang; // 🔥 ось ця стрічка важлива
    });
}

// Завантажуємо переклади при запуску
loadTranslations();

// Обробник зміни мови
languageSelect.addEventListener("change", () => {
    const selectedLang = languageSelect.value;
    updateLanguage(translations, selectedLang);
});

// Зміна кольору
document.addEventListener("DOMContentLoaded", () => {
    const playerColorPicker = document.getElementById("playerColor");
    const playerContainer = document.querySelector(".container") || document.body;

    // Функція зміни кольору
    function updatePlayerColor(color) {
        playerContainer.style.backgroundColor = color;
        localStorage.setItem("playerColor", color);
    }

    // Завантажуємо збережений колір
    const savedColor = localStorage.getItem("playerColor") || "#222";
    playerContainer.style.backgroundColor = savedColor;
    playerColorPicker.value = savedColor;

    // Оновлюємо колір при виборі користувачем
    playerColorPicker.addEventListener("input", () => {
        updatePlayerColor(playerColorPicker.value);
    });
});
// SETTING



// Завантаження пісень
// === Модальне вікно для завантаження пісень === //
document.addEventListener("DOMContentLoaded", () => {
  const openUploadModalBtn = document.getElementById("openUploadModal");
  const closeUploadModalBtn = document.getElementById("closeUploadModal");
  const uploadModal = document.getElementById("uploadModal");
  const uploadForm = document.getElementById("uploadForm");

  // Відкрити вікно
  openUploadModalBtn?.addEventListener("click", () => {
    uploadModal.style.display = "block";
  });

  // Закрити вікно
  closeUploadModalBtn?.addEventListener("click", () => {
    uploadModal.style.display = "none";
  });

  // Обробка форми
  uploadForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(uploadForm);

    fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.text())
      .then(msg => {
        console.log(msg);
        loadSongs(); // оновлюємо список
        uploadForm.reset(); // очищаємо форму
        uploadModal.style.display = "none"; // ховаємо модальне вікно
      })
      .catch(err => console.error("Помилка при завантаженні:", err));
  });
});


// Downloading a song

// Ініціалізація програвача
init();