import { NextRequest, NextResponse } from "next/server";
import { recommendFurniture } from "@/lib/furniture";

export async function POST(req: NextRequest) {
  const { width, length, styles = [] } = await req.json();
  if (!width || !length) {
    return NextResponse.json({ error: "width and length (in feet) are required" }, { status: 400 });
  }

  const items = recommendFurniture({ width, length, hasLoftedBed: false }, styles);
  return NextResponse.json({ items });
}
