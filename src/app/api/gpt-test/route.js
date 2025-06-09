// app/api/gpt-test/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_GPT_KEY || 'gak dapet',
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: 'Hello, are you working properly?' }],
      max_tokens: 50,
    });

    return NextResponse.json({
      success: true,
      data: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
