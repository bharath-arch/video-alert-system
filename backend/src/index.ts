import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { cors } from 'hono/cors'
// import { PrismaClient } from '@prisma/client';


import {authRoutes} from './routes/auth.js';
// import { authMiddleware } from './middlewares/authMiddleware.js';
import { camerasRoutes } from './routes/cameras.js';

dotenv.config();

const app = new Hono().basePath('/api');

// app.use('/api/*', cors())

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173' ,'http://localhost:8080' ], // Allow React frontend
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials if needed (e.g., for auth)
  })
);


app.route('/auth', authRoutes);
app.route('/cameras', camerasRoutes);
// const prisma = new PrismaClient();


// await prisma.camera.create({
//   data: { rtspUrl: "rtsp://admin:admin@192.168.1.3:1935", name: "Camera 1" },
// });
// await prisma.camera.create({
//   data: { rtspUrl: "rtsp://admin:admin@192.168.1.4:1935", name: "Camera 2" },
// });

// const a =await prisma.camera.findMany()
// console.log(a)

app.get('/', (c) => {
  return c.json({ message: 'Welcome to the API!' });
});

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});