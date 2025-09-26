import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { PrismaClient } from '@prisma/client';

const camerasRoutes = new Hono();
const prisma = new PrismaClient();

camerasRoutes.use('*', authMiddleware);

camerasRoutes.get('/', async (c) => {
  const user = c.get('user');
  console.log(user)
  // const cameras = await prisma.camera.findMany();
  const cameras = await prisma.camera.findMany({
  where: {
    //@ts-ignore
    userId: user.id
  },
  include: {
    Alert: true
  }
});
  const camerasWithStream = cameras.map((camera) => ({
    ...camera,
    streamUrl: `http://127.0.0.1:4000/api/cameras/${camera.id}/stream`,
  }));
  return c.json(camerasWithStream);
});

camerasRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  console.log(body);
  const camera = await prisma.camera.create({ data: {...body , userId: user.id} });
  console.log(camera)
  return c.json({
    ...camera,
    streamUrl: `http://127.0.0.1:4000/api/cameras/${camera.id}/stream`,
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
    streamUrl: `http://127.0.0.1:4000/api/cameras/${camera.id}/stream`,
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
    streamUrl: `http://127.0.0.1:4000/api/cameras/${camera.id}/stream`,
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

// New endpoint for receiving alerts
camerasRoutes.post('/alerts', async (c) => {
  const body = await c.req.json();
  const alert = await prisma.alert.create({
    data: {
      cameraId: body.camera_id,
      timestamp: new Date(body.timestamp * 1000),  // Convert Unix timestamp to Date
      snapshotUrl: body.snapshot_url,
      bbox: body.bbox,
      meta: body.meta || null,
    },
  });
  return c.json(alert);
});

// New endpoint for fetching alerts
camerasRoutes.get('/alerts', async (c) => {
  const alerts = await prisma.alert.findMany({
    include: { Camera: true },  // Include related Camera data if needed
    orderBy: { timestamp: 'desc' },  // Sort by most recent
  });
  return c.json(alerts);
});

// New endpoint to proxy the video stream from FastAPI
// New endpoint to proxy the video stream from FastAPI
camerasRoutes.get('/:id/stream', async (c) => {
  const id = Number(c.req.param('id'));
  const camera = await prisma.camera.findUnique({ where: { id } });
  if (!camera) return c.json({ error: 'Camera not found' }, 404);

  const fastapiUrl = `http://127.0.0.1:8000/video_feed/${id}?rtsp_url=${encodeURIComponent(camera.rtspUrl)}`;
  const resp = await fetch(fastapiUrl);

  if (!resp.ok) {
      //@ts-ignore

    return c.text(await resp.text(), { status: resp.status });
  }

  //@ts-ignore
return c.body(resp.body, { status: resp.status, headers: resp.headers });});

export { camerasRoutes };

