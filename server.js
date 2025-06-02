const express = require('express');
const fileRoutes = require('./src/routes/fileRoutes');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Use file routes
app.use('/', fileRoutes);

module.exports = app;

if (require.main === module) {
	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Server started on http://localhost:${port}`);
	});
}
