import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { message: "Notifications are sent from server actions." },
    { status: 405 },
  )
}
