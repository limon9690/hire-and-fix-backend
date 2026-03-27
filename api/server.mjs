var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";

// src/app/config/env.ts
import "dotenv/config";
var setEnvVariables = () => {
  const envVars2 = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BCRYPT_SALT_ROUNDS",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "CLIENT_SUCCESS_URL",
    "CLIENT_CANCEL_URL",
    "FRONTEND_URLS"
  ];
  envVars2.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CLIENT_SUCCESS_URL: process.env.CLIENT_SUCCESS_URL,
    CLIENT_CANCEL_URL: process.env.CLIENT_CANCEL_URL,
    STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || "usd",
    FRONTEND_URLS: process.env.FRONTEND_URLS
  };
};
var envVars = setEnvVariables();

// src/app/middlewares/notFound.ts
import status from "http-status";
var notFound = (req, res) => {
  const errorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorSources: [
      {
        path: req.originalUrl,
        message: "API endpoint not found"
      }
    ]
  };
  res.status(status.NOT_FOUND).json(errorResponse);
};

// prisma/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Booking {\n  id             String        @id @default(uuid())\n  userId         String        @map("user_id")\n  vendorId       String        @map("vendor_id")\n  employeeId     String        @map("employee_id")\n  startTime      DateTime      @map("start_time")\n  endTime        DateTime      @map("end_time")\n  serviceAddress String        @map("service_address")\n  note           String?\n  totalPrice     Decimal       @map("total_price") @db.Decimal(10, 2)\n  bookingStatus  BookingStatus @default(PENDING) @map("booking_status")\n  paymentStatus  PaymentStatus @default(PENDING) @map("payment_status")\n  createdAt      DateTime      @default(now()) @map("created_at")\n  updatedAt      DateTime      @updatedAt @map("updated_at")\n\n  user     User            @relation(fields: [userId], references: [id])\n  vendor   VendorProfile   @relation(fields: [vendorId], references: [id])\n  employee EmployeeProfile @relation(fields: [employeeId], references: [id])\n  payment  Payment?\n  review   Review?\n\n  @@map("bookings")\n}\n\nmodel EmployeeProfile {\n  id                String   @id @default(uuid())\n  userId            String   @unique @map("user_id")\n  vendorId          String   @map("vendor_id")\n  serviceCategoryId String   @map("service_category_id")\n  profilePhoto      String   @map("profile_photo")\n  bio               String\n  address           String\n  phone             String\n  hourlyRate        Decimal  @map("hourly_rate") @db.Decimal(10, 2)\n  experienceYears   Int      @map("experience_years")\n  isActive          Boolean  @default(true) @map("is_active")\n  isDeleted         Boolean  @default(false) @map("is_deleted")\n  createdAt         DateTime @default(now()) @map("created_at")\n  updatedAt         DateTime @updatedAt @map("updated_at")\n\n  user            User            @relation(fields: [userId], references: [id])\n  vendor          VendorProfile   @relation(fields: [vendorId], references: [id])\n  serviceCategory ServiceCategory @relation(fields: [serviceCategoryId], references: [id])\n  bookings        Booking[]\n  reviews         Review[]\n\n  @@map("employee_profiles")\n}\n\nenum Role {\n  USER\n  VENDOR\n  EMPLOYEE\n  ADMIN\n}\n\nenum BookingStatus {\n  PENDING\n  ACCEPTED\n  IN_PROGRESS\n  COMPLETED\n  REJECTED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCESSFUL\n  FAILED\n}\n\nmodel Payment {\n  id            String        @id @default(uuid())\n  bookingId     String        @unique @map("booking_id")\n  amount        Decimal       @db.Decimal(10, 2)\n  paymentMethod String        @map("payment_method")\n  transactionId String?       @map("transaction_id")\n  status        PaymentStatus @default(PENDING)\n  paidAt        DateTime?     @map("paid_at")\n  createdAt     DateTime      @default(now()) @map("created_at")\n  updatedAt     DateTime      @updatedAt @map("updated_at")\n\n  booking Booking @relation(fields: [bookingId], references: [id])\n\n  @@map("payments")\n}\n\nmodel Review {\n  id         String   @id @default(uuid())\n  userId     String   @map("user_id")\n  employeeId String   @map("employee_id")\n  bookingId  String   @unique @map("booking_id")\n  comment    String?\n  rating     Int\n  createdAt  DateTime @default(now()) @map("created_at")\n  updatedAt  DateTime @updatedAt @map("updated_at")\n\n  user     User            @relation(fields: [userId], references: [id])\n  employee EmployeeProfile @relation(fields: [employeeId], references: [id])\n  booking  Booking         @relation(fields: [bookingId], references: [id])\n\n  @@map("reviews")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel ServiceCategory {\n  id          String  @id @default(uuid())\n  name        String  @unique\n  description String?\n\n  employees EmployeeProfile[]\n\n  @@map("service_categories")\n}\n\nmodel User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  name      String\n  password  String\n  role      Role     @default(USER)\n  createdAt DateTime @default(now()) @map("created_at")\n  updatedAt DateTime @updatedAt @map("updated_at")\n\n  profile         UserProfile?\n  vendorProfile   VendorProfile?\n  employeeProfile EmployeeProfile?\n  bookings        Booking[]\n  reviews         Review[]\n\n  @@map("users")\n}\n\nmodel UserProfile {\n  id           String   @id @default(uuid())\n  userId       String   @unique @map("user_id")\n  profilePhoto String?  @map("profile_photo")\n  phone        String?\n  address      String?\n  isActive     Boolean  @default(true) @map("is_active")\n  createdAt    DateTime @default(now()) @map("created_at")\n  updatedAt    DateTime @updatedAt @map("updated_at")\n\n  user User @relation(fields: [userId], references: [id])\n\n  @@map("user_profiles")\n}\n\nmodel VendorProfile {\n  id          String   @id @default(uuid())\n  userId      String   @unique @map("user_id")\n  vendorName  String   @unique @map("vendor_name")\n  logo        String?\n  phone       String\n  description String\n  address     String\n  isApproved  Boolean  @default(false) @map("is_approved")\n  isActive    Boolean  @default(true) @map("is_active")\n  createdAt   DateTime @default(now()) @map("created_at")\n  updatedAt   DateTime @updatedAt @map("updated_at")\n\n  user      User              @relation(fields: [userId], references: [id])\n  employees EmployeeProfile[]\n  bookings  Booking[]\n\n  @@map("vendor_profiles")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"vendorId","kind":"scalar","type":"String","dbName":"vendor_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"startTime","kind":"scalar","type":"DateTime","dbName":"start_time"},{"name":"endTime","kind":"scalar","type":"DateTime","dbName":"end_time"},{"name":"serviceAddress","kind":"scalar","type":"String","dbName":"service_address"},{"name":"note","kind":"scalar","type":"String"},{"name":"totalPrice","kind":"scalar","type":"Decimal","dbName":"total_price"},{"name":"bookingStatus","kind":"enum","type":"BookingStatus","dbName":"booking_status"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus","dbName":"payment_status"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"vendor","kind":"object","type":"VendorProfile","relationName":"BookingToVendorProfile"},{"name":"employee","kind":"object","type":"EmployeeProfile","relationName":"BookingToEmployeeProfile"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingToPayment"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":"bookings"},"EmployeeProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"vendorId","kind":"scalar","type":"String","dbName":"vendor_id"},{"name":"serviceCategoryId","kind":"scalar","type":"String","dbName":"service_category_id"},{"name":"profilePhoto","kind":"scalar","type":"String","dbName":"profile_photo"},{"name":"bio","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Decimal","dbName":"hourly_rate"},{"name":"experienceYears","kind":"scalar","type":"Int","dbName":"experience_years"},{"name":"isActive","kind":"scalar","type":"Boolean","dbName":"is_active"},{"name":"isDeleted","kind":"scalar","type":"Boolean","dbName":"is_deleted"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeProfileToUser"},{"name":"vendor","kind":"object","type":"VendorProfile","relationName":"EmployeeProfileToVendorProfile"},{"name":"serviceCategory","kind":"object","type":"ServiceCategory","relationName":"EmployeeProfileToServiceCategory"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToEmployeeProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"EmployeeProfileToReview"}],"dbName":"employee_profiles"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String","dbName":"booking_id"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"paymentMethod","kind":"scalar","type":"String","dbName":"payment_method"},{"name":"transactionId","kind":"scalar","type":"String","dbName":"transaction_id"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paidAt","kind":"scalar","type":"DateTime","dbName":"paid_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToPayment"}],"dbName":"payments"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"bookingId","kind":"scalar","type":"String","dbName":"booking_id"},{"name":"comment","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"employee","kind":"object","type":"EmployeeProfile","relationName":"EmployeeProfileToReview"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"}],"dbName":"reviews"},"ServiceCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"employees","kind":"object","type":"EmployeeProfile","relationName":"EmployeeProfileToServiceCategory"}],"dbName":"service_categories"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"profile","kind":"object","type":"UserProfile","relationName":"UserToUserProfile"},{"name":"vendorProfile","kind":"object","type":"VendorProfile","relationName":"UserToVendorProfile"},{"name":"employeeProfile","kind":"object","type":"EmployeeProfile","relationName":"EmployeeProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"users"},"UserProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"profilePhoto","kind":"scalar","type":"String","dbName":"profile_photo"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean","dbName":"is_active"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserProfile"}],"dbName":"user_profiles"},"VendorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"vendorName","kind":"scalar","type":"String","dbName":"vendor_name"},{"name":"logo","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"isApproved","kind":"scalar","type":"Boolean","dbName":"is_approved"},{"name":"isActive","kind":"scalar","type":"Boolean","dbName":"is_active"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"UserToVendorProfile"},{"name":"employees","kind":"object","type":"EmployeeProfile","relationName":"EmployeeProfileToVendorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToVendorProfile"}],"dbName":"vendor_profiles"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","user","profile","orderBy","cursor","vendor","employees","_count","serviceCategory","bookings","employee","booking","reviews","vendorProfile","employeeProfile","payment","review","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","data","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","create","update","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","having","_avg","_sum","_min","_max","Booking.groupBy","Booking.aggregate","EmployeeProfile.findUnique","EmployeeProfile.findUniqueOrThrow","EmployeeProfile.findFirst","EmployeeProfile.findFirstOrThrow","EmployeeProfile.findMany","EmployeeProfile.createOne","EmployeeProfile.createMany","EmployeeProfile.createManyAndReturn","EmployeeProfile.updateOne","EmployeeProfile.updateMany","EmployeeProfile.updateManyAndReturn","EmployeeProfile.upsertOne","EmployeeProfile.deleteOne","EmployeeProfile.deleteMany","EmployeeProfile.groupBy","EmployeeProfile.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","ServiceCategory.findUnique","ServiceCategory.findUniqueOrThrow","ServiceCategory.findFirst","ServiceCategory.findFirstOrThrow","ServiceCategory.findMany","ServiceCategory.createOne","ServiceCategory.createMany","ServiceCategory.createManyAndReturn","ServiceCategory.updateOne","ServiceCategory.updateMany","ServiceCategory.updateManyAndReturn","ServiceCategory.upsertOne","ServiceCategory.deleteOne","ServiceCategory.deleteMany","ServiceCategory.groupBy","ServiceCategory.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","UserProfile.findUnique","UserProfile.findUniqueOrThrow","UserProfile.findFirst","UserProfile.findFirstOrThrow","UserProfile.findMany","UserProfile.createOne","UserProfile.createMany","UserProfile.createManyAndReturn","UserProfile.updateOne","UserProfile.updateMany","UserProfile.updateManyAndReturn","UserProfile.upsertOne","UserProfile.deleteOne","UserProfile.deleteMany","UserProfile.groupBy","UserProfile.aggregate","VendorProfile.findUnique","VendorProfile.findUniqueOrThrow","VendorProfile.findFirst","VendorProfile.findFirstOrThrow","VendorProfile.findMany","VendorProfile.createOne","VendorProfile.createMany","VendorProfile.createManyAndReturn","VendorProfile.updateOne","VendorProfile.updateMany","VendorProfile.updateManyAndReturn","VendorProfile.upsertOne","VendorProfile.deleteOne","VendorProfile.deleteMany","VendorProfile.groupBy","VendorProfile.aggregate","AND","OR","NOT","id","userId","vendorName","logo","phone","description","address","isApproved","isActive","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","profilePhoto","email","name","password","Role","role","employeeId","bookingId","comment","rating","amount","paymentMethod","transactionId","PaymentStatus","status","paidAt","vendorId","serviceCategoryId","bio","hourlyRate","experienceYears","isDeleted","startTime","endTime","serviceAddress","note","totalPrice","BookingStatus","bookingStatus","paymentStatus","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "rARNgAEVAQAA8AEAIAUAAJ4CACAKAACbAgAgDwAAnwIAIBAAAKACACCZAQAAnAIAMJoBAAANABCbAQAAnAIAMJwBAQAAAAGdAQEA7QEAIaUBQADvAQAhpgFAAO8BACG7AQEA7QEAIcUBAQDtAQAhywFAAO8BACHMAUAA7wEAIc0BAQDtAQAhzgEBAOwBACHPARAAkAIAIdEBAACdAtEBItIBAACRAsMBIgEAAAABACAMAQAA8AEAIJkBAAD0AQAwmgEAAAMAEJsBAAD0AQAwnAEBAO0BACGdAQEA7QEAIaABAQDsAQAhogEBAOwBACGkASAA7gEAIaUBQADvAQAhpgFAAO8BACG1AQEA7AEAIQEAAAADACARAQAA8AEAIAYAAPEBACAJAADyAQAgmQEAAOsBADCaAQAABQAQmwEAAOsBADCcAQEA7QEAIZ0BAQDtAQAhngEBAO0BACGfAQEA7AEAIaABAQDtAQAhoQEBAO0BACGiAQEA7QEAIaMBIADuAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhAQAAAAUAIBYBAADwAQAgBQAAngIAIAgAAKICACAJAADyAQAgDAAA_gEAIJkBAAChAgAwmgEAAAcAEJsBAAChAgAwnAEBAO0BACGdAQEA7QEAIaABAQDtAQAhogEBAO0BACGkASAA7gEAIaUBQADvAQAhpgFAAO8BACG1AQEA7QEAIcUBAQDtAQAhxgEBAO0BACHHAQEA7QEAIcgBEACQAgAhyQECAJoCACHKASAA7gEAIQUBAACFAwAgBQAAvwMAIAgAAOkDACAJAACHAwAgDAAAwQMAIBYBAADwAQAgBQAAngIAIAgAAKICACAJAADyAQAgDAAA_gEAIJkBAAChAgAwmgEAAAcAEJsBAAChAgAwnAEBAAAAAZ0BAQAAAAGgAQEA7QEAIaIBAQDtAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhtQEBAO0BACHFAQEA7QEAIcYBAQDtAQAhxwEBAO0BACHIARAAkAIAIckBAgCaAgAhygEgAO4BACEDAAAABwAgAwAACAAwBAAACQAgAwAAAAcAIAMAAAgAMAQAAAkAIAEAAAAHACAVAQAA8AEAIAUAAJ4CACAKAACbAgAgDwAAnwIAIBAAAKACACCZAQAAnAIAMJoBAAANABCbAQAAnAIAMJwBAQDtAQAhnQEBAO0BACGlAUAA7wEAIaYBQADvAQAhuwEBAO0BACHFAQEA7QEAIcsBQADvAQAhzAFAAO8BACHNAQEA7QEAIc4BAQDsAQAhzwEQAJACACHRAQAAnQLRASLSAQAAkQLDASIGAQAAhQMAIAUAAL8DACAKAADAAwAgDwAA5wMAIBAAAOgDACDOAQAAowIAIAMAAAANACADAAAOADAEAAABACAOAQAA8AEAIAoAAJsCACALAACTAgAgmQEAAJkCADCaAQAAEAAQmwEAAJkCADCcAQEA7QEAIZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhvAEBAO0BACG9AQEA7AEAIb4BAgCaAgAhBAEAAIUDACAKAADAAwAgCwAA3AMAIL0BAACjAgAgDgEAAPABACAKAACbAgAgCwAAkwIAIJkBAACZAgAwmgEAABAAEJsBAACZAgAwnAEBAAAAAZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhvAEBAAAAAb0BAQDsAQAhvgECAJoCACEDAAAAEAAgAwAAEQAwBAAAEgAgAQAAAA0AIAEAAAAQACADAAAADQAgAwAADgAwBAAAAQAgAQAAAAcAIAEAAAANACABAAAABwAgAwAAAA0AIAMAAA4AMAQAAAEAIAMAAAAQACADAAARADAEAAASACABAAAADQAgAQAAABAAIA0LAACTAgAgmQEAAI8CADCaAQAAHgAQmwEAAI8CADCcAQEA7QEAIaUBQADvAQAhpgFAAO8BACG8AQEA7QEAIb8BEACQAgAhwAEBAO0BACHBAQEA7AEAIcMBAACRAsMBIsQBQACSAgAhAQAAAB4AIAEAAAAQACABAAAAAQAgAwAAAA0AIAMAAA4AMAQAAAEAIAMAAAANACADAAAOADAEAAABACADAAAADQAgAwAADgAwBAAAAQAgEgEAANECACAFAAD8AgAgCgAA0gIAIA8AANMCACAQAADUAgAgnAEBAAAAAZ0BAQAAAAGlAUAAAAABpgFAAAAAAbsBAQAAAAHFAQEAAAABywFAAAAAAcwBQAAAAAHNAQEAAAABzgEBAAAAAc8BEAAAAAHRAQAAANEBAtIBAAAAwwECARYAACUAIA2cAQEAAAABnQEBAAAAAaUBQAAAAAGmAUAAAAABuwEBAAAAAcUBAQAAAAHLAUAAAAABzAFAAAAAAc0BAQAAAAHOAQEAAAABzwEQAAAAAdEBAAAA0QEC0gEAAADDAQIBFgAAJwAwARYAACcAMBIBAAC8AgAgBQAA-gIAIAoAAL0CACAPAAC-AgAgEAAAvwIAIJwBAQCnAgAhnQEBAKcCACGlAUAAqgIAIaYBQACqAgAhuwEBAKcCACHFAQEApwIAIcsBQACqAgAhzAFAAKoCACHNAQEApwIAIc4BAQCoAgAhzwEQALgCACHRAQAAuQLRASLSAQAAugLDASICAAAAAQAgFgAAKgAgDZwBAQCnAgAhnQEBAKcCACGlAUAAqgIAIaYBQACqAgAhuwEBAKcCACHFAQEApwIAIcsBQACqAgAhzAFAAKoCACHNAQEApwIAIc4BAQCoAgAhzwEQALgCACHRAQAAuQLRASLSAQAAugLDASICAAAADQAgFgAALAAgAgAAAA0AIBYAACwAIAMAAAABACAdAAAlACAeAAAqACABAAAAAQAgAQAAAA0AIAYHAADiAwAgIwAA4wMAICQAAOYDACAlAADlAwAgJgAA5AMAIM4BAACjAgAgEJkBAACVAgAwmgEAADMAEJsBAACVAgAwnAEBAN0BACGdAQEA3QEAIaUBQADgAQAhpgFAAOABACG7AQEA3QEAIcUBAQDdAQAhywFAAOABACHMAUAA4AEAIc0BAQDdAQAhzgEBAN4BACHPARAAhgIAIdEBAACWAtEBItIBAACHAsMBIgMAAAANACADAAAyADAiAAAzACADAAAADQAgAwAADgAwBAAAAQAgAQAAAAkAIAEAAAAJACADAAAABwAgAwAACAAwBAAACQAgAwAAAAcAIAMAAAgAMAQAAAkAIAMAAAAHACADAAAIADAEAAAJACATAQAA_gIAIAUAAK4DACAIAAD_AgAgCQAAgAMAIAwAAIEDACCcAQEAAAABnQEBAAAAAaABAQAAAAGiAQEAAAABpAEgAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAcUBAQAAAAHGAQEAAAABxwEBAAAAAcgBEAAAAAHJAQIAAAABygEgAAAAAQEWAAA7ACAOnAEBAAAAAZ0BAQAAAAGgAQEAAAABogEBAAAAAaQBIAAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAHFAQEAAAABxgEBAAAAAccBAQAAAAHIARAAAAAByQECAAAAAcoBIAAAAAEBFgAAPQAwARYAAD0AMBMBAADgAgAgBQAArQMAIAgAAOECACAJAADiAgAgDAAA4wIAIJwBAQCnAgAhnQEBAKcCACGgAQEApwIAIaIBAQCnAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhtQEBAKcCACHFAQEApwIAIcYBAQCnAgAhxwEBAKcCACHIARAAuAIAIckBAgDFAgAhygEgAKkCACECAAAACQAgFgAAQAAgDpwBAQCnAgAhnQEBAKcCACGgAQEApwIAIaIBAQCnAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhtQEBAKcCACHFAQEApwIAIcYBAQCnAgAhxwEBAKcCACHIARAAuAIAIckBAgDFAgAhygEgAKkCACECAAAABwAgFgAAQgAgAgAAAAcAIBYAAEIAIAMAAAAJACAdAAA7ACAeAABAACABAAAACQAgAQAAAAcAIAUHAADdAwAgIwAA3gMAICQAAOEDACAlAADgAwAgJgAA3wMAIBGZAQAAlAIAMJoBAABJABCbAQAAlAIAMJwBAQDdAQAhnQEBAN0BACGgAQEA3QEAIaIBAQDdAQAhpAEgAN8BACGlAUAA4AEAIaYBQADgAQAhtQEBAN0BACHFAQEA3QEAIcYBAQDdAQAhxwEBAN0BACHIARAAhgIAIckBAgCCAgAhygEgAN8BACEDAAAABwAgAwAASAAwIgAASQAgAwAAAAcAIAMAAAgAMAQAAAkAIA0LAACTAgAgmQEAAI8CADCaAQAAHgAQmwEAAI8CADCcAQEAAAABpQFAAO8BACGmAUAA7wEAIbwBAQAAAAG_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_AQAwmgEAAJABABCbAQAA_wEAMJwBAQDdAQAhoQEBAN4BACG3AQEA3QEAIQMAAAB9ACADAACPAQAwIgAAkAEAIAMAAAB9ACADAAB-ADAEAAB6ACAPAgAA-wEAIAkAAPIBACAMAAD-AQAgDQAA_AEAIA4AAP0BACCZAQAA-QEAMJoBAACWAQAQmwEAAPkBADCcAQEAAAABpQFAAO8BACGmAUAA7wEAIbYBAQAAAAG3AQEA7QEAIbgBAQDtAQAhugEAAPoBugEiAQAAAJMBACABAAAAkwEAIA8CAAD7AQAgCQAA8gEAIAwAAP4BACANAAD8AQAgDgAA_QEAIJkBAAD5AQAwmgEAAJYBABCbAQAA-QEAMJwBAQDtAQAhpQFAAO8BACGmAUAA7wEAIbYBAQDtAQAhtwEBAO0BACG4AQEA7QEAIboBAAD6AboBIgUCAAC-AwAgCQAAhwMAIAwAAMEDACANAAC_AwAgDgAAwAMAIAMAAACWAQAgAwAAlwEAMAQAAJMBACADAAAAlgEAIAMAAJcBADAEAACTAQAgAwAAAJYBACADAACXAQAwBAAAkwEAIAwCAAC5AwAgCQAAvAMAIAwAAL0DACANAAC6AwAgDgAAuwMAIJwBAQAAAAGlAUAAAAABpgFAAAAAAbYBAQAAAAG3AQEAAAABuAEBAAAAAboBAAAAugECARYAAJsBACAHnAEBAAAAAaUBQAAAAAGmAUAAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABugEAAAC6AQIBFgAAnQEAMAEWAACdAQAwDAIAAJEDACAJAACUAwAgDAAAlQMAIA0AAJIDACAOAACTAwAgnAEBAKcCACGlAUAAqgIAIaYBQACqAgAhtgEBAKcCACG3AQEApwIAIbgBAQCnAgAhugEAAJADugEiAgAAAJMBACAWAACgAQAgB5wBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbYBAQCnAgAhtwEBAKcCACG4AQEApwIAIboBAACQA7oBIgIAAACWAQAgFgAAogEAIAIAAACWAQAgFgAAogEAIAMAAACTAQAgHQAAmwEAIB4AAKABACABAAAAkwEAIAEAAACWAQAgAwcAAI0DACAlAACPAwAgJgAAjgMAIAqZAQAA9QEAMJoBAACpAQAQmwEAAPUBADCcAQEA3QEAIaUBQADgAQAhpgFAAOABACG2AQEA3QEAIbcBAQDdAQAhuAEBAN0BACG6AQAA9gG6ASIDAAAAlgEAIAMAAKgBADAiAACpAQAgAwAAAJYBACADAACXAQAwBAAAkwEAIAwBAADwAQAgmQEAAPQBADCaAQAAAwAQmwEAAPQBADCcAQEAAAABnQEBAAAAAaABAQDsAQAhogEBAOwBACGkASAA7gEAIaUBQADvAQAhpgFAAO8BACG1AQEA7AEAIQEAAACsAQAgAQAAAKwBACAEAQAAhQMAIKABAACjAgAgogEAAKMCACC1AQAAowIAIAMAAAADACADAACvAQAwBAAArAEAIAMAAAADACADAACvAQAwBAAArAEAIAMAAAADACADAACvAQAwBAAArAEAIAkBAACMAwAgnAEBAAAAAZ0BAQAAAAGgAQEAAAABogEBAAAAAaQBIAAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAEBFgAAswEAIAicAQEAAAABnQEBAAAAAaABAQAAAAGiAQEAAAABpAEgAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAQEWAAC1AQAwARYAALUBADAJAQAAiwMAIJwBAQCnAgAhnQEBAKcCACGgAQEAqAIAIaIBAQCoAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhtQEBAKgCACECAAAArAEAIBYAALgBACAInAEBAKcCACGdAQEApwIAIaABAQCoAgAhogEBAKgCACGkASAAqQIAIaUBQACqAgAhpgFAAKoCACG1AQEAqAIAIQIAAAADACAWAAC6AQAgAgAAAAMAIBYAALoBACADAAAArAEAIB0AALMBACAeAAC4AQAgAQAAAKwBACABAAAAAwAgBgcAAIgDACAlAACKAwAgJgAAiQMAIKABAACjAgAgogEAAKMCACC1AQAAowIAIAuZAQAA8wEAMJoBAADBAQAQmwEAAPMBADCcAQEA3QEAIZ0BAQDdAQAhoAEBAN4BACGiAQEA3gEAIaQBIADfAQAhpQFAAOABACGmAUAA4AEAIbUBAQDeAQAhAwAAAAMAIAMAAMABADAiAADBAQAgAwAAAAMAIAMAAK8BADAEAACsAQAgEQEAAPABACAGAADxAQAgCQAA8gEAIJkBAADrAQAwmgEAAAUAEJsBAADrAQAwnAEBAAAAAZ0BAQAAAAGeAQEAAAABnwEBAOwBACGgAQEA7QEAIaEBAQDtAQAhogEBAO0BACGjASAA7gEAIaQBIADuAQAhpQFAAO8BACGmAUAA7wEAIQEAAADEAQAgAQAAAMQBACAEAQAAhQMAIAYAAIYDACAJAACHAwAgnwEAAKMCACADAAAABQAgAwAAxwEAMAQAAMQBACADAAAABQAgAwAAxwEAMAQAAMQBACADAAAABQAgAwAAxwEAMAQAAMQBACAOAQAAggMAIAYAAIMDACAJAACEAwAgnAEBAAAAAZ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGhAQEAAAABogEBAAAAAaMBIAAAAAGkASAAAAABpQFAAAAAAaYBQAAAAAEBFgAAywEAIAucAQEAAAABnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQAAAAGiAQEAAAABowEgAAAAAaQBIAAAAAGlAUAAAAABpgFAAAAAAQEWAADNAQAwARYAAM0BADAOAQAAqwIAIAYAAKwCACAJAACtAgAgnAEBAKcCACGdAQEApwIAIZ4BAQCnAgAhnwEBAKgCACGgAQEApwIAIaEBAQCnAgAhogEBAKcCACGjASAAqQIAIaQBIACpAgAhpQFAAKoCACGmAUAAqgIAIQIAAADEAQAgFgAA0AEAIAucAQEApwIAIZ0BAQCnAgAhngEBAKcCACGfAQEAqAIAIaABAQCnAgAhoQEBAKcCACGiAQEApwIAIaMBIACpAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhAgAAAAUAIBYAANIBACACAAAABQAgFgAA0gEAIAMAAADEAQAgHQAAywEAIB4AANABACABAAAAxAEAIAEAAAAFACAEBwAApAIAICUAAKYCACAmAAClAgAgnwEAAKMCACAOmQEAANwBADCaAQAA2QEAEJsBAADcAQAwnAEBAN0BACGdAQEA3QEAIZ4BAQDdAQAhnwEBAN4BACGgAQEA3QEAIaEBAQDdAQAhogEBAN0BACGjASAA3wEAIaQBIADfAQAhpQFAAOABACGmAUAA4AEAIQMAAAAFACADAADYAQAwIgAA2QEAIAMAAAAFACADAADHAQAwBAAAxAEAIA6ZAQAA3AEAMJoBAADZAQAQmwEAANwBADCcAQEA3QEAIZ0BAQDdAQAhngEBAN0BACGfAQEA3gEAIaABAQDdAQAhoQEBAN0BACGiAQEA3QEAIaMBIADfAQAhpAEgAN8BACGlAUAA4AEAIaYBQADgAQAhDgcAAOIBACAlAADqAQAgJgAA6gEAIKcBAQAAAAGoAQEAAAAEqQEBAAAABKoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA6QEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQ4HAADnAQAgJQAA6AEAICYAAOgBACCnAQEAAAABqAEBAAAABakBAQAAAAWqAQEAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAOYBACGvAQEAAAABsAEBAAAAAbEBAQAAAAEFBwAA4gEAICUAAOUBACAmAADlAQAgpwEgAAAAAa4BIADkAQAhCwcAAOIBACAlAADjAQAgJgAA4wEAIKcBQAAAAAGoAUAAAAAEqQFAAAAABKoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAA4QEAIQsHAADiAQAgJQAA4wEAICYAAOMBACCnAUAAAAABqAFAAAAABKkBQAAAAASqAUAAAAABqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAOEBACEIpwECAAAAAagBAgAAAASpAQIAAAAEqgECAAAAAasBAgAAAAGsAQIAAAABrQECAAAAAa4BAgDiAQAhCKcBQAAAAAGoAUAAAAAEqQFAAAAABKoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAA4wEAIQUHAADiAQAgJQAA5QEAICYAAOUBACCnASAAAAABrgEgAOQBACECpwEgAAAAAa4BIADlAQAhDgcAAOcBACAlAADoAQAgJgAA6AEAIKcBAQAAAAGoAQEAAAAFqQEBAAAABaoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA5gEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQinAQIAAAABqAECAAAABakBAgAAAAWqAQIAAAABqwECAAAAAawBAgAAAAGtAQIAAAABrgECAOcBACELpwEBAAAAAagBAQAAAAWpAQEAAAAFqgEBAAAAAasBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQDoAQAhrwEBAAAAAbABAQAAAAGxAQEAAAABDgcAAOIBACAlAADqAQAgJgAA6gEAIKcBAQAAAAGoAQEAAAAEqQEBAAAABKoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA6QEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQunAQEAAAABqAEBAAAABKkBAQAAAASqAQEAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAOoBACGvAQEAAAABsAEBAAAAAbEBAQAAAAERAQAA8AEAIAYAAPEBACAJAADyAQAgmQEAAOsBADCaAQAABQAQmwEAAOsBADCcAQEA7QEAIZ0BAQDtAQAhngEBAO0BACGfAQEA7AEAIaABAQDtAQAhoQEBAO0BACGiAQEA7QEAIaMBIADuAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhC6cBAQAAAAGoAQEAAAAFqQEBAAAABaoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA6AEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQunAQEAAAABqAEBAAAABKkBAQAAAASqAQEAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAOoBACGvAQEAAAABsAEBAAAAAbEBAQAAAAECpwEgAAAAAa4BIADlAQAhCKcBQAAAAAGoAUAAAAAEqQFAAAAABKoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAA4wEAIRECAAD7AQAgCQAA8gEAIAwAAP4BACANAAD8AQAgDgAA_QEAIJkBAAD5AQAwmgEAAJYBABCbAQAA-QEAMJwBAQDtAQAhpQFAAO8BACGmAUAA7wEAIbYBAQDtAQAhtwEBAO0BACG4AQEA7QEAIboBAAD6AboBItMBAACWAQAg1AEAAJYBACADsgEAAAcAILMBAAAHACC0AQAABwAgA7IBAAANACCzAQAADQAgtAEAAA0AIAuZAQAA8wEAMJoBAADBAQAQmwEAAPMBADCcAQEA3QEAIZ0BAQDdAQAhoAEBAN4BACGiAQEA3gEAIaQBIADfAQAhpQFAAOABACGmAUAA4AEAIbUBAQDeAQAhDAEAAPABACCZAQAA9AEAMJoBAAADABCbAQAA9AEAMJwBAQDtAQAhnQEBAO0BACGgAQEA7AEAIaIBAQDsAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhtQEBAOwBACEKmQEAAPUBADCaAQAAqQEAEJsBAAD1AQAwnAEBAN0BACGlAUAA4AEAIaYBQADgAQAhtgEBAN0BACG3AQEA3QEAIbgBAQDdAQAhugEAAPYBugEiBwcAAOIBACAlAAD4AQAgJgAA-AEAIKcBAAAAugECqAEAAAC6AQipAQAAALoBCK4BAAD3AboBIgcHAADiAQAgJQAA-AEAICYAAPgBACCnAQAAALoBAqgBAAAAugEIqQEAAAC6AQiuAQAA9wG6ASIEpwEAAAC6AQKoAQAAALoBCKkBAAAAugEIrgEAAPgBugEiDwIAAPsBACAJAADyAQAgDAAA_gEAIA0AAPwBACAOAAD9AQAgmQEAAPkBADCaAQAAlgEAEJsBAAD5AQAwnAEBAO0BACGlAUAA7wEAIaYBQADvAQAhtgEBAO0BACG3AQEA7QEAIbgBAQDtAQAhugEAAPoBugEiBKcBAAAAugECqAEAAAC6AQipAQAAALoBCK4BAAD4AboBIg4BAADwAQAgmQEAAPQBADCaAQAAAwAQmwEAAPQBADCcAQEA7QEAIZ0BAQDtAQAhoAEBAOwBACGiAQEA7AEAIaQBIADuAQAhpQFAAO8BACGmAUAA7wEAIbUBAQDsAQAh0wEAAAMAINQBAAADACATAQAA8AEAIAYAAPEBACAJAADyAQAgmQEAAOsBADCaAQAABQAQmwEAAOsBADCcAQEA7QEAIZ0BAQDtAQAhngEBAO0BACGfAQEA7AEAIaABAQDtAQAhoQEBAO0BACGiAQEA7QEAIaMBIADuAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAh0wEAAAUAINQBAAAFACAYAQAA8AEAIAUAAJ4CACAIAACiAgAgCQAA8gEAIAwAAP4BACCZAQAAoQIAMJoBAAAHABCbAQAAoQIAMJwBAQDtAQAhnQEBAO0BACGgAQEA7QEAIaIBAQDtAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhtQEBAO0BACHFAQEA7QEAIcYBAQDtAQAhxwEBAO0BACHIARAAkAIAIckBAgCaAgAhygEgAO4BACHTAQAABwAg1AEAAAcAIAOyAQAAEAAgswEAABAAILQBAAAQACAGmQEAAP8BADCaAQAAkAEAEJsBAAD_AQAwnAEBAN0BACGhAQEA3gEAIbcBAQDdAQAhBwYAAPEBACCZAQAAgAIAMJoBAAB9ABCbAQAAgAIAMJwBAQDtAQAhoQEBAOwBACG3AQEA7QEAIQuZAQAAgQIAMJoBAAB3ABCbAQAAgQIAMJwBAQDdAQAhnQEBAN0BACGlAUAA4AEAIaYBQADgAQAhuwEBAN0BACG8AQEA3QEAIb0BAQDeAQAhvgECAIICACENBwAA4gEAICMAAIQCACAkAADiAQAgJQAA4gEAICYAAOIBACCnAQIAAAABqAECAAAABKkBAgAAAASqAQIAAAABqwECAAAAAawBAgAAAAGtAQIAAAABrgECAIMCACENBwAA4gEAICMAAIQCACAkAADiAQAgJQAA4gEAICYAAOIBACCnAQIAAAABqAECAAAABKkBAgAAAASqAQIAAAABqwECAAAAAawBAgAAAAGtAQIAAAABrgECAIMCACEIpwEIAAAAAagBCAAAAASpAQgAAAAEqgEIAAAAAasBCAAAAAGsAQgAAAABrQEIAAAAAa4BCACEAgAhDJkBAACFAgAwmgEAAGEAEJsBAACFAgAwnAEBAN0BACGlAUAA4AEAIaYBQADgAQAhvAEBAN0BACG_ARAAhgIAIcABAQDdAQAhwQEBAN4BACHDAQAAhwLDASLEAUAAiAIAIQ0HAADiAQAgIwAAjgIAICQAAI4CACAlAACOAgAgJgAAjgIAIKcBEAAAAAGoARAAAAAEqQEQAAAABKoBEAAAAAGrARAAAAABrAEQAAAAAa0BEAAAAAGuARAAjQIAIQcHAADiAQAgJQAAjAIAICYAAIwCACCnAQAAAMMBAqgBAAAAwwEIqQEAAADDAQiuAQAAiwLDASILBwAA5wEAICUAAIoCACAmAACKAgAgpwFAAAAAAagBQAAAAAWpAUAAAAAFqgFAAAAAAasBQAAAAAGsAUAAAAABrQFAAAAAAa4BQACJAgAhCwcAAOcBACAlAACKAgAgJgAAigIAIKcBQAAAAAGoAUAAAAAFqQFAAAAABaoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAiQIAIQinAUAAAAABqAFAAAAABakBQAAAAAWqAUAAAAABqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAIoCACEHBwAA4gEAICUAAIwCACAmAACMAgAgpwEAAADDAQKoAQAAAMMBCKkBAAAAwwEIrgEAAIsCwwEiBKcBAAAAwwECqAEAAADDAQipAQAAAMMBCK4BAACMAsMBIg0HAADiAQAgIwAAjgIAICQAAI4CACAlAACOAgAgJgAAjgIAIKcBEAAAAAGoARAAAAAEqQEQAAAABKoBEAAAAAGrARAAAAABrAEQAAAAAa0BEAAAAAGuARAAjQIAIQinARAAAAABqAEQAAAABKkBEAAAAASqARAAAAABqwEQAAAAAawBEAAAAAGtARAAAAABrgEQAI4CACENCwAAkwIAIJkBAACPAgAwmgEAAB4AEJsBAACPAgAwnAEBAO0BACGlAUAA7wEAIaYBQADvAQAhvAEBAO0BACG_ARAAkAIAIcABAQDtAQAhwQEBAOwBACHDAQAAkQLDASLEAUAAkgIAIQinARAAAAABqAEQAAAABKkBEAAAAASqARAAAAABqwEQAAAAAawBEAAAAAGtARAAAAABrgEQAI4CACEEpwEAAADDAQKoAQAAAMMBCKkBAAAAwwEIrgEAAIwCwwEiCKcBQAAAAAGoAUAAAAAFqQFAAAAABaoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAigIAIRcBAADwAQAgBQAAngIAIAoAAJsCACAPAACfAgAgEAAAoAIAIJkBAACcAgAwmgEAAA0AEJsBAACcAgAwnAEBAO0BACGdAQEA7QEAIaUBQADvAQAhpgFAAO8BACG7AQEA7QEAIcUBAQDtAQAhywFAAO8BACHMAUAA7wEAIc0BAQDtAQAhzgEBAOwBACHPARAAkAIAIdEBAACdAtEBItIBAACRAsMBItMBAAANACDUAQAADQAgEZkBAACUAgAwmgEAAEkAEJsBAACUAgAwnAEBAN0BACGdAQEA3QEAIaABAQDdAQAhogEBAN0BACGkASAA3wEAIaUBQADgAQAhpgFAAOABACG1AQEA3QEAIcUBAQDdAQAhxgEBAN0BACHHAQEA3QEAIcgBEACGAgAhyQECAIICACHKASAA3wEAIRCZAQAAlQIAMJoBAAAzABCbAQAAlQIAMJwBAQDdAQAhnQEBAN0BACGlAUAA4AEAIaYBQADgAQAhuwEBAN0BACHFAQEA3QEAIcsBQADgAQAhzAFAAOABACHNAQEA3QEAIc4BAQDeAQAhzwEQAIYCACHRAQAAlgLRASLSAQAAhwLDASIHBwAA4gEAICUAAJgCACAmAACYAgAgpwEAAADRAQKoAQAAANEBCKkBAAAA0QEIrgEAAJcC0QEiBwcAAOIBACAlAACYAgAgJgAAmAIAIKcBAAAA0QECqAEAAADRAQipAQAAANEBCK4BAACXAtEBIgSnAQAAANEBAqgBAAAA0QEIqQEAAADRAQiuAQAAmALRASIOAQAA8AEAIAoAAJsCACALAACTAgAgmQEAAJkCADCaAQAAEAAQmwEAAJkCADCcAQEA7QEAIZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhvAEBAO0BACG9AQEA7AEAIb4BAgCaAgAhCKcBAgAAAAGoAQIAAAAEqQECAAAABKoBAgAAAAGrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIA4gEAIRgBAADwAQAgBQAAngIAIAgAAKICACAJAADyAQAgDAAA_gEAIJkBAAChAgAwmgEAAAcAEJsBAAChAgAwnAEBAO0BACGdAQEA7QEAIaABAQDtAQAhogEBAO0BACGkASAA7gEAIaUBQADvAQAhpgFAAO8BACG1AQEA7QEAIcUBAQDtAQAhxgEBAO0BACHHAQEA7QEAIcgBEACQAgAhyQECAJoCACHKASAA7gEAIdMBAAAHACDUAQAABwAgFQEAAPABACAFAACeAgAgCgAAmwIAIA8AAJ8CACAQAACgAgAgmQEAAJwCADCaAQAADQAQmwEAAJwCADCcAQEA7QEAIZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhxQEBAO0BACHLAUAA7wEAIcwBQADvAQAhzQEBAO0BACHOAQEA7AEAIc8BEACQAgAh0QEAAJ0C0QEi0gEAAJECwwEiBKcBAAAA0QECqAEAAADRAQipAQAAANEBCK4BAACYAtEBIhMBAADwAQAgBgAA8QEAIAkAAPIBACCZAQAA6wEAMJoBAAAFABCbAQAA6wEAMJwBAQDtAQAhnQEBAO0BACGeAQEA7QEAIZ8BAQDsAQAhoAEBAO0BACGhAQEA7QEAIaIBAQDtAQAhowEgAO4BACGkASAA7gEAIaUBQADvAQAhpgFAAO8BACHTAQAABQAg1AEAAAUAIA8LAACTAgAgmQEAAI8CADCaAQAAHgAQmwEAAI8CADCcAQEA7QEAIaUBQADvAQAhpgFAAO8BACG8AQEA7QEAIb8BEACQAgAhwAEBAO0BACHBAQEA7AEAIcMBAACRAsMBIsQBQACSAgAh0wEAAB4AINQBAAAeACAQAQAA8AEAIAoAAJsCACALAACTAgAgmQEAAJkCADCaAQAAEAAQmwEAAJkCADCcAQEA7QEAIZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhvAEBAO0BACG9AQEA7AEAIb4BAgCaAgAh0wEAABAAINQBAAAQACAWAQAA8AEAIAUAAJ4CACAIAACiAgAgCQAA8gEAIAwAAP4BACCZAQAAoQIAMJoBAAAHABCbAQAAoQIAMJwBAQDtAQAhnQEBAO0BACGgAQEA7QEAIaIBAQDtAQAhpAEgAO4BACGlAUAA7wEAIaYBQADvAQAhtQEBAO0BACHFAQEA7QEAIcYBAQDtAQAhxwEBAO0BACHIARAAkAIAIckBAgCaAgAhygEgAO4BACEJBgAA8QEAIJkBAACAAgAwmgEAAH0AEJsBAACAAgAwnAEBAO0BACGhAQEA7AEAIbcBAQDtAQAh0wEAAH0AINQBAAB9ACAAAAAAAdgBAQAAAAEB2AEBAAAAAQHYASAAAAABAdgBQAAAAAEFHQAA_AMAIB4AAKsEACDVAQAA_QMAINYBAACqBAAg2wEAAJMBACALHQAA1QIAMB4AANoCADDVAQAA1gIAMNYBAADXAgAw1wEAANgCACDYAQAA2QIAMNkBAADZAgAw2gEAANkCADDbAQAA2QIAMNwBAADbAgAw3QEAANwCADALHQAArgIAMB4AALMCADDVAQAArwIAMNYBAACwAgAw1wEAALECACDYAQAAsgIAMNkBAACyAgAw2gEAALICADDbAQAAsgIAMNwBAAC0AgAw3QEAALUCADAQAQAA0QIAIAoAANICACAPAADTAgAgEAAA1AIAIJwBAQAAAAGdAQEAAAABpQFAAAAAAaYBQAAAAAG7AQEAAAABywFAAAAAAcwBQAAAAAHNAQEAAAABzgEBAAAAAc8BEAAAAAHRAQAAANEBAtIBAAAAwwECAgAAAAEAIB0AANACACADAAAAAQAgHQAA0AIAIB4AALsCACABFgAAqQQAMBUBAADwAQAgBQAAngIAIAoAAJsCACAPAACfAgAgEAAAoAIAIJkBAACcAgAwmgEAAA0AEJsBAACcAgAwnAEBAAAAAZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhxQEBAO0BACHLAUAA7wEAIcwBQADvAQAhzQEBAO0BACHOAQEA7AEAIc8BEACQAgAh0QEAAJ0C0QEi0gEAAJECwwEiAgAAAAEAIBYAALsCACACAAAAtgIAIBYAALcCACAQmQEAALUCADCaAQAAtgIAEJsBAAC1AgAwnAEBAO0BACGdAQEA7QEAIaUBQADvAQAhpgFAAO8BACG7AQEA7QEAIcUBAQDtAQAhywFAAO8BACHMAUAA7wEAIc0BAQDtAQAhzgEBAOwBACHPARAAkAIAIdEBAACdAtEBItIBAACRAsMBIhCZAQAAtQIAMJoBAAC2AgAQmwEAALUCADCcAQEA7QEAIZ0BAQDtAQAhpQFAAO8BACGmAUAA7wEAIbsBAQDtAQAhxQEBAO0BACHLAUAA7wEAIcwBQADvAQAhzQEBAO0BACHOAQEA7AEAIc8BEACQAgAh0QEAAJ0C0QEi0gEAAJECwwEiDJwBAQCnAgAhnQEBAKcCACGlAUAAqgIAIaYBQACqAgAhuwEBAKcCACHLAUAAqgIAIcwBQACqAgAhzQEBAKcCACHOAQEAqAIAIc8BEAC4AgAh0QEAALkC0QEi0gEAALoCwwEiBdgBEAAAAAHeARAAAAAB3wEQAAAAAeABEAAAAAHhARAAAAABAdgBAAAA0QECAdgBAAAAwwECEAEAALwCACAKAAC9AgAgDwAAvgIAIBAAAL8CACCcAQEApwIAIZ0BAQCnAgAhpQFAAKoCACGmAUAAqgIAIbsBAQCnAgAhywFAAKoCACHMAUAAqgIAIc0BAQCnAgAhzgEBAKgCACHPARAAuAIAIdEBAAC5AtEBItIBAAC6AsMBIgUdAACXBAAgHgAApwQAINUBAACYBAAg1gEAAKYEACDbAQAAkwEAIAUdAACVBAAgHgAApAQAINUBAACWBAAg1gEAAKMEACDbAQAACQAgBx0AAMoCACAeAADNAgAg1QEAAMsCACDWAQAAzAIAINkBAAAeACDaAQAAHgAg2wEAAEwAIAcdAADAAgAgHgAAwwIAINUBAADBAgAg1gEAAMICACDZAQAAEAAg2gEAABAAINsBAAASACAJAQAAyAIAIAoAAMkCACCcAQEAAAABnQEBAAAAAaUBQAAAAAGmAUAAAAABuwEBAAAAAb0BAQAAAAG-AQIAAAABAgAAABIAIB0AAMACACADAAAAEAAgHQAAwAIAIB4AAMQCACALAAAAEAAgAQAAxgIAIAoAAMcCACAWAADEAgAgnAEBAKcCACGdAQEApwIAIaUBQACqAgAhpgFAAKoCACG7AQEApwIAIb0BAQCoAgAhvgECAMUCACEJAQAAxgIAIAoAAMcCACCcAQEApwIAIZ0BAQCnAgAhpQFAAKoCACGmAUAAqgIAIbsBAQCnAgAhvQEBAKgCACG-AQIAxQIAIQXYAQIAAAAB3gECAAAAAd8BAgAAAAHgAQIAAAAB4QECAAAAAQUdAACbBAAgHgAAoQQAINUBAACcBAAg1gEAAKAEACDbAQAAkwEAIAUdAACZBAAgHgAAngQAINUBAACaBAAg1gEAAJ0EACDbAQAACQAgAx0AAJsEACDVAQAAnAQAINsBAACTAQAgAx0AAJkEACDVAQAAmgQAINsBAAAJACAInAEBAAAAAaUBQAAAAAGmAUAAAAABvwEQAAAAAcABAQAAAAHBAQEAAAABwwEAAADDAQLEAUAAAAABAgAAAEwAIB0AAMoCACADAAAAHgAgHQAAygIAIB4AAM4CACAKAAAAHgAgFgAAzgIAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIb8BEAC4AgAhwAEBAKcCACHBAQEAqAIAIcMBAAC6AsMBIsQBQADPAgAhCJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIb8BEAC4AgAhwAEBAKcCACHBAQEAqAIAIcMBAAC6AsMBIsQBQADPAgAhAdgBQAAAAAEQAQAA0QIAIAoAANICACAPAADTAgAgEAAA1AIAIJwBAQAAAAGdAQEAAAABpQFAAAAAAaYBQAAAAAG7AQEAAAABywFAAAAAAcwBQAAAAAHNAQEAAAABzgEBAAAAAc8BEAAAAAHRAQAAANEBAtIBAAAAwwECAx0AAJcEACDVAQAAmAQAINsBAACTAQAgAx0AAJUEACDVAQAAlgQAINsBAAAJACADHQAAygIAINUBAADLAgAg2wEAAEwAIAMdAADAAgAg1QEAAMECACDbAQAAEgAgEQEAAP4CACAIAAD_AgAgCQAAgAMAIAwAAIEDACCcAQEAAAABnQEBAAAAAaABAQAAAAGiAQEAAAABpAEgAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAcYBAQAAAAHHAQEAAAAByAEQAAAAAckBAgAAAAHKASAAAAABAgAAAAkAIB0AAP0CACADAAAACQAgHQAA_QIAIB4AAN8CACABFgAAlAQAMBYBAADwAQAgBQAAngIAIAgAAKICACAJAADyAQAgDAAA_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_AIAIA8AANMCACAQAADUAgAgnAEBAAAAAZ0BAQAAAAGlAUAAAAABpgFAAAAAAcUBAQAAAAHLAUAAAAABzAFAAAAAAc0BAQAAAAHOAQEAAAABzwEQAAAAAdEBAAAA0QEC0gEAAADDAQICAAAAAQAgHQAA-wIAIAMAAAABACAdAAD7AgAgHgAA-QIAIAEWAACHBAAwAgAAAAEAIBYAAPkCACACAAAAtgIAIBYAAPgCACAMnAEBAKcCACGdAQEApwIAIaUBQACqAgAhpgFAAKoCACHFAQEApwIAIcsBQACqAgAhzAFAAKoCACHNAQEApwIAIc4BAQCoAgAhzwEQALgCACHRAQAAuQLRASLSAQAAugLDASIQAQAAvAIAIAUAAPoCACAPAAC-AgAgEAAAvwIAIJwBAQCnAgAhnQEBAKcCACGlAUAAqgIAIaYBQACqAgAhxQEBAKcCACHLAUAAqgIAIcwBQACqAgAhzQEBAKcCACHOAQEAqAIAIc8BEAC4AgAh0QEAALkC0QEi0gEAALoCwwEiBR0AAIIEACAeAACFBAAg1QEAAIMEACDWAQAAhAQAINsBAADEAQAgEAEAANECACAFAAD8AgAgDwAA0wIAIBAAANQCACCcAQEAAAABnQEBAAAAAaUBQAAAAAGmAUAAAAABxQEBAAAAAcsBQAAAAAHMAUAAAAABzQEBAAAAAc4BAQAAAAHPARAAAAAB0QEAAADRAQLSAQAAAMMBAgMdAACCBAAg1QEAAIMEACDbAQAAxAEAIBEBAAD-AgAgCAAA_wIAIAkAAIADACAMAACBAwAgnAEBAAAAAZ0BAQAAAAGgAQEAAAABogEBAAAAAaQBIAAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAHGAQEAAAABxwEBAAAAAcgBEAAAAAHJAQIAAAABygEgAAAAAQMdAACABAAg1QEAAIEEACDbAQAAkwEAIAMdAAD-AwAg1QEAAP8DACDbAQAAegAgBB0AAPICADDVAQAA8wIAMNcBAAD1AgAg2wEAALICADAEHQAA5AIAMNUBAADlAgAw1wEAAOcCACDbAQAA6AIAMAMdAAD8AwAg1QEAAP0DACDbAQAAkwEAIAQdAADVAgAw1QEAANYCADDXAQAA2AIAINsBAADZAgAwBB0AAK4CADDVAQAArwIAMNcBAACxAgAg2wEAALICADAFAgAAvgMAIAkAAIcDACAMAADBAwAgDQAAvwMAIA4AAMADACAAAAAAAAUdAAD3AwAgHgAA-gMAINUBAAD4AwAg1gEAAPkDACDbAQAAkwEAIAMdAAD3AwAg1QEAAPgDACDbAQAAkwEAIAAAAAHYAQAAALoBAgcdAAC0AwAgHgAAtwMAINUBAAC1AwAg1gEAALYDACDZAQAAAwAg2gEAAAMAINsBAACsAQAgBx0AAK8DACAeAACyAwAg1QEAALADACDWAQAAsQMAINkBAAAFACDaAQAABQAg2wEAAMQBACAHHQAAqAMAIB4AAKsDACDVAQAAqQMAINYBAACqAwAg2QEAAAcAINoBAAAHACDbAQAACQAgCx0AAJ8DADAeAACjAwAw1QEAAKADADDWAQAAoQMAMNcBAACiAwAg2AEAALICADDZAQAAsgIAMNoBAACyAgAw2wEAALICADDcAQAApAMAMN0BAAC1AgAwCx0AAJYDADAeAACaAwAw1QEAAJcDADDWAQAAmAMAMNcBAACZAwAg2AEAAOgCADDZAQAA6AIAMNoBAADoAgAw2wEAAOgCADDcAQAAmwMAMN0BAADrAgAwCQoAAMkCACALAADxAgAgnAEBAAAAAaUBQAAAAAGmAUAAAAABuwEBAAAAAbwBAQAAAAG9AQEAAAABvgECAAAAAQIAAAASACAdAACeAwAgAwAAABIAIB0AAJ4DACAeAACdAwAgARYAAPYDADACAAAAEgAgFgAAnQMAIAIAAADsAgAgFgAAnAMAIAecAQEApwIAIaUBQACqAgAhpgFAAKoCACG7AQEApwIAIbwBAQCnAgAhvQEBAKgCACG-AQIAxQIAIQkKAADHAgAgCwAA7wIAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbsBAQCnAgAhvAEBAKcCACG9AQEAqAIAIb4BAgDFAgAhCQoAAMkCACALAADxAgAgnAEBAAAAAaUBQAAAAAGmAUAAAAABuwEBAAAAAbwBAQAAAAG9AQEAAAABvgECAAAAARAFAAD8AgAgCgAA0gIAIA8AANMCACAQAADUAgAgnAEBAAAAAaUBQAAAAAGmAUAAAAABuwEBAAAAAcUBAQAAAAHLAUAAAAABzAFAAAAAAc0BAQAAAAHOAQEAAAABzwEQAAAAAdEBAAAA0QEC0gEAAADDAQICAAAAAQAgHQAApwMAIAMAAAABACAdAACnAwAgHgAApgMAIAEWAAD1AwAwAgAAAAEAIBYAAKYDACACAAAAtgIAIBYAAKUDACAMnAEBAKcCACGlAUAAqgIAIaYBQACqAgAhuwEBAKcCACHFAQEApwIAIcsBQACqAgAhzAFAAKoCACHNAQEApwIAIc4BAQCoAgAhzwEQALgCACHRAQAAuQLRASLSAQAAugLDASIQBQAA-gIAIAoAAL0CACAPAAC-AgAgEAAAvwIAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbsBAQCnAgAhxQEBAKcCACHLAUAAqgIAIcwBQACqAgAhzQEBAKcCACHOAQEAqAIAIc8BEAC4AgAh0QEAALkC0QEi0gEAALoCwwEiEAUAAPwCACAKAADSAgAgDwAA0wIAIBAAANQCACCcAQEAAAABpQFAAAAAAaYBQAAAAAG7AQEAAAABxQEBAAAAAcsBQAAAAAHMAUAAAAABzQEBAAAAAc4BAQAAAAHPARAAAAAB0QEAAADRAQLSAQAAAMMBAhEFAACuAwAgCAAA_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-gIAIAoAAL0CACAQAAC_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-gIAIAoAAL0CACAPAAC-AgAgnAEBAKcCACGdAQEApwIAIaUBQACqAgAhpgFAAKoCACG7AQEApwIAIcUBAQCnAgAhywFAAKoCACHMAUAAqgIAIc0BAQCnAgAhzgEBAKgCACHPARAAuAIAIdEBAAC5AtEBItIBAAC6AsMBIgecAQEAAAABnQEBAAAAAaUBQAAAAAGmAUAAAAABvAEBAAAAAb0BAQAAAAG-AQIAAAABAwAAAH0AIB0AAP4DACAeAACQBAAgBQAAAH0AIBYAAJAEACCcAQEApwIAIaEBAQCoAgAhtwEBAKcCACEDnAEBAKcCACGhAQEAqAIAIbcBAQCnAgAhAwAAAJYBACAdAACABAAgHgAAkwQAIA0AAACWAQAgAgAAkQMAIAkAAJQDACAMAACVAwAgDQAAkgMAIBYAAJMEACCcAQEApwIAIaUBQACqAgAhpgFAAKoCACG2AQEApwIAIbcBAQCnAgAhuAEBAKcCACG6AQAAkAO6ASILAgAAkQMAIAkAAJQDACAMAACVAwAgDQAAkgMAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbYBAQCnAgAhtwEBAKcCACG4AQEApwIAIboBAACQA7oBIg2cAQEAAAABnQEBAAAAAaABAQAAAAGiAQEAAAABpAEgAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAcYBAQAAAAHHAQEAAAAByAEQAAAAAckBAgAAAAHKASAAAAABEgEAAP4CACAFAACuAwAgCAAA_wIAIAwAAIEDACCcAQEAAAABnQEBAAAAAaABAQAAAAGiAQEAAAABpAEgAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAcUBAQAAAAHGAQEAAAABxwEBAAAAAcgBEAAAAAHJAQIAAAABygEgAAAAAQIAAAAJACAdAACVBAAgCwIAALkDACAMAAC9AwAgDQAAugMAIA4AALsDACCcAQEAAAABpQFAAAAAAaYBQAAAAAG2AQEAAAABtwEBAAAAAbgBAQAAAAG6AQAAALoBAgIAAACTAQAgHQAAlwQAIBIBAAD-AgAgBQAArgMAIAgAAP8CACAJAACAAwAgnAEBAAAAAZ0BAQAAAAGgAQEAAAABogEBAAAAAaQBIAAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAHFAQEAAAABxgEBAAAAAccBAQAAAAHIARAAAAAByQECAAAAAcoBIAAAAAECAAAACQAgHQAAmQQAIAsCAAC5AwAgCQAAvAMAIA0AALoDACAOAAC7AwAgnAEBAAAAAaUBQAAAAAGmAUAAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABugEAAAC6AQICAAAAkwEAIB0AAJsEACADAAAABwAgHQAAmQQAIB4AAJ8EACAUAAAABwAgAQAA4AIAIAUAAK0DACAIAADhAgAgCQAA4gIAIBYAAJ8EACCcAQEApwIAIZ0BAQCnAgAhoAEBAKcCACGiAQEApwIAIaQBIACpAgAhpQFAAKoCACGmAUAAqgIAIbUBAQCnAgAhxQEBAKcCACHGAQEApwIAIccBAQCnAgAhyAEQALgCACHJAQIAxQIAIcoBIACpAgAhEgEAAOACACAFAACtAwAgCAAA4QIAIAkAAOICACCcAQEApwIAIZ0BAQCnAgAhoAEBAKcCACGiAQEApwIAIaQBIACpAgAhpQFAAKoCACGmAUAAqgIAIbUBAQCnAgAhxQEBAKcCACHGAQEApwIAIccBAQCnAgAhyAEQALgCACHJAQIAxQIAIcoBIACpAgAhAwAAAJYBACAdAACbBAAgHgAAogQAIA0AAACWAQAgAgAAkQMAIAkAAJQDACANAACSAwAgDgAAkwMAIBYAAKIEACCcAQEApwIAIaUBQACqAgAhpgFAAKoCACG2AQEApwIAIbcBAQCnAgAhuAEBAKcCACG6AQAAkAO6ASILAgAAkQMAIAkAAJQDACANAACSAwAgDgAAkwMAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbYBAQCnAgAhtwEBAKcCACG4AQEApwIAIboBAACQA7oBIgMAAAAHACAdAACVBAAgHgAApQQAIBQAAAAHACABAADgAgAgBQAArQMAIAgAAOECACAMAADjAgAgFgAApQQAIJwBAQCnAgAhnQEBAKcCACGgAQEApwIAIaIBAQCnAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhtQEBAKcCACHFAQEApwIAIcYBAQCnAgAhxwEBAKcCACHIARAAuAIAIckBAgDFAgAhygEgAKkCACESAQAA4AIAIAUAAK0DACAIAADhAgAgDAAA4wIAIJwBAQCnAgAhnQEBAKcCACGgAQEApwIAIaIBAQCnAgAhpAEgAKkCACGlAUAAqgIAIaYBQACqAgAhtQEBAKcCACHFAQEApwIAIcYBAQCnAgAhxwEBAKcCACHIARAAuAIAIckBAgDFAgAhygEgAKkCACEDAAAAlgEAIB0AAJcEACAeAACoBAAgDQAAAJYBACACAACRAwAgDAAAlQMAIA0AAJIDACAOAACTAwAgFgAAqAQAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbYBAQCnAgAhtwEBAKcCACG4AQEApwIAIboBAACQA7oBIgsCAACRAwAgDAAAlQMAIA0AAJIDACAOAACTAwAgnAEBAKcCACGlAUAAqgIAIaYBQACqAgAhtgEBAKcCACG3AQEApwIAIbgBAQCnAgAhugEAAJADugEiDJwBAQAAAAGdAQEAAAABpQFAAAAAAaYBQAAAAAG7AQEAAAABywFAAAAAAcwBQAAAAAHNAQEAAAABzgEBAAAAAc8BEAAAAAHRAQAAANEBAtIBAAAAwwECAwAAAJYBACAdAAD8AwAgHgAArAQAIA0AAACWAQAgAgAAkQMAIAkAAJQDACAMAACVAwAgDgAAkwMAIBYAAKwEACCcAQEApwIAIaUBQACqAgAhpgFAAKoCACG2AQEApwIAIbcBAQCnAgAhuAEBAKcCACG6AQAAkAO6ASILAgAAkQMAIAkAAJQDACAMAACVAwAgDgAAkwMAIJwBAQCnAgAhpQFAAKoCACGmAUAAqgIAIbYBAQCnAgAhtwEBAKcCACG4AQEApwIAIboBAACQA7oBIgUBAAIFAAQKAAUPHwwQIAgGAgQDBwALCRoBDBsIDQYEDhkFAQEAAgQBAAIGCgUHAAoJFgEGAQACBQAEBwAJCAAGCQ8BDBMIAgYLBQcABwEGDAADAQACCgAFCwABAgkUAAwVAAIGFwAJGAACCRwADB0AAQsAAQADAQACBQAECgAFAwEAAgUABAoABQUHABEjABIkABMlABQmABUAAAAAAAUHABEjABIkABMlABQmABUDAQACBQAECAAGAwEAAgUABAgABgUHABojABskABwlAB0mAB4AAAAAAAUHABojABskABwlAB0mAB4BCwABAQsAAQUHACMjACQkACUlACYmACcAAAAAAAUHACMjACQkACUlACYmACcDAQACCgAFCwABAwEAAgoABQsAAQUHACwjAC0kAC4lAC8mADAAAAAAAAUHACwjAC0kAC4lAC8mADAAAAMHADUlADYmADcAAAADBwA1JQA2JgA3AAADBwA8JQA9JgA-AAAAAwcAPCUAPSYAPgEBAAIBAQACAwcAQyUARCYARQAAAAMHAEMlAEQmAEUBAQACAQEAAgMHAEolAEsmAEwAAAADBwBKJQBLJgBMEQIBEiEBEyIBFCMBFSQBFyYBGCgNGSkOGisBGy0NHC4PHy8BIDABITENJzQQKDUWKTYFKjcFKzgFLDkFLToFLjwFLz4NMD8XMUEFMkMNM0QYNEUFNUYFNkcNN0oZOEsfOU0MOk4MO1AMPFEMPVIMPlQMP1YNQFcgQVkMQlsNQ1whRF0MRV4MRl8NR2IiSGMoSWQISmUIS2YITGcITWgITmoIT2wNUG0pUW8IUnENU3IqVHMIVXQIVnUNV3grWHkxWXsGWnwGW38GXIABBl2BAQZegwEGX4UBDWCGATJhiAEGYooBDWOLATNkjAEGZY0BBmaOAQ1nkQE0aJIBOGmUAQJqlQECa5gBAmyZAQJtmgECbpwBAm-eAQ1wnwE5caEBAnKjAQ1zpAE6dKUBAnWmAQJ2pwENd6oBO3irAT95rQEDeq4BA3uwAQN8sQEDfbIBA360AQN_tgENgAG3AUCBAbkBA4IBuwENgwG8AUGEAb0BA4UBvgEDhgG_AQ2HAcIBQogBwwFGiQHFAQSKAcYBBIsByAEEjAHJAQSNAcoBBI4BzAEEjwHOAQ2QAc8BR5EB0QEEkgHTAQ2TAdQBSJQB1QEElQHWAQSWAdcBDZcB2gFJmAHbAU0"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  EmployeeProfileScalarFieldEnum: () => EmployeeProfileScalarFieldEnum,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  ServiceCategoryScalarFieldEnum: () => ServiceCategoryScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserProfileScalarFieldEnum: () => UserProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VendorProfileScalarFieldEnum: () => VendorProfileScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.5.0",
  engine: "280c870be64f457428992c43c1f6d557fab6e29e"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Booking: "Booking",
  EmployeeProfile: "EmployeeProfile",
  Payment: "Payment",
  Review: "Review",
  ServiceCategory: "ServiceCategory",
  User: "User",
  UserProfile: "UserProfile",
  VendorProfile: "VendorProfile"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var BookingScalarFieldEnum = {
  id: "id",
  userId: "userId",
  vendorId: "vendorId",
  employeeId: "employeeId",
  startTime: "startTime",
  endTime: "endTime",
  serviceAddress: "serviceAddress",
  note: "note",
  totalPrice: "totalPrice",
  bookingStatus: "bookingStatus",
  paymentStatus: "paymentStatus",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var EmployeeProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  vendorId: "vendorId",
  serviceCategoryId: "serviceCategoryId",
  profilePhoto: "profilePhoto",
  bio: "bio",
  address: "address",
  phone: "phone",
  hourlyRate: "hourlyRate",
  experienceYears: "experienceYears",
  isActive: "isActive",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  amount: "amount",
  paymentMethod: "paymentMethod",
  transactionId: "transactionId",
  status: "status",
  paidAt: "paidAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  userId: "userId",
  employeeId: "employeeId",
  bookingId: "bookingId",
  comment: "comment",
  rating: "rating",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ServiceCategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description"
};
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  name: "name",
  password: "password",
  role: "role",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  profilePhoto: "profilePhoto",
  phone: "phone",
  address: "address",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VendorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  vendorName: "vendorName",
  logo: "logo",
  phone: "phone",
  description: "description",
  address: "address",
  isApproved: "isApproved",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/enums.ts
