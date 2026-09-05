import { NextResponse } from "next/server";
import { postRiddleWinnersForMonth } from "@/lib/postRiddleWinners";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await postRiddleWinnersForMonth();
  return NextResponse.json(result);
}