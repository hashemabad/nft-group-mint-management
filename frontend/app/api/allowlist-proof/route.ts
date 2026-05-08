import { NextRequest, NextResponse } from "next/server";
import proofs from "@/data/allowlist-proofs.json";

type ProofRecord = {
  allowance: number;
  proof: `0x${string}`[];
};

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.toLowerCase();
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const map = proofs as Record<string, ProofRecord>;
  const item = map[address];

  if (!item) {
    return NextResponse.json({ error: "Address not allowlisted" }, { status: 404 });
  }

  return NextResponse.json(item);
}
