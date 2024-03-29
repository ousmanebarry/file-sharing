const fs = require('fs');
require('dotenv').config();
const bcrypt = require('bcrypt');
const multer = require('multer');
const express = require('express');
const { storage, firestore } = require('./database/firebase');
const { doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');
const {
  ref,
  uploadBytes,
  getBytes,
  deleteObject,
} = require('firebase/storage');

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

  const id = req.file.filename;
  const fileRef = ref(storage, id);
  const file = fs.readFileSync(fileData.path);

  if (req.body.password != null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  await setDoc(doc(firestore, 'File', id), fileData);
  console.log(file);
  await uploadBytes(fileRef, file).catch((err) => {
    console.log(err);
  });

  res.render('upload', { fileLink: `${req.headers.origin}/file/${id}` });
});

app.route('/file/:id').get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  const fileDataRef = doc(firestore, 'File', req.params.id);
  const fileSnap = await getDoc(fileDataRef);

  if (!fileSnap.exists()) {
    res.redirect('/');
  } else {
    const fileData = fileSnap.data();

    const storedFileRef = ref(
      storage,
      `gs://${process.env.storageBucket}/${fileDataRef.id}`
    );

    const fileBytes = await getBytes(storedFileRef);
    fs.writeFileSync(`uploads/${fileDataRef.id}`, Buffer.from(fileBytes));

    if (fileData.password != null && fileData.password !== '') {
      if (req.body.password == null) {
        res.render('password');
        return;
      }

      if (!(await bcrypt.compare(req.body.password, fileData.password))) {
        res.render('password', { error: true });
        return;
      }
    }

    res.download(fileData.path, fileData.originalName);

    res.on('finish', async () => {
      await deleteObject(storedFileRef);
      await deleteDoc(fileDataRef);
    });
  }
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
});
