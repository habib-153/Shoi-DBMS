import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('==========================================');
  console.log('TEST LOGGING ENDPOINT CALLED!');
  console.log('==========================================');
  
  return NextResponse.json({
    success: true,
    message: 'If you see this in your browser but NOT in the terminal, there is a logging issue'
  });
}
