const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.ejs');
  console.log(req);
});

app.post('/upload', (req, res) => {
  res.send('hi');
});

app.listen(3000);
