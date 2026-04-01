import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [allFeedbacks, totalMahasiswa] = await Promise.all([
      prisma.feedback.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, kategori: true, status: true, createdAt: true },
      }),
      prisma.mahasiswa.count(),
    ]);

    // Stats ringkasan
    const total    = allFeedbacks.length;
    const menunggu = allFeedbacks.filter((f) => f.status === "menunggu").length;
    const diterima = allFeedbacks.filter((f) => f.status === "diterima").length;
    const ditolak  = allFeedbacks.filter ((f) => f.status === "ditolak").length;

    // Per kategori
    const kategoriMap: Record<string, { menunggu: number; diterima: number; ditolak: number }> = {};
    for (const f of allFeedbacks) {
      if (!kategoriMap[f.kategori]) kategoriMap[f.kategori] = { menunggu: 0, diterima: 0, ditolak: 0 };
      kategoriMap[f.kategori][f.status as "menunggu" | "diterima" | "ditolak"]++;
    }
    const perKategori = Object.entries(kategoriMap).map(([kategori, counts]) => ({
      kategori,
      ...counts,
      total: counts.menunggu + counts.diterima + counts.ditolak,
    })).sort((a, b) => b.total - a.total);

    // Per bulan (6 bulan terakhir)
    const now = new Date();
    const perBulan = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const bulanFeedbacks = allFeedbacks.filter((f) => {
        const fd = new Date(f.createdAt);
        return fd.getMonth() === d.getMonth() && fd.getFullYear() === d.getFullYear();
      });
      return {
        bulan: label,
        total:    bulanFeedbacks.length,
        menunggu: bulanFeedbacks.filter((f) => f.status === "menunggu").length,
        diterima: bulanFeedbacks.filter((f) => f.status === "diterima").length,
        ditolak:  bulanFeedbacks.filter((f) => f.status === "ditolak").length,
      };
    });

    // Response rate (% diterima + ditolak dari total)
    const responseRate = total > 0 ? Math.round(((diterima + ditolak) / total) * 100) : 0;
    const acceptRate   = total > 0 ? Math.round((diterima / total) * 100) : 0;

    return NextResponse.json({
      summary: { total, menunggu, diterima, ditolak, totalMahasiswa, responseRate, acceptRate },
      perKategori,
      perBulan,
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
