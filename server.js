const app = require('./app');
const db = require('./db');

const { connectDB } = db;
connectDB();

PORT = process.env.PORT || 8000;
// server start
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

// fundamental aspect of debugging: set break points
