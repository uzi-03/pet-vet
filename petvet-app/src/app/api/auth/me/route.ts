import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const user = JSON.parse(Buffer.from(session, 'base64').toString());
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
} 