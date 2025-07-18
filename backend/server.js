require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const indexRouter = require('./routes/index.route');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(
  cors({
    // origin: [ 'https://hms.clickmasters.pk' ], // or '*' temporarily
    origin: [ 'http://localhost:5173' ], 
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
connectDB();

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; 

app.listen(PORT, HOST, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`
  );
});
