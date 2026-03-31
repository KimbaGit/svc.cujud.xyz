import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { nim, password } = await req.json();

    if (!nim || !password) {
      return NextResponse.json({ error: "NIM dan password wajib diisi" }, { status: 400 });
    }

    const mahasiswa = await prisma.mahasiswa.findUnique({ where: { nim } });

    if (!mahasiswa || mahasiswa.password !== password) {
      return NextResponse.json({ error: "NIM atau password salah" }, { status: 401 });
    }

    const token = await signToken({
      id: mahasiswa.id,
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      role: "mahasiswa",
    });

    const res = NextResponse.json({ success: true, nama: mahasiswa.nama });
    res.cookies.set("mahasiswa_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
