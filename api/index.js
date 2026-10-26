import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import app from '../index.ts';

export default handle(app);
