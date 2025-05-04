import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required.' }), { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
    }
    if (!user.isVerified) {
      return new Response(JSON.stringify({ message: 'Account not verified. Please verify OTP.', redirect: '/verify' }), { status: 403 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ message: 'Invalid credentials.' }), { status: 401 });
    }
    // Generate JWT (or session)
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    return new Response(JSON.stringify({ message: 'Login successful.', token, redirect: '/' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Server error', error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
}