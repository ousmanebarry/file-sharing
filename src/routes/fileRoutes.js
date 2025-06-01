const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleFileUpload, handleFileDownload, downloadFile } = require('../controllers/fileController');

const upload = multer({ dest: 'uploads' });

// Home page
router.get('/', (req, res) => {
	res.render('index', { fileLink: req.query.fileLink });
});

// File upload
router.post('/', upload.single('file'), handleFileUpload);

// File download routes
router.route('/file/:id').get(handleFileDownload).post(handleFileDownload);

// Actual file download
router.get('/download/:id', downloadFile);

module.exports = router;