var Role = {
  USER: "USER",
  VENDOR: "VENDOR",
  EMPLOYEE: "EMPLOYEE",
  ADMIN: "ADMIN"
};
var BookingStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCESSFUL: "SUCCESSFUL",
  FAILED: "FAILED"
};

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/errorHelpers/prismaErrorHandler.ts
import status2 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status2.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status2.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status2.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status2.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status2.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status2.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status2.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status2.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status2.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status2.INTERNAL_SERVER_ERROR;
  }
  return status2.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status2.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status2.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/middlewares/globalErrorHandler.ts
import status4 from "http-status";

// src/app/errorHelpers/zodErrorHandler.ts
import status3 from "http-status";
var zodErrorHandler = (err) => {
  const statusCode = status3.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("=>"),
      message: issue.message
    });
  });
  return {
    statusCode,
    message,
    errorSources,
    error: err
  };
};

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/middlewares/globalErrorHandler.ts
import z from "zod";
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }
  let errorSources = [];
  let statusCode = status4.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = zodErrorHandler(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status4.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    statusCode,
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/modules/payment/payment.controller.ts
import status6 from "http-status";

// src/app/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/utils/sendResponse.ts
var sendResponse = (res, responseData) => {
  res.status(responseData.statusCode).json({
    statusCode: responseData.statusCode,
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
    meta: responseData.meta
  });
};

// src/app/modules/payment/payment.service.ts
import status5 from "http-status";

// src/app/lib/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

// src/app/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = envVars.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/modules/payment/payment.service.ts
var createCheckoutSession = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    }
  });
  if (!booking) {
    throw new AppError_default(status5.NOT_FOUND, "Booking not found");
  }
  if (booking.userId !== userId) {
    throw new AppError_default(status5.FORBIDDEN, "You are forbidden from paying for this booking");
  }
  if (booking.bookingStatus === BookingStatus.CANCELLED) {
    throw new AppError_default(status5.BAD_REQUEST, "Cancelled booking cannot be paid");
  }
  if (booking.bookingStatus === BookingStatus.COMPLETED || booking.bookingStatus === BookingStatus.REJECTED) {
    throw new AppError_default(status5.BAD_REQUEST, "This booking is not payable");
  }
  if (booking.paymentStatus === PaymentStatus.SUCCESSFUL) {
    throw new AppError_default(status5.BAD_REQUEST, "This booking has already been paid");
  }
  const amount = Number(booking.totalPrice);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError_default(status5.BAD_REQUEST, "Invalid booking amount");
  }
  const amountInCents = Math.round(amount * 100);
  const payment = await prisma.$transaction(async (tx) => {
    const upsertedPayment = await tx.payment.upsert({
      where: {
        bookingId: booking.id
      },
      update: {
        amount,
        paymentMethod: "STRIPE",
        status: PaymentStatus.PENDING
      },
      create: {
        bookingId: booking.id,
        amount,
        paymentMethod: "STRIPE",
        status: PaymentStatus.PENDING
      }
    });
    await tx.booking.update({
      where: {
        id: booking.id
      },
      data: {
        paymentStatus: PaymentStatus.PENDING
      }
    });
    return upsertedPayment;
  });
  const successUrl = new URL(envVars.CLIENT_SUCCESS_URL);
  successUrl.searchParams.set("bookingId", booking.id);
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  const cancelUrl = new URL(envVars.CLIENT_CANCEL_URL);
  cancelUrl.searchParams.set("bookingId", booking.id);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: envVars.STRIPE_CURRENCY,
          product_data: {
            name: `Booking Payment (${booking.id})`
          },
          unit_amount: amountInCents
        }
      }
    ],
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    client_reference_id: booking.id,
    metadata: {
      bookingId: booking.id,
      userId: booking.userId,
      paymentId: payment.id
    }
  });
  if (!session.url) {
    throw new AppError_default(status5.BAD_REQUEST, "Failed to create checkout session");
  }
  const updatedPayment = await prisma.payment.update({
    where: {
      id: payment.id
    },
    data: {
      transactionId: session.id
    }
  });
  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    payment: updatedPayment
  };
};
var updatePaymentStateFromCheckoutSession = async (session, targetStatus) => {
  const paymentId = session.metadata?.paymentId;
  const payment = paymentId ? await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  }) : await prisma.payment.findFirst({
    where: {
      transactionId: session.id
    }
  });
  if (!payment) {
    return;
  }
  if (payment.status === PaymentStatus.SUCCESSFUL) {
    return;
  }
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: targetStatus,
        paidAt: targetStatus === PaymentStatus.SUCCESSFUL ? /* @__PURE__ */ new Date() : null
      }
    });
    await tx.booking.update({
      where: {
        id: payment.bookingId
      },
      data: {
        paymentStatus: targetStatus
      }
    });
  });
};
var handleStripeWebhook = async (payload, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      envVars.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    throw new AppError_default(status5.BAD_REQUEST, "Invalid Stripe webhook signature");
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await updatePaymentStateFromCheckoutSession(session, PaymentStatus.SUCCESSFUL);
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      await updatePaymentStateFromCheckoutSession(session, PaymentStatus.FAILED);
      break;
    }
    default:
      break;
  }
  return {
    received: true
  };
};
var PaymentServices = {
  createCheckoutSession,
  handleStripeWebhook
};

