import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
}

export async function POST(req: Request) {
  try {
    console.log('Received request:', req.method, req.url);
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required.' }), { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ message: 'Email already registered.' }), { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false,
      },
    });
    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
    return new Response(JSON.stringify({ message: 'Signup successful. OTP sent to email.' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Server error', error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
}