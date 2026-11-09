import './config/loadEnv.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';
import { logger } from './middleware/logEvents.js';
import ensureBody from './middleware/ensureBody.js';
import registerRouter from './routes/register.js';
import manageMenuRouter from './routes/api/manageMenu.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import verifyJWT from './middleware/verifyJWT.js';
import refreshRouter from './routes/refresh.js';
import logoutRouter from './routes/logout.js';
import orderRouter from './routes/api/manageOrder.js';
import healthCheckerRouter from './routes/health.js';
import { authLimiter, registerLimiter } from './middleware/rateLimiters.js';
const app = express();
app.set('trust proxy', 1);

app.use(helmet());
 
app.use(cors(corsOptions))

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(express.json({ limit: '10kb' }));
app.use(ensureBody);

app.use(cookieParser());

app.use(logger);

app.use('/register', registerLimiter, registerRouter);
app.use('/auth', authLimiter, authRouter);
app.use('/refresh', refreshRouter);
app.use('/logout', logoutRouter);
app.use('/order', verifyJWT, orderRouter);
app.use('/manageMenu', verifyJWT, manageMenuRouter);
app.use('/health', healthCheckerRouter);


export default app;