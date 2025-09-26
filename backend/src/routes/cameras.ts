import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const camerasRoutes = new Hono();
const prisma = new PrismaClient();

// camerasRoutes.use('*', authMiddleware);

camerasRoutes.get('/', async (c) => {
  const cameras = await prisma.camera.findMany();
  // Add the FastAPI stream URL to each camera
  const camerasWithStream = cameras.map((camera) => ({
    ...camera,
    streamUrl: `http://127.0.0.1:8000/video_feed/${camera.id}`,
  }));
  return c.json(camerasWithStream);
});

camerasRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const camera = await prisma.camera.create({ data: body });
  return c.json({
    ...camera,
    streamUrl: `http://127.0.0.1:8000/video_feed/${camera.id}`,
  });
});

camerasRoutes.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const camera = await prisma.camera.update({
    where: { id },
    data: body,
  });
  return c.json({
    ...camera,
    streamUrl: `http://127.0.0.1:8000/video_feed/${camera.id}`,
  });
});

camerasRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await prisma.camera.delete({ where: { id } });
  return c.json({ success: true });
});

camerasRoutes.get('/:id/start', async (c) => {
  const id = Number(c.req.param('id'));
  const camera = await prisma.camera.findUnique({ where: { id } });
  if (!camera) return c.json({ error: 'Camera not found' }, 404);

  return c.json({
    id: camera.id,
    rtspUrl: camera.rtspUrl,
    streamUrl: `http://127.0.0.1:8000/video_feed/${camera.id}`,
  });
});

// Optional: Keep the stop endpoint for future use
camerasRoutes.post('/:id/stop', async (c) => {
  const id = Number(c.req.param('id'));
  const camera = await prisma.camera.findUnique({ where: { id } });
  if (!camera) return c.json({ error: 'Camera not found' }, 404);
  // Implement stop logic if needed (e.g., notify FastAPI to stop the stream)
  return c.json({ success: true, cameraId: id });
});

export { camerasRoutes };