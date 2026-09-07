import express from 'express';
const PORT = 3500;
const app = express();

import logger from './middleware/logEvents.js';
import registerRouter from './routes/register.js';


app.use(logger);

app.use('/register', registerRouter);





app.listen(PORT, () => {console.log(`server running on port ${PORT}`)});
