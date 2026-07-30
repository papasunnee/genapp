import { NextResponse } from "next/server";

export async function GET() {
  const date = new Date();
  return NextResponse.json({
    currentYear: date.getFullYear(),
    currentMonth: date.getMonth(),
    currentDate: date.getDate(),
    currentTime: Date.now(),
  });
}
