import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFound } from './app/middlewares/notFound';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { AppRoutes } from './app/routes';

const app: Application = express();

// parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());



app.use('/api/v1', AppRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});



app.use(globalErrorHandler);
app.use(notFound)

export default app;
