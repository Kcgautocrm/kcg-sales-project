import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';


export async function POST(request ) {
  
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    console.log(filename, request.body)
  
    const blob = await put(filename, request.body, {
      access: 'public',
    });
  
    return NextResponse.json(blob);
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: error.message}), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }); 
  }
  

}