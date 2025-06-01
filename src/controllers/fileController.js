const fs = require('fs');
const bcrypt = require('bcrypt');
const { doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');
const { ref, uploadBytes, getBytes, deleteObject } = require('firebase/storage');
const { storage, firestore } = require('../config/firebase');

const handleFileUpload = async (req, res) => {
	const fileData = {
		path: req.file.path,
		originalName: req.file.originalname,
		password: req.body.password,
		deleteAfterDownload: req.body.deleteAfterDownload === 'on',
	};

	const id = req.file.filename;
	const fileRef = ref(storage, id);
	const file = fs.readFileSync(fileData.path);

	if (req.body.password != null && req.body.password !== '') {
		fileData.password = await bcrypt.hash(req.body.password, 10);
	}

	await setDoc(doc(firestore, 'File', id), fileData);

	await uploadBytes(fileRef, file).catch((err) => {
		console.log(err);
	});

	res.redirect(`/?fileLink=${encodeURIComponent(`${req.headers.origin}/file/${id}`)}`);
};

const handleFileDownload = async (req, res) => {
	const fileDataRef = doc(firestore, 'File', req.params.id);
	const fileSnap = await getDoc(fileDataRef);

	if (!fileSnap.exists()) {
		res.redirect('/');
		return;
	}

	const fileData = fileSnap.data();
	const storedFileRef = ref(storage, `gs://${process.env.storageBucket}/${fileDataRef.id}`);

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

	res.render('password', {
		success: true,
		downloadUrl: `/download/${fileDataRef.id}?filename=${encodeURIComponent(fileData.originalName)}`,
	});
};

const downloadFile = async (req, res) => {
	const fileDataRef = doc(firestore, 'File', req.params.id);
	const fileSnap = await getDoc(fileDataRef);

	if (!fileSnap.exists()) {
		return res.status(404).send('File not found');
	}

	const fileData = fileSnap.data();
	const storedFileRef = ref(storage, `gs://${process.env.storageBucket}/${fileDataRef.id}`);
	const fileBytes = await getBytes(storedFileRef);

	fs.writeFileSync(`uploads/${fileDataRef.id}`, Buffer.from(fileBytes));
	res.download(`uploads/${fileDataRef.id}`, req.query.filename);

	res.on('finish', async () => {
		if (fileData.deleteAfterDownload) {
			await deleteObject(storedFileRef);
			await deleteDoc(fileDataRef);
		}
	});
};

module.exports = {
	handleFileUpload,
	handleFileDownload,
	downloadFile,
};
