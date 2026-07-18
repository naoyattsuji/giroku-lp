import { NextResponse } from "next/server";

const MAC_DOWNLOAD_URL =
  "https://github.com/naoyattsuji/giroku-releases/releases/latest/download/giroku-0.1.2.dmg";

export function GET() {
  return NextResponse.redirect(MAC_DOWNLOAD_URL, 307);
}
