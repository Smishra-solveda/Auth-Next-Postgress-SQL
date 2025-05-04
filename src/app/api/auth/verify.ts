import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return new Response(JSON.stringify({ message: 'Email and OTP are required.' }), { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
    }
    if (user.isVerified) {
      return new Response(JSON.stringify({ message: 'User already verified.' }), { status: 400 });
    }
    if (!user.otp || !user.otpExpiresAt || user.otp !== otp || user.otpExpiresAt < new Date()) {
      return new Response(JSON.stringify({ message: 'Invalid or expired OTP.' }), { status: 400 });
    }
    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });
    return new Response(JSON.stringify({ message: 'Verification successful.' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Server error', error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
}