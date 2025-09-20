import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	// Middleware básico: solo deja pasar la request
	return NextResponse.next();
}
