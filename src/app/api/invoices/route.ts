import { NextResponse } from "next/server";
import { getInvoiceModel } from "@/models/Invoice";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getPaymentModel } from "@/models/Payment";
import { getUserModel } from "@/models/User";
import { withTenant } from "@/lib/apiTenant";
import { logActivity } from "@/lib/activityLog";
import { formatCurrency } from "@/utils/functions";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Invoice = getInvoiceModel(tenant.connection);
  getTestModel(tenant.connection);
  getPatientModel(tenant.connection);
  getPaymentModel(tenant.connection);
  getUserModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const invoice = await Invoice.findById(id).populate([
        "patient",
        {
          path: "test",
          populate: { path: "payment", populate: { path: "user" } },
        },
      ]);
      return NextResponse.json({ success: true, data: invoice });
    }

    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, any> = {};
    if (status && status !== "All") filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate(["test", "patient"])
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

/**
 * Voiding, not deleting - an invoice is a financial record. Correcting a
 * mistake (wrong test ordered, duplicate entry) marks it Void with a
 * reason instead of erasing it, so it's still visible in the ledger.
 * Only meaningful on an Unpaid invoice - once money has actually changed
 * hands the correction belongs in real bookkeeping, not a status flip.
 */
export const PATCH = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (![100, 200].includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Invoice = getInvoiceModel(tenant.connection);

  try {
    const body = await req.json();
    const { id, reason } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing invoice id" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "Paid") {
      return NextResponse.json(
        { success: false, error: "A paid invoice can't be voided - it's already settled." },
        { status: 400 }
      );
    }
    if (invoice.status === "Void") {
      return NextResponse.json(
        { success: false, error: "This invoice is already void." },
        { status: 400 }
      );
    }

    invoice.status = "Void";
    invoice.voidedReason = reason || undefined;
    await invoice.save();

    await logActivity(
      tenant.connection,
      session,
      "invoice.voided",
      `Voided invoice ${invoice.invoiceNumber} (${formatCurrency(invoice.amount)})${
        reason ? ` - ${reason}` : ""
      }`
    );

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
