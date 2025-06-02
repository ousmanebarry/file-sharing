const express = require('express');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Use file routes
app.use('/', fileRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on port http://localhost:${PORT}`));

module.exports = app;
