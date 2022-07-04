require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { ref, uploadBytes, getBytes } = require('firebase/storage');
const { storage, firestore } = require('./database/firebase');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads' });

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

  const newId = req.file.path.slice(8);

  console.log(fileData, newId);

  if (req.body.password != null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  const fileRef = ref(storage, newId);

  await setDoc(doc(firestore, 'File', newId), fileData);
  await uploadBytes(fileRef, fs.readFileSync(fileData.path));

  res.render('upload', { fileLink: `${req.headers.origin}/file/${newId}` });
});

app.route('/file/:id').get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  const fileDataRef = doc(firestore, 'File', req.params.id);
  const fileSnap = await getDoc(fileDataRef);

  const storedFileRef = ref(
    storage,
    `gs://${process.env.storageBucket}/${fileDataRef.id}`
  );

  const fileBytes = await getBytes(storedFileRef);
  fs.writeFileSync(`uploads/${fileDataRef.id}`, Buffer.from(fileBytes));

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

  const fileData = fileSnap.data();

  res.download(fileData.path, fileData.originalName, (err) => {
    fs.unlinkSync(__dirname + '\\' + fileData.path);
  });
}

app.listen(process.env.PORT || 3000);
