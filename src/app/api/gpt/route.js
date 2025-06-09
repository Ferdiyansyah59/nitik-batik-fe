// app/api/gpt/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inisialisasi OpenAI API
const openai = new OpenAI({
  //   apiKey: process.env.GPT_KEY,
  apiKey: process.env.NEXT_PUBLIC_GPT_KEY || 'gak dapet',
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah pakar budaya Indonesia yang memiliki pengetahuan mendalam tentang berbagai jenis batik, sejarahnya, dan nilai budayanya. Berikan informasi yang faktual dan mendetail.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      data: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('GPT API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
