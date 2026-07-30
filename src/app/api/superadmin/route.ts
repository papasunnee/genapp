import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Access from "@/models/Access";

export async function POST(req: NextRequest) {
  const conn = await dbConnect();

  try {
    const body = await req.json();
    let password: string;
    const session = await conn.startSession();
    const user = await session.withTransaction(async () => {
      password = body.password;
      delete body.password;
      const userData = await User.create({ ...body }, { session });
      const access = await Access.create(
        { password, user: userData },
        { session }
      );
      return { userData, access };
    });
    session.endSession();

    return NextResponse.json(
      { success: true, data: (user as any).userData },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
