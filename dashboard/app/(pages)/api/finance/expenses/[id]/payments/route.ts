import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";

/**
 * GET: Obtener cuotas (obligaciones de pago) de un gasto
 * POST: Actualizar estado de una cuota
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    // TODO: Implementar lógica de base de datos
    // const payments = await db.collection("expensePayments").find({ expenseId: params.id });

    return Response.json({ data: [] }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
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

    // TODO: Implementar lógica de actualización
    // const updated = await db.collection("expensePayments").updateOne(
    //   { _id: body.paymentId, expenseId: params.id },
    //   { $set: { status: body.status } }
    // );

    return Response.json({ data: {} }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
