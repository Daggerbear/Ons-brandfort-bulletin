import { NextResponse } from "next/server";
import { postRiddleWinnersForMonth } from "@/lib/postRiddleWinners";

export async function POST(request) {
  const { password, monthKey } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await postRiddleWinnersForMonth(monthKey || undefined);
  return NextResponse.json(result);
}