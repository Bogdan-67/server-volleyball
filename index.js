const express = require('express');
const userRouter = require('./routes/user.routes');
const accountRouter = require('./routes/account.routes');

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', userRouter);
app.use('/api', accountRouter);

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
