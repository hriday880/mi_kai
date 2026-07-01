import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Create the message entry
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      email,
      subject: subject || '(No subject)',
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Read existing messages or create new array
    const messagesPath = path.join(process.cwd(), 'data', 'messages.json');

    let messages = [];
    try {
      const existing = await fs.readFile(messagesPath, 'utf-8');
      messages = JSON.parse(existing);
    } catch {
      // File doesn't exist yet, start fresh
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    }

    messages.push(entry);
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));

    return NextResponse.json(
      { success: true, id: entry.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messagesPath = path.join(process.cwd(), 'data', 'messages.json');
    const existing = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(existing);

    return NextResponse.json({ messages, count: messages.length });
  } catch {
    return NextResponse.json({ messages: [], count: 0 });
  }
}
