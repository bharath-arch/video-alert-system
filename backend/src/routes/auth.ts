
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {  sign } from 'hono/jwt'
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const authRoutes = new Hono(); 

authRoutes.post('/register', async (c) => {

    const { username, password } = await c.req.json();

    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUND));

    try {
      const prisma = new PrismaClient();
      const existingUser = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (existingUser) {
        return c.json({ error: "Username already taken" }, 400);
      } else {
        const user = await prisma.user.create({
          data: { username, password: hashedPassword },
          select: { id: true, username: true, createdAt: true },
        });
        return c.json(user, 201);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return c.json({ error: message }, 400);
    }


});

authRoutes.post('/login', async (c) => {

    const { username, password } = await c.req.json();

    try{
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if(!user){
            return c.json({ error: "User not found" }, 400);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return c.json({ error: "Invalid password" }, 400);
        }

const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload = {
  suserId: user.id, userName: user.username,
  exp: Math.floor(Date.now() / 1000) + 60 * 3000, 
}
    const token = await sign(payload, jwtSecret);

        return c.json({ message: "Login successful" , token:token }, 200);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return c.json({ error: message }, 400);
    }

  
});

authRoutes.get('/whoami', authMiddleware,(c) => {

    const user = c.get('user');

  return c.json({ message: 'Whoami route' , user: user }, 200);
});

export { authRoutes }; 