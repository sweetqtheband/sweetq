import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import {
  getPaymentRecords,
  createPaymentRecord,
  getExpensePayments,
  updateExpensePaymentStatus,
  getExpenseById,
} from "@/app/services/api/_finance";
import { ExpensePaymentRecord } from "@/app/models/expensePaymentRecord";
import { ExpenseStatus } from "@/types/finances";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

/**
 * GET: Obtener historial de pagos de un gasto
 * POST: Registrar nuevo pago
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const records = await getPaymentRecords(params.id);
    return Response.json({ data: records }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const body = await req.json();
    const { paidBy, amount, paidTo } = body;

    if (!paidBy || amount <= 0) {
      throw new Error("Datos inválidos: paidBy y amount requeridos");
    }

    // Validar que no exceda la cuota
    const payments = await getExpensePayments(params.id);
    const userPayment = payments.find((p) => p.userId === paidBy);

    if (!userPayment) {
      throw new Error("Usuario no tiene obligación de pago para este gasto");
    }

    const paid = (await getPaymentRecords(params.id))
      .filter((r) => r.paidBy === paidBy)
      .reduce((sum, r) => sum + r.amount, 0);

    const pending = userPayment.amountDue - paid;

    if (amount > pending) {
      throw new Error(`Monto excede pendiente: intenta pagar ${amount}€, pendiente ${pending}€`);
    }

    // Crear registro de pago
    const record = ExpensePaymentRecord({
      expenseId: params.id,
      paidBy,
      paidTo: paidTo || null,
      amount,
      paymentDate: new Date(),
    });

    const created = await createPaymentRecord(record);

    // Recalcular estado de la obligación
    const totalPaid = paid + amount;
    let newStatus;
    if (totalPaid >= userPayment.amountDue) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partial";
    } else {
      newStatus = "pending";
    }

    await updateExpensePaymentStatus(userPayment._id, newStatus as any);

    // Revalidar
    revalidatePath(`/admin/finance/operations`);

    return Response.json({ data: created }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
