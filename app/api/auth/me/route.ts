import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mahasiswa_token")?.value;
    if (!token) return NextResponse.json(null, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json(null, { status: 401 });

    return NextResponse.json({ nama: payload.nama, nim: payload.nim });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
