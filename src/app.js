import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const __dirname = path.resolve();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    // origin:process.env.CORS_ORIGIN  //to allow the link to excess
    origin: 'https://notenest-junaid.netlify.app',
    credentials: true
 }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})


import { verifyJWT } from './middlewares/auth.middleware.js';
app.get('/dashboard', verifyJWT, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})


app.use(express.static(path.join(__dirname, 'public')));


//import routes
import userRouter from './routes/user.routes.js';
import noteRouter from './routes/note.routes.js';

//route declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notes', noteRouter);

export default app;