import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.mahasiswa.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, nim: true, nama: true, createdAt: true, _count: { select: { feedbacks: true } } },
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nim, nama, password } = await req.json();
    if (!nim || !nama || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }
    const existing = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (existing) {
      return NextResponse.json({ error: "NIM sudah terdaftar" }, { status: 409 });
    }
    const mahasiswa = await prisma.mahasiswa.create({
      data: { nim, nama, password },
    });
    return NextResponse.json(mahasiswa, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
