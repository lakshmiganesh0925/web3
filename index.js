const express = require('express');
const connectDB = require('./config/db');
const restakerRoutes = require('./routes/restakers');
const validatorRoutes = require('./routes/validators');
const rewardRoutes = require('./routes/rewards');
const indexRoutes = require('./routes/index');
require('dotenv').config();

const app = express();


connectDB();


app.use(express.json());


app.use('/api', indexRoutes);
app.use('/api/restakers', restakerRoutes);
app.use('/api/validators', validatorRoutes);
app.use('/api/rewards', rewardRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});