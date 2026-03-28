import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(feedbacks);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data aduan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kategori, nama, nim, judul, deskripsi } = body;

    if (!kategori || !nama || !nim || !judul || !deskripsi) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: { kategori, nama, nim, judul, deskripsi },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan aduan" },
      { status: 500 }
    );
  }
}