// src/app/modules/payment/payment.controller.ts
var createCheckoutSession2 = catchAsync(async (req, res) => {
  const result = await PaymentServices.createCheckoutSession(
    req.params.bookingId,
    req.user.userId
  );
  sendResponse(res, {
    statusCode: status6.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result
  });
});
var handleStripeWebhook2 = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    throw new AppError_default(status6.BAD_REQUEST, "Missing Stripe signature");
  }
  if (!Buffer.isBuffer(req.body)) {
    throw new AppError_default(status6.BAD_REQUEST, "Invalid webhook payload");
  }
  const result = await PaymentServices.handleStripeWebhook(req.body, signature);
  res.status(status6.OK).json(result);
});
var PaymentControllers = {
  createCheckoutSession: createCheckoutSession2,
  handleStripeWebhook: handleStripeWebhook2
};

// src/app/routes/index.ts
import { Router as Router9 } from "express";

// src/app/modules/admin/admin.routes.ts
import { Router } from "express";

// src/app/middlewares/auth.ts
import status7 from "http-status";

// src/app/modules/auth/auth.utils.ts
import jwt from "jsonwebtoken";
var generateAccessToken = (payload) => {
  return jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: envVars.JWT_ACCESS_EXPIRES_IN
  });
};
var verifyAccessToken = (token) => {
  return jwt.verify(token, envVars.JWT_ACCESS_SECRET);
};
var setAuthCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none"
  });
};
var clearAuthCookie = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none"
  });
};

