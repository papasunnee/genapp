import { NextResponse } from "next/server";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { withTenant } from "@/lib/apiTenant";

export const POST = withTenant(async (req, tenant, session) => {
  // Creates privileged accounts - only an existing superadmin (weight 100)
  // in this organization may call it. (Previously had no auth check at
  // all - anyone who could reach any tenant's subdomain could create a
  // user with an arbitrary role.)
  if (session?.user?.role?.weight !== 100) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);
  const conn = tenant.connection;

  try {
    const body = await req.json();
    let password: string;
    const mongooseSession = await conn.startSession();
    let userData: any;
    await mongooseSession.withTransaction(async () => {
      password = body.password;
      delete body.password;
      userData = await User.create([{ ...body }], { session: mongooseSession });
      await Access.create(
        [{ password, user: userData[0]._id }],
        { session: mongooseSession }
      );
    });
    mongooseSession.endSession();

    return NextResponse.json(
      { success: true, data: userData[0] },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
