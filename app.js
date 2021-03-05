const express = require('express');

const app = express();

PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server', app: 'NaTours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint!');
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