// src/app/middlewares/auth.ts
var auth = (...roles) => {
  return (req, res, next) => {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : void 0;
    const token = req.cookies?.accessToken || bearerToken;
    if (!token) {
      throw new AppError_default(status7.UNAUTHORIZED, "You are not authorized");
    }
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      throw new AppError_default(status7.FORBIDDEN, "You are forbidden from accessing this resource");
    }
    next();
  };
};

// src/app/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return (req, res, next) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }
    req.body = parseResult.data;
    next();
  };
};

// src/app/modules/admin/admin.controller.ts
import status9 from "http-status";

// src/app/utils/queryHelpers.ts
var getQueryString = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return void 0;
};
var getPositiveNumber = (value, fallback) => {
  const numericValue = Number(getQueryString(value));
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }
  return Math.floor(numericValue);
};
var parseQueryOptions = (query, config2 = {}) => {
  const {
    defaultLimit = 10,
    maxLimit = 100,
    defaultSortBy = "createdAt",
    allowedSortFields = []
  } = config2;
  const page = getPositiveNumber(query.page, 1);
  const rawLimit = getPositiveNumber(query.limit, defaultLimit);
  const limit = Math.min(rawLimit, maxLimit);
  const querySortBy = getQueryString(query.sortBy);
  const sortBy = querySortBy && (allowedSortFields.length === 0 || allowedSortFields.includes(querySortBy)) ? querySortBy : defaultSortBy;
  const querySortOrder = getQueryString(query.sortOrder);
  const sortOrder = querySortOrder === "asc" ? "asc" : "desc";
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy,
    sortOrder
  };
};
var buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
});

