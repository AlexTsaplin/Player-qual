const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(express.json());
app.use(express.static(__dirname));

// Унікальне ім’я для збереження файлу
function generateUniqueFileName(dir, originalName) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-]/g, '')
    .slice(0, 30);

  let name = `${Date.now()}_${base}${ext}`;
  let filePath = path.join(dir, name);
  let counter = 1;

  while (fs.existsSync(filePath)) {
    name = `${Date.now()}_${base}_${counter}${ext}`;
    filePath = path.join(dir, name);
    counter++;
  }

  return name;
}

// Завантаження пісень
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.audio) {
    return res.status(400).send('Файл не надіслано');
  }

  const audio = req.files.audio;
  const cover = req.files.cover;

  const audioName = generateUniqueFileName(path.join(__dirname, 'data/audio'), audio.name);
  const coverName = cover ? generateUniqueFileName(path.join(__dirname, 'data/image'), cover.name) : 'default.jpg';

  const audioPath = path.join(__dirname, 'data', 'audio', audioName);
  const coverPath = path.join(__dirname, 'data', 'image', coverName);
  const songsPath = path.join(__dirname, 'songs.json');

  audio.mv(audioPath, err => {
    if (err) return res.status(500).send(err);

    if (cover) {
      cover.mv(coverPath, err => {
        if (err) return res.status(500).send(err);
        saveSongEntry();
      });
    } else {
      saveSongEntry();
    }

    function saveSongEntry() {
      const songs = JSON.parse(fs.readFileSync(songsPath));

      // 🔴 Обробка кольорів
      const color1 = req.body.color1?.trim().toLowerCase();
      const color2 = req.body.color2?.trim().toLowerCase();

      const colors = {};
      if (color1) colors[color1] = 100;
      if (color2 && color2 !== color1) colors[color2] = 50;

      const newSong = {
        id: songs.length,
        title: req.body.title || audioName.replace('.mp3', ''),
        artist: req.body.artist || 'Unknown Artist',
        img_src: cover ? coverName : 'default.jpg',
        src: audioName,
        genre: req.body.genre || 'unknown',
        colors
      };

      songs.push(newSong);
      fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
      res.send('Пісня успішно завантажена 🎵');
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🎶 Сервер працює: http://localhost:${PORT}/player.html`);
});
