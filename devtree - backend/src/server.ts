import express from 'express'
import 'dotenv/config'
import router from './router';
import { connectDB } from './config/db';

const app = express();

connectDB();

// Leer datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/api', router)

export default app