const express = require('express');
const fileRoutes = require('./src/routes/fileRoutes');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Use file routes
app.use('/', fileRoutes);

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
});