// src/app/modules/admin/admin.service.ts
import status8 from "http-status";
var basicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true
};
var basicVendorSelect = {
  id: true,
  vendorName: true,
  logo: true,
  phone: true,
  address: true,
  isApproved: true,
  isActive: true
};
var employeeWithUserAndCategoryInclude = {
  include: {
    user: {
      select: basicUserSelect
    },
    serviceCategory: true
  }
};
var bookingDetailsInclude = {
  user: {
    select: basicUserSelect
  },
  vendor: {
    select: basicVendorSelect
  },
  employee: employeeWithUserAndCategoryInclude,
  payment: true,
  review: true
};
var paymentDetailsInclude = {
  booking: {
    include: {
      user: {
        select: basicUserSelect
      },
      vendor: {
        select: basicVendorSelect
      },
      employee: employeeWithUserAndCategoryInclude
    }
  }
};
var getDashboardSummary = async () => {
  const [
    totalUsers,
    totalVendors,
    totalEmployees,
    totalAdmins,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalPayments,
    pendingPayments,
    failedPayments,
    approvedVendors,
    revenueAggregate
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: Role.USER
      }
    }),
    prisma.user.count({
      where: {
        role: Role.VENDOR
      }
    }),
    prisma.user.count({
      where: {
        role: Role.EMPLOYEE
      }
    }),
    prisma.user.count({
      where: {
        role: Role.ADMIN
      }
    }),
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        bookingStatus: BookingStatus.PENDING
      }
    }),
    prisma.booking.count({
      where: {
        bookingStatus: BookingStatus.COMPLETED
      }
    }),
    prisma.booking.count({
      where: {
        bookingStatus: BookingStatus.CANCELLED
      }
    }),
    prisma.payment.count(),
    prisma.payment.count({
      where: {
        status: PaymentStatus.PENDING
      }
    }),
    prisma.payment.count({
      where: {
        status: PaymentStatus.FAILED
      }
    }),
    prisma.vendorProfile.count({
      where: {
        isApproved: true
      }
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESSFUL
      },
      _sum: {
        amount: true
      }
    })
  ]);
  return {
    totalUsers,
    totalVendors,
    totalEmployees,
    totalAdmins,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalPayments,
    pendingPayments,
    failedPayments,
    approvedVendors,
    totalRevenue: Number(revenueAggregate._sum.amount ?? 0)
  };
};
var getAllUsers = async (queryOptions, filters = {}) => {
  const whereClause = {
    ...filters.role && { role: filters.role },
    ...filters.searchTerm && {
      OR: [
        {
          name: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        },
        {
          email: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    },
    ...filters.isActive !== void 0 ? {
      ...filters.role === Role.USER ? { profile: { is: { isActive: filters.isActive } } } : filters.role === Role.VENDOR ? { vendorProfile: { is: { isActive: filters.isActive } } } : filters.role === Role.EMPLOYEE ? { employeeProfile: { is: { isActive: filters.isActive } } } : {}
    } : {}
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.user.count({
      where: whereClause
    })
  ]);
  return {
    data: users,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getAllBookings = async (queryOptions, filters) => {
  const whereClause = {
    ...filters.bookingStatus && { bookingStatus: filters.bookingStatus },
    ...filters.paymentStatus && { paymentStatus: filters.paymentStatus },
    ...filters.searchTerm && {
      OR: [
        {
          user: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          user: {
            email: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          vendor: {
            vendorName: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          employee: {
            user: {
              name: {
                contains: filters.searchTerm,
                mode: "insensitive"
              }
            }
          }
        },
        {
          employee: {
            user: {
              email: {
                contains: filters.searchTerm,
                mode: "insensitive"
              }
            }
          }
        },
        {
          serviceAddress: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        },
        {
          note: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    }
  };
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: bookingDetailsInclude,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.booking.count({
      where: whereClause
    })
  ]);
  return {
    data: bookings,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getAllPayments = async (queryOptions, filters) => {
  const whereClause = {
    ...filters.status && { status: filters.status },
    ...filters.searchTerm && {
      OR: [
        {
          id: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        },
        {
          bookingId: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        },
        {
          transactionId: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        },
        {
          booking: {
            user: {
              name: {
                contains: filters.searchTerm,
                mode: "insensitive"
              }
            }
          }
        },
        {
          booking: {
            user: {
              email: {
                contains: filters.searchTerm,
                mode: "insensitive"
              }
            }
          }
        },
        {
          booking: {
            vendor: {
              vendorName: {
                contains: filters.searchTerm,
                mode: "insensitive"
              }
            }
          }
        },
        {
          booking: {
            employee: {
              user: {
                name: {
                  contains: filters.searchTerm,
                  mode: "insensitive"
                }
              }
            }
          }
        },
        {
          booking: {
            employee: {
              user: {
                email: {
                  contains: filters.searchTerm,
                  mode: "insensitive"
                }
              }
            }
          }
        }
      ]
    }
  };
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: paymentDetailsInclude,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.payment.count({
      where: whereClause
    })
  ]);
  return {
    data: payments,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getPaymentDetails = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id
    },
    include: paymentDetailsInclude
  });
  if (!payment) {
    throw new AppError_default(status8.NOT_FOUND, "Payment not found");
  }
  return payment;
};
var getBookingDetails = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id
    },
    include: bookingDetailsInclude
  });
  if (!booking) {
    throw new AppError_default(status8.NOT_FOUND, "Booking not found");
  }
  return booking;
};
var getSingleUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  let profile = null;
  if (user.role === Role.USER) {
    profile = await prisma.userProfile.findUnique({
      where: {
        userId: user.id
      }
    });
  } else if (user.role === Role.VENDOR) {
    profile = await prisma.vendorProfile.findUnique({
      where: {
        userId: user.id
      }
    });
  } else if (user.role === Role.EMPLOYEE) {
    profile = await prisma.employeeProfile.findUnique({
      where: {
        userId: user.id
      },
      include: {
        serviceCategory: true,
        vendor: {
          select: {
            id: true,
            vendorName: true,
            logo: true,
            phone: true,
            address: true,
            isApproved: true,
            isActive: true
          }
        }
      }
    });
  }
  return {
    ...user,
    profile
  };
};
var updateUserStatus = async (id, payload) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  let profile = null;
  if (user.role === Role.USER) {
    profile = await prisma.userProfile.update({
      where: {
        userId: user.id
      },
      data: {
        isActive: payload.isActive
      }
    });
  } else if (user.role === Role.VENDOR) {
    profile = await prisma.vendorProfile.update({
      where: {
        userId: user.id
      },
      data: {
        isActive: payload.isActive
      }
    });
  } else if (user.role === Role.EMPLOYEE) {
    profile = await prisma.employeeProfile.update({
      where: {
        userId: user.id
      },
      data: {
        isActive: payload.isActive
      },
      include: {
        serviceCategory: true,
        vendor: {
          select: {
            id: true,
            vendorName: true,
            logo: true,
            phone: true,
            address: true,
            isApproved: true,
            isActive: true
          }
        }
      }
    });
  } else if (user.role === Role.ADMIN) {
    throw new AppError_default(status8.BAD_REQUEST, "Admin status cannot be updated through profile status endpoint");
  }
  return {
    ...user,
    profile
  };
};
var updateVendorApproval = async (id, payload) => {
  const vendor = await prisma.vendorProfile.findUnique({
    where: {
      id
    }
  });
  if (!vendor) {
    throw new AppError_default(status8.NOT_FOUND, "Vendor not found");
  }
  const updatedVendor = await prisma.vendorProfile.update({
    where: {
      id
    },
    data: {
      isApproved: payload.isApproved
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  return updatedVendor;
};
var AdminServices = {
  getDashboardSummary,
  getAllUsers,
  getAllBookings,
  getAllPayments,
  getPaymentDetails,
  getBookingDetails,
  getSingleUser,
  updateUserStatus,
  updateVendorApproval
};

// src/app/modules/admin/admin.controller.ts
var getEnumQueryValue = (value, enumValues) => {
  if (typeof value !== "string") {
    return void 0;
  }
  return enumValues.includes(value) ? value : void 0;
};
var getDashboardSummary2 = catchAsync(async (req, res) => {
  const result = await AdminServices.getDashboardSummary();
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Dashboard summary retrieved successfully",
    data: result
  });
});
var getAllUsers2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["name", "email", "createdAt", "updatedAt"]
  });
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const role = getEnumQueryValue(
    req.query.role,
    Object.values(Role)
  );
  const isActive = typeof req.query.isActive === "string" ? req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : void 0 : void 0;
  const result = await AdminServices.getAllUsers(queryOptions, {
    searchTerm: searchTerm || void 0,
    role,
    isActive
  });
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getAllBookings2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "startTime", "endTime", "bookingStatus", "paymentStatus", "totalPrice"]
  });
  const bookingStatus = getEnumQueryValue(
    req.query.bookingStatus,
    Object.values(BookingStatus)
  );
  const paymentStatus = getEnumQueryValue(
    req.query.paymentStatus,
    Object.values(PaymentStatus)
  );
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const result = await AdminServices.getAllBookings(queryOptions, {
    bookingStatus,
    paymentStatus,
    searchTerm: searchTerm || void 0
  });
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getAllPayments2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "updatedAt", "status", "amount", "paidAt"]
  });
  const paymentStatus = getEnumQueryValue(
    req.query.status,
    Object.values(PaymentStatus)
  );
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const result = await AdminServices.getAllPayments(queryOptions, {
    status: paymentStatus,
    searchTerm: searchTerm || void 0
  });
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getPaymentDetails2 = catchAsync(async (req, res) => {
  const result = await AdminServices.getPaymentDetails(req.params.id);
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result
  });
});
var getBookingDetails2 = catchAsync(async (req, res) => {
  const result = await AdminServices.getBookingDetails(req.params.id);
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result
  });
});
var getSingleUser2 = catchAsync(async (req, res) => {
  const result = await AdminServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "User retrieved successfully",
    data: result
  });
});
var updateUserStatus2 = catchAsync(async (req, res) => {
  const result = await AdminServices.updateUserStatus(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "User status updated successfully",
    data: result
  });
});
var updateVendorApproval2 = catchAsync(async (req, res) => {
  const result = await AdminServices.updateVendorApproval(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Vendor approval status updated successfully",
    data: result
  });
});
var AdminControllers = {
  getDashboardSummary: getDashboardSummary2,
  getAllUsers: getAllUsers2,
  getAllBookings: getAllBookings2,
  getAllPayments: getAllPayments2,
  getPaymentDetails: getPaymentDetails2,
  getBookingDetails: getBookingDetails2,
  getSingleUser: getSingleUser2,
  updateUserStatus: updateUserStatus2,
  updateVendorApproval: updateVendorApproval2
};

// src/app/modules/admin/admin.validation.ts
import z2 from "zod";
var updateUserStatusSchema = z2.object({
  isActive: z2.boolean({
    error: "isActive is required"
  })
});
var updateVendorApprovalSchema = z2.object({
  isApproved: z2.boolean({
    error: "isApproved is required"
  })
});
var adminValidationSchemas = {
  updateUserStatusSchema,
  updateVendorApprovalSchema
};

// src/app/modules/admin/admin.routes.ts
var router = Router();
router.get(
  "/dashboard-summary",
  auth(Role.ADMIN),
  AdminControllers.getDashboardSummary
);
router.get(
  "/users",
  auth(Role.ADMIN),
  AdminControllers.getAllUsers
);
router.get(
  "/bookings",
  auth(Role.ADMIN),
  AdminControllers.getAllBookings
);
router.get(
  "/payments",
  auth(Role.ADMIN),
  AdminControllers.getAllPayments
);
router.get(
  "/payments/:id",
  auth(Role.ADMIN),
  AdminControllers.getPaymentDetails
);
router.get(
  "/bookings/:id",
  auth(Role.ADMIN),
  AdminControllers.getBookingDetails
);
router.get(
  "/users/:id",
  auth(Role.ADMIN),
  AdminControllers.getSingleUser
);
router.patch(
  "/vendors/:id/approval",
  auth(Role.ADMIN),
  validateRequest(adminValidationSchemas.updateVendorApprovalSchema),
  AdminControllers.updateVendorApproval
);
router.patch(
  "/users/:id/status",
  auth(Role.ADMIN),
  validateRequest(adminValidationSchemas.updateUserStatusSchema),
  AdminControllers.updateUserStatus
);
var AdminRoutes = router;

// src/app/modules/auth/auth.routes.ts
import { Router as Router2 } from "express";

