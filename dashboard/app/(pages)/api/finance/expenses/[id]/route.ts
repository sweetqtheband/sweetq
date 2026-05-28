import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
  getPaymentRecords,
} from "@/app/services/api/_finance";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

/**
 * GET: Obtener detalle de un gasto
 * PUT: Actualizar un gasto
 * DELETE: Eliminar un gasto
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const expense = await getExpenseById(params.id);
    if (!expense) {
      return Response.json(
        { err: "Gasto no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    const paymentRecords = await getPaymentRecords(params.id);

    return Response.json(
      { data: { ...expense, paymentRecords } },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const body = await req.json();
    const expense = await getExpenseById(params.id);

    if (!expense) {
      return Response.json(
        { err: "Gasto no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    await updateExpense(params.id, body);
    revalidatePath(`/admin/finance/operations`);

    const updated = await getExpenseById(params.id);
    return Response.json({ data: updated }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const expense = await getExpenseById(params.id);
    if (!expense) {
      return Response.json(
        { err: "Gasto no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    await deleteExpense(params.id);
    revalidatePath(`/admin/finance/operations`);

    return Response.json(
      { data: { success: true } },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
