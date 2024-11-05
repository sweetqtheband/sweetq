import { NextRequest } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

const collection = 'tracks';
const idx = 'title';

export async function PUT(req: NextRequest) {
  const formData = await req.formData();

  console.log(formData);
  return Response.json({ status: 'ok' });
}
