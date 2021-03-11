const app = require('./app');
const db = require('./db');

const { connectDB } = db;
connectDB();

// unhandled rejections are from outside sources, such as failing to connect to db, authentication, etc
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting Down... :(');
});

// uncaught exceptions: async bugs
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION! Shutting Down... :(');
  console.log(err.name, err.message);
  server.close(() => {
    // allows server to finish whatever it is doing before exiting process
    process.exit(1);
    // process is a must to exit on uncaught exceptions!
    // may have to write script to restart in case of shut down
    // some host services do it automatically for you
  });
});

PORT = process.env.PORT || 8000;
// server start
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

// fundamental aspect of debugging: set break points
