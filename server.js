require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const File = require('./models/File');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads' });

mongoose.connect(process.env.DATABASE_URL);

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
    password: req.body.password,
  };

  console.log(fileData);

  if (req.body.password != null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  const file = await File.create(fileData);

  res.render('upload', { fileLink: `${req.headers.origin}/file/${file.id}` });
});

app.route('/file/:id').get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  const file = await File.findById(req.params.id);

  if (file.password != null && file.password !== '') {
    if (req.body.password == null) {
      res.render('password');
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render('password', { error: true });
      return;
    }
  }

  res.download(file.path, file.originalName, (err) => {
    fs.unlinkSync(__dirname + '\\' + file.path);
  });

  console.log(__dirname + '\\' + file.path);
  await file.delete();
}

app.listen(process.env.PORT || 3000);
