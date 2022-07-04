require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose'); // remove
const bcrypt = require('bcrypt');
const File = require('./models/File'); // remove
const { collection, addDoc, getDocs } = require('firebase/firestore');
const { ref, uploadBytes, getBytes } = require('firebase/storage');
const { storage, firestore } = require('./database/firebase');
const fs = require('fs'); // remove

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

  const docRef = await addDoc(collection(firestore, 'File'), fileData);

  const fileRef = ref(storage, docRef.id);

  await uploadBytes(fileRef, fs.readFileSync(fileData.path));

  const file = await File.create(fileData);

  // docRef.id is the id of the file in the database
  res.render('upload', { fileLink: `${req.headers.origin}/file/${file.id}` });
});

app.route('/file/:id').get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  // const file = await File.findById(req.params.id);

  const fileRef = ref(
    storage,
    `gs://${process.env.storageBucket}/${req.params.id}`
  );

  const fileBytes = await getBytes(fileRef);
  fs.writeFileSync('uploads/test.png', Buffer.from(fileBytes));

  // if (file.password != null && file.password !== '') {
  //   if (req.body.password == null) {
  //     res.render('password');
  //     return;
  //   }

  //   if (!(await bcrypt.compare(req.body.password, file.password))) {
  //     res.render('password', { error: true });
  //     return;
  //   }
  // }

  // res.download(file.path, file.originalName, (err) => {
  //   fs.unlinkSync(__dirname + '\\' + file.path);
  // });

  // await file.delete();
}

app.listen(process.env.PORT || 3000);