// src/app/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import status10 from "http-status";
var registerUser = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email.toLowerCase()
    }
  });
  if (existingUser) {
    throw new AppError_default(status10.CONFLICT, "Email already exists");
  }
  const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return user;
};
var registerVendor = async (payload) => {
  const normalizedEmail = payload.email.toLowerCase();
  return prisma.$transaction(async (tx) => {
    const [existingUser, existingVendorProfile] = await Promise.all([
      tx.user.findUnique({
        where: {
          email: normalizedEmail
        }
      }),
      tx.vendorProfile.findUnique({
        where: {
          vendorName: payload.vendorName
        }
      })
    ]);
    if (existingUser) {
      throw new AppError_default(status10.CONFLICT, "Email already exists");
    }
    if (existingVendorProfile) {
      throw new AppError_default(status10.CONFLICT, "Vendor name already exists");
    }
    const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.VENDOR
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    const vendorProfile = await tx.vendorProfile.create({
      data: {
        userId: user.id,
        vendorName: payload.vendorName,
        logo: payload.logo,
        phone: payload.phone,
        description: payload.description,
        address: payload.address
      },
      select: {
        id: true,
        userId: true,
        vendorName: true,
        logo: true,
        phone: true,
        description: true,
        address: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return {
      ...user,
      vendorProfile
    };
  });
};
var createEmployee = async (vendorUserId, payload) => {
  const normalizedEmail = payload.email.toLowerCase();
  return prisma.$transaction(async (tx) => {
    const [vendorProfile, existingUser, serviceCategory] = await Promise.all([
      tx.vendorProfile.findUnique({
        where: {
          userId: vendorUserId
        }
      }),
      tx.user.findUnique({
        where: {
          email: normalizedEmail
        }
      }),
      tx.serviceCategory.findUnique({
        where: {
          id: payload.serviceCategoryId
        }
      })
    ]);
    if (!vendorProfile) {
      throw new AppError_default(status10.NOT_FOUND, "Vendor profile not found");
    }
    if (existingUser) {
      throw new AppError_default(status10.CONFLICT, "Email already exists");
    }
    if (!serviceCategory) {
      throw new AppError_default(status10.NOT_FOUND, "Service category not found");
    }
    const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.EMPLOYEE
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    const employeeProfile = await tx.employeeProfile.create({
      data: {
        userId: user.id,
        vendorId: vendorProfile.id,
        serviceCategoryId: payload.serviceCategoryId,
        profilePhoto: payload.profilePhoto,
        bio: payload.bio,
        address: payload.address,
        phone: payload.phone,
        hourlyRate: payload.hourlyRate,
        experienceYears: payload.experienceYears
      },
      include: {
        serviceCategory: true
      }
    });
    return {
      ...user,
      employeeProfile
    };
  });
};
var login = async (payload) => {
  const normalizedEmail = payload.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail
    }
  });
  if (!user) {
    throw new AppError_default(status10.UNAUTHORIZED, "Invalid email or password");
  }
  if (user.role === Role.USER) {
    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: user.id
      }
    });
    if (profile && !profile.isActive) {
      throw new AppError_default(status10.UNAUTHORIZED, "User account is inactive");
    }
  }
  if (user.role === Role.VENDOR) {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId: user.id
      }
    });
    if (vendorProfile && !vendorProfile.isApproved) {
      throw new AppError_default(status10.UNAUTHORIZED, "Vendor account is not approved yet");
    }
    if (vendorProfile && !vendorProfile.isActive) {
      throw new AppError_default(status10.UNAUTHORIZED, "Vendor account is inactive");
    }
  }
  if (user.role === Role.EMPLOYEE) {
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: {
        userId: user.id
      }
    });
    if (!employeeProfile || employeeProfile.isDeleted) {
      throw new AppError_default(status10.UNAUTHORIZED, "Employee account is deleted");
    }
    if (!employeeProfile.isActive) {
      throw new AppError_default(status10.UNAUTHORIZED, "Employee account is inactive");
    }
  }
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError_default(status10.UNAUTHORIZED, "Invalid email or password");
  }
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  };
};
var logout = async () => {
  return null;
};
var getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      profile: true,
      vendorProfile: true,
      employeeProfile: true
    }
  });
  if (!user) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  const baseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  if (user.role === Role.USER) {
    return {
      ...baseUser,
      profile: user.profile
    };
  }
  if (user.role === Role.VENDOR) {
    return {
      ...baseUser,
      profile: user.vendorProfile
    };
  }
  if (user.role === Role.EMPLOYEE) {
    return {
      ...baseUser,
      profile: user.employeeProfile
    };
  }
  return {
    ...baseUser,
    profile: null
  };
};
var AuthServices = {
  registerUser,
  registerVendor,
  createEmployee,
  login,
  logout,
  getMe
};

// src/app/modules/auth/auth.controller.ts
import status11 from "http-status";
var registerUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.registerUser(payload);
  sendResponse(res, {
    statusCode: status11.CREATED,
    success: true,
    message: "User registered successfully",
    data: result
  });
});
var registerVendor2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.registerVendor(payload);
  sendResponse(res, {
    statusCode: status11.CREATED,
    success: true,
    message: "Vendor registered successfully",
    data: result
  });
});
var createEmployee2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.createEmployee(req.user.userId, payload);
  sendResponse(res, {
    statusCode: status11.CREATED,
    success: true,
    message: "Employee created successfully",
    data: result
  });
});
var login2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.login(payload);
  setAuthCookie(res, result.accessToken);
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "User logged in successfully",
    data: result.user
  });
});
var logout2 = catchAsync(async (req, res) => {
  await AuthServices.logout();
  clearAuthCookie(res);
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "User logged out successfully",
    data: null
  });
});
var getMe2 = catchAsync(async (req, res) => {
  const result = await AuthServices.getMe(req.user.userId);
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "User retrieved successfully",
    data: result
  });
});
var AuthController = {
  registerUser: registerUser2,
  registerVendor: registerVendor2,
  createEmployee: createEmployee2,
  login: login2,
  logout: logout2,
  getMe: getMe2
};

// src/app/modules/auth/auth.validation.ts
import z3 from "zod";
var registerUserSchema = z3.object({
  name: z3.string({
    error: "Full name is required"
  }).trim().min(1, "Full name is required"),
  email: z3.string({
    error: "Email is required"
  }).trim().min(1, "Email is required").email("Email must be valid"),
  password: z3.string({
    error: "Password is required"
  }).min(1, "Password is required").min(8, "Password must meet minimum length 8")
});
var registerVendorSchema = registerUserSchema.extend({
  vendorName: z3.string({
    error: "Vendor name is required"
  }).trim().min(1, "Vendor name is required"),
  logo: z3.string().trim().url("Logo must be a valid URL").optional(),
  phone: z3.string({
    error: "Phone is required"
  }).trim().min(1, "Phone is required").max(20, "Phone must be at most 20 characters"),
  description: z3.string({
    error: "Description is required"
  }).trim().min(1, "Description is required"),
  address: z3.string({
    error: "Address is required"
  }).trim().min(1, "Address is required")
});
var loginSchema = z3.object({
  email: z3.string({
    error: "Email is required"
  }).trim().min(1, "Email is required").email("Email must be valid"),
  password: z3.string({
    error: "Password is required"
  }).min(1, "Password is required")
});
var createEmployeeSchema = registerUserSchema.extend({
  serviceCategoryId: z3.string({
    error: "Service category is required"
  }).trim().min(1, "Service category is required"),
  profilePhoto: z3.string({
    error: "Profile photo is required"
  }).trim().min(1, "Profile photo is required").url("Profile photo must be a valid URL"),
  bio: z3.string({
    error: "Bio is required"
  }).trim().min(1, "Bio is required"),
  address: z3.string({
    error: "Address is required"
  }).trim().min(1, "Address is required"),
  phone: z3.string({
    error: "Phone is required"
  }).trim().min(1, "Phone is required").max(20, "Phone must be at most 20 characters"),
  hourlyRate: z3.coerce.number({
    error: "Hourly rate is required"
  }).positive("Hourly rate must be greater than 0"),
  experienceYears: z3.coerce.number({
    error: "Experience years is required"
  }).int("Experience years must be a whole number").min(0, "Experience years cannot be negative")
});
var authValidationSchemas = {
  registerUserSchema,
  registerVendorSchema,
  loginSchema,
  createEmployeeSchema
};

// src/app/modules/auth/auth.routes.ts
var router2 = Router2();
router2.post("/register-user", validateRequest(authValidationSchemas.registerUserSchema), AuthController.registerUser);
router2.post("/register-vendor", validateRequest(authValidationSchemas.registerVendorSchema), AuthController.registerVendor);
router2.post("/create-employee", auth(Role.VENDOR), validateRequest(authValidationSchemas.createEmployeeSchema), AuthController.createEmployee);
router2.post("/login", validateRequest(authValidationSchemas.loginSchema), AuthController.login);
router2.post("/logout", auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN), AuthController.logout);
router2.get("/me", auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN), AuthController.getMe);
var AuthRoutes = router2;

// src/app/modules/booking/booking.routes.ts
import { Router as Router3 } from "express";

// src/app/modules/booking/booking.controller.ts
import status13 from "http-status";

// src/app/modules/booking/booking.service.ts
import status12 from "http-status";
var ACTIVE_BOOKING_STATUSES = [
  BookingStatus.PENDING,
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS
];
var VENDOR_BOOKING_STATUS_TRANSITIONS = {
  [BookingStatus.PENDING]: [BookingStatus.ACCEPTED, BookingStatus.REJECTED],
  [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.CANCELLED]: []
};
var EMPLOYEE_BOOKING_STATUS_TRANSITIONS = {
  [BookingStatus.PENDING]: [],
  [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.CANCELLED]: []
};
var bookingIncludeConfig = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  vendor: {
    select: {
      id: true,
      vendorName: true,
      logo: true,
      phone: true,
      address: true,
      isApproved: true,
      isActive: true
    }
  },
  employee: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      serviceCategory: true
    }
  },
  payment: true,
  review: true
};
var BOOKING_WINDOW_START_MINUTES = 9 * 60;
var BOOKING_WINDOW_END_MINUTES = 17 * 60;
var STATUS_TIME_GRACE_MS = 30 * 1e3;
var getMinutesFromIsoLocalTime = (isoDateTime) => {
  const timeMatch = isoDateTime.match(/T(\d{2}):(\d{2})/);
  if (!timeMatch) {
    return null;
  }
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  return hours * 60 + minutes;
};
var getIsoLocalDatePart = (isoDateTime) => {
  const dateMatch = isoDateTime.match(/^(\d{4}-\d{2}-\d{2})T/);
  return dateMatch ? dateMatch[1] : null;
};
var createBooking = async (userId, payload) => {
  const startTime = new Date(payload.startTime);
  const endTime = new Date(payload.endTime);
  const startDatePart = getIsoLocalDatePart(payload.startTime);
  const endDatePart = getIsoLocalDatePart(payload.endTime);
  if (!startDatePart || !endDatePart || startDatePart !== endDatePart) {
    throw new AppError_default(status12.BAD_REQUEST, "Start time and end time must be on the same date");
  }
  const startMinutes = getMinutesFromIsoLocalTime(payload.startTime);
  const endMinutes = getMinutesFromIsoLocalTime(payload.endTime);
  if (startMinutes === null || endMinutes === null) {
    throw new AppError_default(status12.BAD_REQUEST, "Invalid time format");
  }
  if (startMinutes < BOOKING_WINDOW_START_MINUTES || startMinutes >= BOOKING_WINDOW_END_MINUTES) {
    throw new AppError_default(status12.BAD_REQUEST, "Start time must be between 9:00 AM and 5:00 PM");
  }
  if (endMinutes <= BOOKING_WINDOW_START_MINUTES || endMinutes > BOOKING_WINDOW_END_MINUTES) {
    throw new AppError_default(status12.BAD_REQUEST, "End time must be between 9:00 AM and 5:00 PM");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user || user.role !== Role.USER) {
    throw new AppError_default(status12.FORBIDDEN, "Only users can create bookings");
  }
  const employee = await prisma.employeeProfile.findFirst({
    where: {
      id: payload.employeeId,
      isDeleted: false,
      isActive: true
    },
    include: {
      vendor: true
    }
  });
  if (!employee) {
    throw new AppError_default(status12.NOT_FOUND, "Employee not found");
  }
  if (!employee.vendor.isActive || !employee.vendor.isApproved) {
    throw new AppError_default(status12.BAD_REQUEST, "Employee vendor is not available for booking");
  }
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      employeeId: employee.id,
      bookingStatus: {
        in: ACTIVE_BOOKING_STATUSES
      },
      AND: [
        {
          startTime: {
            lt: endTime
          }
        },
        {
          endTime: {
            gt: startTime
          }
        }
      ]
    }
  });
  if (conflictingBooking) {
    throw new AppError_default(status12.CONFLICT, "This employee is unavailable for the selected time");
  }
  const durationInHours = (endTime.getTime() - startTime.getTime()) / (1e3 * 60 * 60);
  if (durationInHours <= 0) {
    throw new AppError_default(status12.BAD_REQUEST, "Invalid booking duration");
  }
  const totalPrice = Number((Number(employee.hourlyRate) * durationInHours).toFixed(2));
  const booking = await prisma.booking.create({
    data: {
      userId,
      vendorId: employee.vendorId,
      employeeId: employee.id,
      startTime,
      endTime,
      serviceAddress: payload.serviceAddress,
      note: payload.note,
      totalPrice,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING
    },
    include: bookingIncludeConfig
  });
  return booking;
};
var getMyBookings = async (userId, role, queryOptions, filters) => {
  let whereClause = {};
  if (role === Role.USER) {
    whereClause.userId = userId;
  } else if (role === Role.VENDOR) {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId
      }
    });
    if (!vendorProfile) {
      throw new AppError_default(status12.NOT_FOUND, "Vendor profile not found");
    }
    whereClause.vendorId = vendorProfile.id;
  } else if (role === Role.EMPLOYEE) {
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: {
        userId
      }
    });
    if (!employeeProfile || employeeProfile.isDeleted) {
      throw new AppError_default(status12.NOT_FOUND, "Employee profile not found");
    }
    whereClause.employeeId = employeeProfile.id;
  } else {
    throw new AppError_default(status12.FORBIDDEN, "You are forbidden from accessing this resource");
  }
  whereClause = {
    ...whereClause,
    ...filters.bookingStatus && { bookingStatus: filters.bookingStatus },
    ...filters.paymentStatus && { paymentStatus: filters.paymentStatus }
  };
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: bookingIncludeConfig,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.booking.count({
      where: whereClause
    })
  ]);
  return {
    data: bookings,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getBookingDetails3 = async (bookingId, userId, role) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: bookingIncludeConfig
  });
  if (!booking) {
    throw new AppError_default(status12.NOT_FOUND, "Booking not found");
  }
  if (role === Role.ADMIN) {
    return booking;
  }
  if (role === Role.USER) {
    if (booking.userId !== userId) {
      throw new AppError_default(status12.FORBIDDEN, "You are forbidden from accessing this resource");
    }
    return booking;
  }
  if (role === Role.VENDOR) {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId
      }
    });
    if (!vendorProfile) {
      throw new AppError_default(status12.NOT_FOUND, "Vendor profile not found");
    }
    if (booking.vendorId !== vendorProfile.id) {
      throw new AppError_default(status12.FORBIDDEN, "You are forbidden from accessing this resource");
    }
    return booking;
  }
  if (role === Role.EMPLOYEE) {
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: {
        userId
      }
    });
    if (!employeeProfile || employeeProfile.isDeleted) {
      throw new AppError_default(status12.NOT_FOUND, "Employee profile not found");
    }
    if (booking.employeeId !== employeeProfile.id) {
      throw new AppError_default(status12.FORBIDDEN, "You are forbidden from accessing this resource");
    }
    return booking;
  }
  throw new AppError_default(status12.FORBIDDEN, "You are forbidden from accessing this resource");
};
var cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: bookingIncludeConfig
  });
  if (!booking) {
    throw new AppError_default(status12.NOT_FOUND, "Booking not found");
  }
  if (booking.userId !== userId) {
    throw new AppError_default(status12.FORBIDDEN, "You are forbidden from cancelling this booking");
  }
  if (booking.bookingStatus === BookingStatus.COMPLETED || booking.bookingStatus === BookingStatus.CANCELLED) {
    throw new AppError_default(status12.BAD_REQUEST, "This booking cannot be cancelled");
  }
  if (/* @__PURE__ */ new Date() >= booking.startTime) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking can only be cancelled before service start time");
  }
  const cancelledBooking = await prisma.booking.update({
    where: {
      id: booking.id
    },
    data: {
      bookingStatus: BookingStatus.CANCELLED
    },
    include: bookingIncludeConfig
  });
  return cancelledBooking;
};
var updateBookingStatusByVendor = async (vendorUserId, bookingId, payload) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status12.NOT_FOUND, "Vendor profile not found");
  }
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: bookingIncludeConfig
  });
  if (!booking) {
    throw new AppError_default(status12.NOT_FOUND, "Booking not found");
  }
  if (booking.vendorId !== vendorProfile.id) {
    throw new AppError_default(status12.FORBIDDEN, "You are forbidden from updating this booking");
  }
  const targetStatus = payload.bookingStatus;
  const currentStatus = booking.bookingStatus;
  if (targetStatus === currentStatus) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking is already in the requested status");
  }
  const allowedNextStatuses = VENDOR_BOOKING_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNextStatuses.includes(targetStatus)) {
    throw new AppError_default(
      status12.BAD_REQUEST,
      `Invalid status transition from ${currentStatus} to ${targetStatus}`
    );
  }
  const now = Date.now();
  const startTime = booking.startTime.getTime();
  const endTime = booking.endTime.getTime();
  if (targetStatus === BookingStatus.IN_PROGRESS && now + STATUS_TIME_GRACE_MS < startTime) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot start before service start time");
  }
  if (targetStatus === BookingStatus.COMPLETED && booking.paymentStatus !== PaymentStatus.SUCCESSFUL) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot be completed before payment is successful");
  }
  if (targetStatus === BookingStatus.COMPLETED && now < endTime) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot be completed before service end time");
  }
  const updatedBooking = await prisma.booking.update({
    where: {
      id: booking.id
    },
    data: {
      bookingStatus: targetStatus
    },
    include: bookingIncludeConfig
  });
  return updatedBooking;
};
var updateBookingStatusByEmployee = async (employeeUserId, bookingId, payload) => {
  const employeeProfile = await prisma.employeeProfile.findUnique({
    where: {
      userId: employeeUserId
    }
  });
  if (!employeeProfile || employeeProfile.isDeleted) {
    throw new AppError_default(status12.NOT_FOUND, "Employee profile not found");
  }
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: bookingIncludeConfig
  });
  if (!booking) {
    throw new AppError_default(status12.NOT_FOUND, "Booking not found");
  }
  if (booking.employeeId !== employeeProfile.id) {
    throw new AppError_default(status12.FORBIDDEN, "You are forbidden from updating this booking");
  }
  const targetStatus = payload.bookingStatus;
  const currentStatus = booking.bookingStatus;
  if (targetStatus === currentStatus) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking is already in the requested status");
  }
  const allowedNextStatuses = EMPLOYEE_BOOKING_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNextStatuses.includes(targetStatus)) {
    throw new AppError_default(
      status12.BAD_REQUEST,
      `Invalid status transition from ${currentStatus} to ${targetStatus}`
    );
  }
  const now = Date.now();
  const startTime = booking.startTime.getTime();
  const endTime = booking.endTime.getTime();
  if (targetStatus === BookingStatus.IN_PROGRESS && now + STATUS_TIME_GRACE_MS < startTime) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot start before service start time");
  }
  if (targetStatus === BookingStatus.COMPLETED && booking.paymentStatus !== PaymentStatus.SUCCESSFUL) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot be completed before payment is successful");
  }
  if (targetStatus === BookingStatus.COMPLETED && now < endTime) {
    throw new AppError_default(status12.BAD_REQUEST, "Booking cannot be completed before service end time");
  }
  const updatedBooking = await prisma.booking.update({
    where: {
      id: booking.id
    },
    data: {
      bookingStatus: targetStatus
    },
    include: bookingIncludeConfig
  });
  return updatedBooking;
};
var BookingServices = {
  createBooking,
  getMyBookings,
  getBookingDetails: getBookingDetails3,
  cancelBooking,
  updateBookingStatusByVendor,
  updateBookingStatusByEmployee
};

