import express, { Application, Request, Response } from 'express';
import fs from "fs";
import path from "path";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { notFound } from './app/middlewares/notFound';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { PaymentControllers } from './app/modules/payment/payment.controller';
import { AppRoutes } from './app/routes';

const app: Application = express();
const openApiPath = path.resolve(process.cwd(), "docs", "openapi.yaml");
const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));

app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), PaymentControllers.handleStripeWebhook);

// parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/docs/openapi.yaml", (req: Request, res: Response) => {
  res.sendFile(openApiPath);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));


app.use('/api/v1', AppRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.send('Server is running!');
});



app.use(globalErrorHandler);
app.use(notFound)

export default app;
