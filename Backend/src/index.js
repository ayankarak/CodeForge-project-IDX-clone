import express from 'express';
import cors from 'cors';
import { port }from './config/serverConfig.js';
import apiRouter from './routes/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use ('/api', apiRouter);

app.get('/', (req, res) => {
  return res.json({'message': 'Hello, World!'});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});