// src/app/modules/booking/booking.controller.ts
var getEnumQueryValue2 = (value, enumValues) => {
  if (typeof value !== "string") {
    return void 0;
  }
  return enumValues.includes(value) ? value : void 0;
};
var createBooking2 = catchAsync(async (req, res) => {
  const result = await BookingServices.createBooking(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: status13.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result
  });
});
var getMyBookings2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "startTime", "endTime", "bookingStatus", "paymentStatus", "totalPrice"]
  });
  const bookingStatus = getEnumQueryValue2(
    req.query.bookingStatus,
    Object.values(BookingStatus)
  );
  const paymentStatus = getEnumQueryValue2(
    req.query.paymentStatus,
    Object.values(PaymentStatus)
  );
  const result = await BookingServices.getMyBookings(
    req.user.userId,
    req.user.role,
    queryOptions,
    {
      bookingStatus,
      paymentStatus
    }
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getBookingDetails4 = catchAsync(async (req, res) => {
  const result = await BookingServices.getBookingDetails(
    req.params.id,
    req.user.userId,
    req.user.role
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result
  });
});
var cancelBooking2 = catchAsync(async (req, res) => {
  const result = await BookingServices.cancelBooking(
    req.params.id,
    req.user.userId
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var updateBookingStatusByVendor2 = catchAsync(async (req, res) => {
  const result = await BookingServices.updateBookingStatusByVendor(
    req.user.userId,
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result
  });
});
var updateBookingStatusByEmployee2 = catchAsync(async (req, res) => {
  const result = await BookingServices.updateBookingStatusByEmployee(
    req.user.userId,
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result
  });
});
var BookingControllers = {
  createBooking: createBooking2,
  getMyBookings: getMyBookings2,
  getBookingDetails: getBookingDetails4,
  cancelBooking: cancelBooking2,
  updateBookingStatusByVendor: updateBookingStatusByVendor2,
  updateBookingStatusByEmployee: updateBookingStatusByEmployee2
};

// src/app/modules/booking/booking.validation.ts
import z4 from "zod";
var createBookingSchema = z4.object({
  employeeId: z4.string({
    error: "Employee is required"
  }).trim().min(1, "Employee is required"),
  startTime: z4.string({
    error: "Start time is required"
  }).datetime({
    offset: true,
    error: "Start time must be a valid ISO datetime with timezone offset"
  }),
  endTime: z4.string({
    error: "End time is required"
  }).datetime({
    offset: true,
    error: "End time must be a valid ISO datetime with timezone offset"
  }),
  serviceAddress: z4.string({
    error: "Service address is required"
  }).trim().min(1, "Service address is required"),
  note: z4.string().trim().optional()
}).superRefine((data, ctx) => {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  if (!(endTime > startTime)) {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "End time must be after start time"
    });
  }
});
var updateBookingStatusByVendorSchema = z4.object({
  bookingStatus: z4.enum([
    BookingStatus.ACCEPTED,
    BookingStatus.REJECTED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED
  ])
});
var updateBookingStatusByEmployeeSchema = z4.object({
  bookingStatus: z4.enum([
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED
  ])
});
var bookingValidationSchemas = {
  createBookingSchema,
  updateBookingStatusByVendorSchema,
  updateBookingStatusByEmployeeSchema
};

// src/app/modules/booking/booking.routes.ts
var router3 = Router3();
router3.get(
  "/me",
  auth(Role.USER, Role.VENDOR, Role.EMPLOYEE),
  BookingControllers.getMyBookings
);
router3.get(
  "/:id",
  auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN),
  BookingControllers.getBookingDetails
);
router3.patch(
  "/:id/cancel",
  auth(Role.USER),
  BookingControllers.cancelBooking
);
router3.patch(
  "/:id/status",
  auth(Role.VENDOR),
  validateRequest(bookingValidationSchemas.updateBookingStatusByVendorSchema),
  BookingControllers.updateBookingStatusByVendor
);
router3.patch(
  "/:id/employee-status",
  auth(Role.EMPLOYEE),
  validateRequest(bookingValidationSchemas.updateBookingStatusByEmployeeSchema),
  BookingControllers.updateBookingStatusByEmployee
);
router3.post(
  "/",
  auth(Role.USER),
  validateRequest(bookingValidationSchemas.createBookingSchema),
  BookingControllers.createBooking
);
var BookingRoutes = router3;

// src/app/modules/employee/employee.routes.ts
import { Router as Router4 } from "express";

// src/app/modules/employee/employee.controller.ts
import status15 from "http-status";

// src/app/modules/employee/employee.service.ts
import status14 from "http-status";
var employeeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
};
var employeeVendorSelect = {
  id: true,
  vendorName: true,
  logo: true,
  phone: true,
  address: true,
  isApproved: true,
  isActive: true
};
var employeeDetailsInclude = {
  user: {
    select: employeeUserSelect
  },
  vendor: {
    select: employeeVendorSelect
  },
  serviceCategory: true
};
var getAllEmployees = async (queryOptions, filters = {}) => {
  const whereClause = {
    isDeleted: false,
    isActive: true,
    ...filters.serviceCategoryId ? { serviceCategoryId: filters.serviceCategoryId } : {},
    ...filters.searchTerm ? {
      OR: [
        {
          user: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          serviceCategory: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          bio: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    } : {}
  };
  const [employees, total] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: whereClause,
      include: employeeDetailsInclude,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.employeeProfile.count({
      where: whereClause
    })
  ]);
  return {
    data: employees,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getEmployeeDetails = async (id) => {
  const employee = await prisma.employeeProfile.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: employeeDetailsInclude
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee not found");
  }
  return employee;
};
var getMyEmployees = async (vendorUserId, queryOptions, filters = {}) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status14.NOT_FOUND, "Vendor profile not found");
  }
  const whereClause = {
    vendorId: vendorProfile.id,
    ...filters.serviceCategoryId ? { serviceCategoryId: filters.serviceCategoryId } : {},
    ...filters.isActive !== void 0 ? { isActive: filters.isActive } : {},
    ...filters.searchTerm ? {
      OR: [
        {
          user: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          serviceCategory: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          bio: {
            contains: filters.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    } : {}
  };
  const [employees, total] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: whereClause,
      include: employeeDetailsInclude,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.employeeProfile.count({
      where: whereClause
    })
  ]);
  return {
    data: employees,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var deleteMyEmployee = async (vendorUserId, employeeId) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status14.NOT_FOUND, "Vendor profile not found");
  }
  const employee = await prisma.employeeProfile.findFirst({
    where: {
      id: employeeId,
      vendorId: vendorProfile.id
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee not found");
  }
  if (employee.isDeleted) {
    throw new AppError_default(status14.BAD_REQUEST, "Employee is already deleted");
  }
  const activeBooking = await prisma.booking.findFirst({
    where: {
      employeeId: employee.id,
      bookingStatus: {
        in: [
          BookingStatus.PENDING,
          BookingStatus.ACCEPTED,
          BookingStatus.IN_PROGRESS
        ]
      }
    }
  });
  if (activeBooking) {
    throw new AppError_default(status14.BAD_REQUEST, "Employee cannot be deleted while having active bookings");
  }
  const deletedEmployee = await prisma.employeeProfile.update({
    where: {
      id: employee.id
    },
    data: {
      isDeleted: true,
      isActive: false
    },
    include: employeeDetailsInclude
  });
  return deletedEmployee;
};
var updateMyEmployee = async (vendorUserId, employeeId, payload) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status14.NOT_FOUND, "Vendor profile not found");
  }
  const employee = await prisma.employeeProfile.findFirst({
    where: {
      id: employeeId,
      vendorId: vendorProfile.id
    },
    include: {
      user: true
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee not found");
  }
  if (employee.isDeleted) {
    throw new AppError_default(status14.BAD_REQUEST, "Deleted employee cannot be updated");
  }
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase()
      }
    });
    if (existingUser && existingUser.id !== employee.userId) {
      throw new AppError_default(status14.CONFLICT, "Email already exists");
    }
  }
  if (payload.serviceCategoryId) {
    const serviceCategory = await prisma.serviceCategory.findUnique({
      where: {
        id: payload.serviceCategoryId
      }
    });
    if (!serviceCategory) {
      throw new AppError_default(status14.NOT_FOUND, "Service category not found");
    }
  }
  const updatedEmployee = await prisma.$transaction(async (tx) => {
    if (payload.name || payload.email) {
      await tx.user.update({
        where: {
          id: employee.userId
        },
        data: {
          ...payload.name && { name: payload.name },
          ...payload.email && { email: payload.email.toLowerCase() }
        }
      });
    }
    return tx.employeeProfile.update({
      where: {
        id: employee.id
      },
      data: {
        ...payload.serviceCategoryId && { serviceCategoryId: payload.serviceCategoryId },
        ...payload.profilePhoto && { profilePhoto: payload.profilePhoto },
        ...payload.bio && { bio: payload.bio },
        ...payload.address && { address: payload.address },
        ...payload.phone && { phone: payload.phone },
        ...payload.hourlyRate !== void 0 && { hourlyRate: payload.hourlyRate },
        ...payload.experienceYears !== void 0 && { experienceYears: payload.experienceYears },
        ...payload.isActive !== void 0 && { isActive: payload.isActive }
      },
      include: employeeDetailsInclude
    });
  });
  return updatedEmployee;
};
var updateMyProfile = async (employeeUserId, payload) => {
  const employee = await prisma.employeeProfile.findUnique({
    where: {
      userId: employeeUserId
    },
    include: {
      user: true
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee profile not found");
  }
  if (employee.isDeleted) {
    throw new AppError_default(status14.BAD_REQUEST, "Deleted employee cannot be updated");
  }
  const updatedEmployee = await prisma.employeeProfile.update({
    where: {
      id: employee.id
    },
    data: {
      ...payload.profilePhoto && { profilePhoto: payload.profilePhoto },
      ...payload.bio && { bio: payload.bio },
      ...payload.address && { address: payload.address },
      ...payload.phone && { phone: payload.phone }
    },
    include: employeeDetailsInclude
  });
  return updatedEmployee;
};
var EmployeeServices = {
  getAllEmployees,
  getEmployeeDetails,
  getMyEmployees,
  deleteMyEmployee,
  updateMyEmployee,
  updateMyProfile
};

// src/app/modules/employee/employee.controller.ts
var getAllEmployees2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "updatedAt", "hourlyRate", "experienceYears", "isActive"]
  });
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const serviceCategoryId = typeof req.query.serviceCategoryId === "string" ? req.query.serviceCategoryId : void 0;
  const result = await EmployeeServices.getAllEmployees(queryOptions, {
    searchTerm: searchTerm || void 0,
    serviceCategoryId
  });
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Employees retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getEmployeeDetails2 = catchAsync(async (req, res) => {
  const result = await EmployeeServices.getEmployeeDetails(req.params.id);
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Employee retrieved successfully",
    data: result
  });
});
var getMyEmployees2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "updatedAt", "hourlyRate", "experienceYears", "isActive"]
  });
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const serviceCategoryId = typeof req.query.serviceCategoryId === "string" ? req.query.serviceCategoryId : void 0;
  const isActive = typeof req.query.isActive === "string" ? req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : void 0 : void 0;
  const result = await EmployeeServices.getMyEmployees(req.user.userId, queryOptions, {
    searchTerm: searchTerm || void 0,
    serviceCategoryId,
    isActive
  });
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Vendor employees retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var deleteMyEmployee2 = catchAsync(async (req, res) => {
  const result = await EmployeeServices.deleteMyEmployee(req.user.userId, req.params.id);
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Employee deleted successfully",
    data: result
  });
});
var updateMyEmployee2 = catchAsync(async (req, res) => {
  const result = await EmployeeServices.updateMyEmployee(
    req.user.userId,
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Employee updated successfully",
    data: result
  });
});
var updateMyProfile2 = catchAsync(async (req, res) => {
  const result = await EmployeeServices.updateMyProfile(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var EmployeeControllers = {
  getAllEmployees: getAllEmployees2,
  getEmployeeDetails: getEmployeeDetails2,
  getMyEmployees: getMyEmployees2,
  deleteMyEmployee: deleteMyEmployee2,
  updateMyEmployee: updateMyEmployee2,
  updateMyProfile: updateMyProfile2
};

// src/app/modules/employee/employee.validation.ts
import z5 from "zod";
var updateEmployeeSchema = z5.object({
  name: z5.string().trim().min(1, "Employee name is required").optional(),
  email: z5.string().trim().min(1, "Email is required").email("Email must be valid").optional(),
  serviceCategoryId: z5.string().trim().min(1, "Service category is required").optional(),
  profilePhoto: z5.string().trim().min(1, "Profile photo is required").url("Profile photo must be a valid URL").optional(),
  bio: z5.string().trim().min(1, "Bio is required").optional(),
  address: z5.string().trim().min(1, "Address is required").optional(),
  phone: z5.string().trim().min(1, "Phone is required").max(20, "Phone must be at most 20 characters").optional(),
  hourlyRate: z5.coerce.number().positive("Hourly rate must be greater than 0").optional(),
  experienceYears: z5.coerce.number().int("Experience years must be a whole number").min(0, "Experience years cannot be negative").optional(),
  isActive: z5.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update"
  }
);
var updateMyProfileSchema = z5.object({
  profilePhoto: z5.string().trim().min(1, "Profile photo is required").url("Profile photo must be a valid URL").optional(),
  bio: z5.string().trim().min(1, "Bio is required").optional(),
  address: z5.string().trim().min(1, "Address is required").optional(),
  phone: z5.string().trim().min(1, "Phone is required").max(20, "Phone must be at most 20 characters").optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update"
  }
);
var employeeValidationSchemas = {
  updateEmployeeSchema,
  updateMyProfileSchema
};

// src/app/modules/employee/employee.routes.ts
var router4 = Router4();
router4.get("/", EmployeeControllers.getAllEmployees);
router4.patch(
  "/me",
  auth(Role.EMPLOYEE),
  validateRequest(employeeValidationSchemas.updateMyProfileSchema),
  EmployeeControllers.updateMyProfile
);
router4.get("/my", auth(Role.VENDOR), EmployeeControllers.getMyEmployees);
router4.patch(
  "/my/:id",
  auth(Role.VENDOR),
  validateRequest(employeeValidationSchemas.updateEmployeeSchema),
  EmployeeControllers.updateMyEmployee
);
router4.delete("/my/:id", auth(Role.VENDOR), EmployeeControllers.deleteMyEmployee);
router4.get("/:id", EmployeeControllers.getEmployeeDetails);
var EmployeeRoutes = router4;

// src/app/modules/payment/payment.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post(
  "/checkout-session/:bookingId",
  auth(Role.USER),
  PaymentControllers.createCheckoutSession
);
var PaymentRoutes = router5;

// src/app/modules/review/review.routes.ts
import { Router as Router6 } from "express";

// src/app/modules/review/review.controller.ts
import status17 from "http-status";

// src/app/modules/review/review.service.ts
import status16 from "http-status";
var createReview = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user || user.role !== Role.USER) {
    throw new AppError_default(status16.FORBIDDEN, "Only users can create reviews");
  }
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId
    }
  });
  if (!booking) {
    throw new AppError_default(status16.NOT_FOUND, "Booking not found");
  }
  if (booking.userId !== userId) {
    throw new AppError_default(status16.FORBIDDEN, "You are forbidden from reviewing this booking");
  }
  if (booking.bookingStatus !== BookingStatus.COMPLETED) {
    throw new AppError_default(status16.BAD_REQUEST, "You can only review completed bookings");
  }
  const existingReview = await prisma.review.findUnique({
    where: {
      bookingId: booking.id
    }
  });
  if (existingReview) {
    throw new AppError_default(status16.CONFLICT, "You have already reviewed this booking");
  }
  const review = await prisma.review.create({
    data: {
      userId,
      employeeId: booking.employeeId,
      bookingId: booking.id,
      rating: payload.rating,
      comment: payload.comment
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      employee: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          serviceCategory: true
        }
      },
      booking: true
    }
  });
  return review;
};
var getReviewsByEmployee = async (employeeId, queryOptions) => {
  const employee = await prisma.employeeProfile.findUnique({
    where: {
      id: employeeId
    }
  });
  if (!employee || employee.isDeleted) {
    throw new AppError_default(status16.NOT_FOUND, "Employee not found");
  }
  const [reviews, reviewStats] = await Promise.all([
    prisma.review.findMany({
      where: {
        employeeId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        booking: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.review.aggregate({
      where: {
        employeeId
      },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    })
  ]);
  return {
    averageRating: Number((reviewStats._avg.rating ?? 0).toFixed(2)),
    totalReviews: reviewStats._count._all,
    reviews,
    meta: buildPaginationMeta(reviewStats._count._all, queryOptions.page, queryOptions.limit)
  };
};
var updateReview = async (userId, reviewId, payload) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId
    },
    include: {
      booking: true
    }
  });
  if (!review) {
    throw new AppError_default(status16.NOT_FOUND, "Review not found");
  }
  if (review.userId !== userId) {
    throw new AppError_default(status16.FORBIDDEN, "You are forbidden from updating this review");
  }
  if (review.booking.bookingStatus !== BookingStatus.COMPLETED) {
    throw new AppError_default(status16.BAD_REQUEST, "You can only update reviews for completed bookings");
  }
  const updatedReview = await prisma.review.update({
    where: {
      id: review.id
    },
    data: {
      ...payload.rating !== void 0 && { rating: payload.rating },
      ...payload.comment !== void 0 && { comment: payload.comment }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      employee: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          serviceCategory: true
        }
      },
      booking: true
    }
  });
  return updatedReview;
};
var ReviewServices = {
  createReview,
  getReviewsByEmployee,
  updateReview
};

