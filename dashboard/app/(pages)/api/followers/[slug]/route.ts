import { NextResponse, type NextRequest } from "next/server";
import { getCollection } from "../../db";
import { ObjectId } from "mongodb";

const collection = "followers";

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }) {

  const col = await getCollection(collection);  

  const body = await req.json();
  delete body._id;

  await col.updateOne({ _id: new ObjectId(params.slug) }, {"$set": body}, {upsert: true})

  return new NextResponse(null, {status: 204});
}
