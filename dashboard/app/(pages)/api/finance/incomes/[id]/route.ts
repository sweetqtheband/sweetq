import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import { getIncomeById, updateIncome, deleteIncome } from "@/app/services/api/_finance";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

/**
 * GET: Obtener detalle de un ingreso
 * PUT: Actualizar un ingreso
 * DELETE: Eliminar un ingreso
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const income = await getIncomeById(params.id);
    if (!income) {
      return Response.json(
        { err: "Ingreso no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    return Response.json({ data: income }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
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
    const income = await getIncomeById(params.id);

    if (!income) {
      return Response.json(
        { err: "Ingreso no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    await updateIncome(params.id, body);
    revalidatePath(`/admin/finance/operations`);

    const updated = await getIncomeById(params.id);
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
    const income = await getIncomeById(params.id);
    if (!income) {
      return Response.json(
        { err: "Ingreso no encontrado" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    await deleteIncome(params.id);
    revalidatePath(`/admin/finance/operations`);

    return Response.json(
      { data: { success: true } },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