// src/app/modules/review/review.controller.ts
var createReview2 = catchAsync(async (req, res) => {
  const result = await ReviewServices.createReview(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: status17.CREATED,
    success: true,
    message: "Review created successfully",
    data: result
  });
});
var getReviewsByEmployee2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "createdAt",
    allowedSortFields: ["createdAt", "updatedAt", "rating"]
  });
  const result = await ReviewServices.getReviewsByEmployee(
    req.params.employeeId,
    queryOptions
  );
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: {
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
      reviews: result.reviews
    },
    meta: result.meta
  });
});
var updateReview2 = catchAsync(async (req, res) => {
  const result = await ReviewServices.updateReview(
    req.user.userId,
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Review updated successfully",
    data: result
  });
});
var ReviewControllers = {
  createReview: createReview2,
  getReviewsByEmployee: getReviewsByEmployee2,
  updateReview: updateReview2
};

// src/app/modules/review/review.validation.ts
import z6 from "zod";
var createReviewSchema = z6.object({
  bookingId: z6.string({
    error: "Booking is required"
  }).trim().min(1, "Booking is required"),
  rating: z6.number({
    error: "Rating is required"
  }).int("Rating must be a whole number").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  comment: z6.string().trim().optional()
});
var updateReviewSchema = z6.object({
  rating: z6.number().int("Rating must be a whole number").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5").optional(),
  comment: z6.string().trim().optional()
}).refine(
  (data) => data.rating !== void 0 || data.comment !== void 0,
  {
    message: "At least one field is required to update"
  }
);
var reviewValidationSchemas = {
  createReviewSchema,
  updateReviewSchema
};

// src/app/modules/review/review.routes.ts
var router6 = Router6();
router6.get(
  "/employee/:employeeId",
  ReviewControllers.getReviewsByEmployee
);
router6.post(
  "/",
  auth(Role.USER),
  validateRequest(reviewValidationSchemas.createReviewSchema),
  ReviewControllers.createReview
);
router6.patch(
  "/:id",
  auth(Role.USER),
  validateRequest(reviewValidationSchemas.updateReviewSchema),
  ReviewControllers.updateReview
);
var ReviewRoutes = router6;

// src/app/modules/serviceCategory/serviceCategory.routes.ts
import { Router as Router7 } from "express";

// src/app/modules/serviceCategory/serviceCategory.controller.ts
import status19 from "http-status";

// src/app/modules/serviceCategory/serviceCategory.service.ts
import status18 from "http-status";
var createServiceCategory = async (payload) => {
  const existingServiceCategory = await prisma.serviceCategory.findUnique({
    where: {
      name: payload.name
    }
  });
  if (existingServiceCategory) {
    throw new AppError_default(status18.CONFLICT, "Service category already exists");
  }
  const serviceCategory = await prisma.serviceCategory.create({
    data: {
      name: payload.name,
      description: payload.description
    }
  });
  return serviceCategory;
};
var getAllServiceCategories = async (queryOptions, searchTerm) => {
  const whereClause = searchTerm ? {
    OR: [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive"
        }
      }
    ]
  } : {};
  const [serviceCategories, total] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: whereClause,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.serviceCategory.count({
      where: whereClause
    })
  ]);
  return {
    data: serviceCategories,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getServiceCategoryDetails = async (id) => {
  const serviceCategory = await prisma.serviceCategory.findUnique({
    where: {
      id
    }
  });
  if (!serviceCategory) {
    throw new AppError_default(status18.NOT_FOUND, "Service category not found");
  }
  return serviceCategory;
};
var updateServiceCategory = async (id, payload) => {
  const existingServiceCategory = await prisma.serviceCategory.findUnique({
    where: {
      id
    }
  });
  if (!existingServiceCategory) {
    throw new AppError_default(status18.NOT_FOUND, "Service category not found");
  }
  if (payload.name) {
    const duplicateServiceCategory = await prisma.serviceCategory.findUnique({
      where: {
        name: payload.name
      }
    });
    if (duplicateServiceCategory && duplicateServiceCategory.id !== id) {
      throw new AppError_default(status18.CONFLICT, "Service category name already exists");
    }
  }
  const updatedServiceCategory = await prisma.serviceCategory.update({
    where: {
      id
    },
    data: {
      name: payload.name,
      description: payload.description
    }
  });
  return updatedServiceCategory;
};
var deleteServiceCategory = async (id) => {
  const existingServiceCategory = await prisma.serviceCategory.findUnique({
    where: {
      id
    }
  });
  if (!existingServiceCategory) {
    throw new AppError_default(status18.NOT_FOUND, "Service category not found");
  }
  const deletedServiceCategory = await prisma.serviceCategory.delete({
    where: {
      id
    }
  });
  return deletedServiceCategory;
};
var ServiceCategoryServices = {
  createServiceCategory,
  getAllServiceCategories,
  getServiceCategoryDetails,
  updateServiceCategory,
  deleteServiceCategory
};

// src/app/modules/serviceCategory/serviceCategory.controller.ts
var createServiceCategory2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await ServiceCategoryServices.createServiceCategory(payload);
  sendResponse(res, {
    statusCode: status19.CREATED,
    success: true,
    message: "Service category created successfully",
    data: result
  });
});
var getAllServiceCategories2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "name",
    allowedSortFields: ["name", "description"]
  });
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const result = await ServiceCategoryServices.getAllServiceCategories(
    queryOptions,
    searchTerm || void 0
  );
  sendResponse(res, {
    statusCode: status19.OK,
    success: true,
    message: "Service categories retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getServiceCategoryDetails2 = catchAsync(async (req, res) => {
  const result = await ServiceCategoryServices.getServiceCategoryDetails(req.params.id);
  sendResponse(res, {
    statusCode: status19.OK,
    success: true,
    message: "Service category retrieved successfully",
    data: result
  });
});
var updateServiceCategory2 = catchAsync(async (req, res) => {
  const result = await ServiceCategoryServices.updateServiceCategory(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: status19.OK,
    success: true,
    message: "Service category updated successfully",
    data: result
  });
});
var deleteServiceCategory2 = catchAsync(async (req, res) => {
  const result = await ServiceCategoryServices.deleteServiceCategory(req.params.id);
  sendResponse(res, {
    statusCode: status19.OK,
    success: true,
    message: "Service category deleted successfully",
    data: result
  });
});
var ServiceCategoryControllers = {
  createServiceCategory: createServiceCategory2,
  getAllServiceCategories: getAllServiceCategories2,
  getServiceCategoryDetails: getServiceCategoryDetails2,
  updateServiceCategory: updateServiceCategory2,
  deleteServiceCategory: deleteServiceCategory2
};

// src/app/modules/serviceCategory/serviceCategory.validation.ts
import z7 from "zod";
var createServiceCategorySchema = z7.object({
  name: z7.string({
    error: "Service category name is required"
  }).trim().min(1, "Service category name is required"),
  description: z7.string().trim().optional()
});
var updateServiceCategorySchema = z7.object({
  name: z7.string({
    error: "Service category name is required"
  }).trim().min(1, "Service category name is required").optional(),
  description: z7.string().trim().optional()
}).refine(
  (data) => data.name !== void 0 || data.description !== void 0,
  {
    message: "At least one field is required to update"
  }
);
var serviceCategoryValidationSchemas = {
  createServiceCategorySchema,
  updateServiceCategorySchema
};

// src/app/modules/serviceCategory/serviceCategory.routes.ts
var router7 = Router7();
router7.get("/", ServiceCategoryControllers.getAllServiceCategories);
router7.get("/:id", ServiceCategoryControllers.getServiceCategoryDetails);
router7.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(serviceCategoryValidationSchemas.createServiceCategorySchema),
  ServiceCategoryControllers.createServiceCategory
);
router7.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(serviceCategoryValidationSchemas.updateServiceCategorySchema),
  ServiceCategoryControllers.updateServiceCategory
);
router7.delete(
  "/:id",
  auth(Role.ADMIN),
  ServiceCategoryControllers.deleteServiceCategory
);
var ServiceCategoryRoutes = router7;

// src/app/modules/vendor/vendor.routes.ts
import { Router as Router8 } from "express";

// src/app/modules/vendor/vendor.controller.ts
import status21 from "http-status";

// src/app/modules/vendor/vendor.service.ts
import status20 from "http-status";
var vendorUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
};
var vendorWithUserInclude = {
  user: {
    select: vendorUserSelect
  }
};
var getReviewSummaryByVendorId = async (vendorId) => {
  const reviewStats = await prisma.review.aggregate({
    where: {
      employee: {
        vendorId,
        isDeleted: false
      }
    },
    _avg: {
      rating: true
    },
    _count: {
      _all: true
    }
  });
  return {
    averageRating: Number((reviewStats._avg.rating ?? 0).toFixed(2)),
    totalReviews: reviewStats._count._all
  };
};
var getAllVendors = async (queryOptions, filters) => {
  const whereClause = {
    ...filters.isActive !== void 0 && { isActive: filters.isActive },
    ...filters.isApproved !== void 0 && { isApproved: filters.isApproved },
    ...filters.searchTerm && {
      vendorName: {
        contains: filters.searchTerm,
        mode: "insensitive"
      }
    }
  };
  const [vendors, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where: whereClause,
      include: vendorWithUserInclude,
      skip: queryOptions.skip,
      take: queryOptions.limit,
      orderBy: {
        [queryOptions.sortBy]: queryOptions.sortOrder
      }
    }),
    prisma.vendorProfile.count({
      where: whereClause
    })
  ]);
  return {
    data: vendors,
    meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
  };
};
var getVendorDetails = async (id) => {
  const vendor = await prisma.vendorProfile.findFirst({
    where: {
      id,
      isActive: true,
      isApproved: true
    },
    include: vendorWithUserInclude
  });
  if (!vendor) {
    throw new AppError_default(status20.NOT_FOUND, "Vendor not found");
  }
  const [employeeCount, reviewSummary] = await Promise.all([
    prisma.employeeProfile.count({
      where: {
        vendorId: vendor.id,
        isDeleted: false
      }
    }),
    getReviewSummaryByVendorId(vendor.id)
  ]);
  return {
    ...vendor,
    reviewSummary: {
      ...reviewSummary,
      employeeCount
    }
  };
};
var updateMyVendorProfile = async (vendorUserId, payload) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status20.NOT_FOUND, "Vendor profile not found");
  }
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase()
      }
    });
    if (existingUser && existingUser.id !== vendorUserId) {
      throw new AppError_default(status20.CONFLICT, "Email already exists");
    }
  }
  if (payload.vendorName) {
    const existingVendor = await prisma.vendorProfile.findUnique({
      where: {
        vendorName: payload.vendorName
      }
    });
    if (existingVendor && existingVendor.id !== vendorProfile.id) {
      throw new AppError_default(status20.CONFLICT, "Vendor name already exists");
    }
  }
  const updatedVendor = await prisma.$transaction(async (tx) => {
    if (payload.name || payload.email) {
      await tx.user.update({
        where: {
          id: vendorUserId
        },
        data: {
          ...payload.name && { name: payload.name },
          ...payload.email && { email: payload.email.toLowerCase() }
        }
      });
    }
    return tx.vendorProfile.update({
      where: {
        id: vendorProfile.id
      },
      data: {
        ...payload.vendorName && { vendorName: payload.vendorName },
        ...payload.logo && { logo: payload.logo },
        ...payload.phone && { phone: payload.phone },
        ...payload.description && { description: payload.description },
        ...payload.address && { address: payload.address }
      },
      include: vendorWithUserInclude
    });
  });
  return updatedVendor;
};
var getDashboardSummary3 = async (vendorUserId) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorUserId
    }
  });
  if (!vendorProfile) {
    throw new AppError_default(status20.NOT_FOUND, "Vendor profile not found");
  }
  const [
    totalEmployees,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    revenueAggregate,
    reviewSummary
  ] = await Promise.all([
    prisma.employeeProfile.count({
      where: {
        vendorId: vendorProfile.id,
        isDeleted: false
      }
    }),
    prisma.booking.count({
      where: {
        vendorId: vendorProfile.id
      }
    }),
    prisma.booking.count({
      where: {
        vendorId: vendorProfile.id,
        bookingStatus: BookingStatus.PENDING
      }
    }),
    prisma.booking.count({
      where: {
        vendorId: vendorProfile.id,
        bookingStatus: BookingStatus.ACCEPTED
      }
    }),
    prisma.booking.count({
      where: {
        vendorId: vendorProfile.id,
        bookingStatus: BookingStatus.COMPLETED
      }
    }),
    prisma.booking.count({
      where: {
        vendorId: vendorProfile.id,
        bookingStatus: BookingStatus.CANCELLED
      }
    }),
    prisma.booking.aggregate({
      where: {
        vendorId: vendorProfile.id,
        bookingStatus: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.SUCCESSFUL
      },
      _sum: {
        totalPrice: true
      }
    }),
    getReviewSummaryByVendorId(vendorProfile.id)
  ]);
  return {
    totalEmployees,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue: Number(revenueAggregate._sum.totalPrice ?? 0),
    reviewSummary
  };
};
var VendorServices = {
  getAllVendors,
  getVendorDetails,
  updateMyVendorProfile,
  getDashboardSummary: getDashboardSummary3
};

// src/app/modules/vendor/vendor.controller.ts
var parseBooleanQuery = (value) => {
  if (typeof value !== "string") {
    return void 0;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return void 0;
};
var getAllVendors2 = catchAsync(async (req, res) => {
  const queryOptions = parseQueryOptions(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSortBy: "vendorName",
    allowedSortFields: ["vendorName", "isApproved", "isActive"]
  });
  const isApproved = parseBooleanQuery(req.query.isApproved);
  const isActive = parseBooleanQuery(req.query.isActive);
  const searchTerm = typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : void 0;
  const result = await VendorServices.getAllVendors(queryOptions, {
    isApproved,
    isActive,
    searchTerm: searchTerm && searchTerm.length > 0 ? searchTerm : void 0
  });
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Vendors retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getVendorDetails2 = catchAsync(async (req, res) => {
  const result = await VendorServices.getVendorDetails(req.params.id);
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Vendor retrieved successfully",
    data: result
  });
});
var updateMyVendorProfile2 = catchAsync(async (req, res) => {
  const result = await VendorServices.updateMyVendorProfile(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Vendor profile updated successfully",
    data: result
  });
});
var getDashboardSummary4 = catchAsync(async (req, res) => {
  const result = await VendorServices.getDashboardSummary(req.user.userId);
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Dashboard summary retrieved successfully",
    data: result
  });
});
var VendorControllers = {
  getAllVendors: getAllVendors2,
  getVendorDetails: getVendorDetails2,
  updateMyVendorProfile: updateMyVendorProfile2,
  getDashboardSummary: getDashboardSummary4
};

// src/app/modules/vendor/vendor.validation.ts
import z8 from "zod";
var updateMyVendorSchema = z8.object({
  name: z8.string().trim().min(1, "Name is required").optional(),
  email: z8.string().trim().min(1, "Email is required").email("Email must be valid").optional(),
  vendorName: z8.string().trim().min(1, "Vendor name is required").optional(),
  logo: z8.string().trim().min(1, "Logo is required").optional(),
  phone: z8.string().trim().min(1, "Phone is required").max(20, "Phone must be at most 20 characters").optional(),
  description: z8.string().trim().min(1, "Description is required").optional(),
  address: z8.string().trim().min(1, "Address is required").optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update"
  }
);
var vendorValidationSchemas = {
  updateMyVendorSchema
};

// src/app/modules/vendor/vendor.routes.ts
var router8 = Router8();
router8.get("/", VendorControllers.getAllVendors);
router8.get("/dashboard-summary", auth(Role.VENDOR), VendorControllers.getDashboardSummary);
router8.patch(
  "/me",
  auth(Role.VENDOR),
  validateRequest(vendorValidationSchemas.updateMyVendorSchema),
  VendorControllers.updateMyVendorProfile
);
router8.get("/:id", VendorControllers.getVendorDetails);
var VendorRoutes = router8;

// src/app/routes/index.ts
var router9 = Router9();
router9.use("/admin", AdminRoutes);
router9.use("/auth", AuthRoutes);
router9.use("/bookings", BookingRoutes);
router9.use("/employees", EmployeeRoutes);
router9.use("/payments", PaymentRoutes);
router9.use("/reviews", ReviewRoutes);
router9.use("/service-categories", ServiceCategoryRoutes);
router9.use("/vendors", VendorRoutes);
var AppRoutes = router9;

// src/app.ts
var app = express();
var openApiPath = path2.resolve(process.cwd(), "docs", "openapi.yaml");
var openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
var allowedOrigins = envVars.FRONTEND_URLS.split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean);
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), PaymentControllers.handleStripeWebhook);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.get("/docs/openapi.yaml", (req, res) => {
  res.sendFile(openApiPath);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/v1", AppRoutes);
app.get("/health", (req, res) => {
  res.send("Server is running!");
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seedAdmin.ts
import bcrypt2 from "bcrypt";
var seedAdmin = async () => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: envVars.ADMIN_EMAIL
    }
  });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }
  const hashedPassword = await bcrypt2.hash(
    envVars.ADMIN_PASSWORD,
    envVars.BCRYPT_SALT_ROUNDS
  );
  await prisma.user.create({
    data: {
      name: envVars.ADMIN_NAME,
      email: envVars.ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN
    }
  });
  console.log("Admin created successfully");
};

// src/server.ts
var port = envVars.PORT || 5e3;
var server;
var bootstrap = async () => {
  try {
    await seedAdmin();
    server = app_default.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Failed to start server!", error);
  }
};
bootstrap();
