// middleware/auth.ts
import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'hono' {
  interface ContextVariableMap {
    user: { id: number; username: string };
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  let token: string | undefined;

  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  } else {
    token = c.req.query('token');
  }

  if (!token) {
    return c.json({ error: 'Missing or invalid Authorization header or token' }, 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined');
    return c.json({ error: 'Server configuration error: JWT_SECRET not set' }, 500);
  }

  try {
    const decodedPayload = await verify(token, jwtSecret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decodedPayload.suserId }, 
      select: { id: true, username: true },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    c.set('user', { id: user.id, username: user.username });
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return c.json({ error: 'Invalid or expired token', details: message }, 401);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});