// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/geocode', async (req, res) => {
  const address = req.query.address;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${AIzaSyC4SRvrsYOdzthLOJphJoBiOZGQaxNCPR4}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if(!response.status === "OK"){
      console.log("error!")
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geocode' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

 