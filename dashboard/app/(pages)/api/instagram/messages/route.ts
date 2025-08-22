import { ERRORS, FIELD_TYPES, HTTP_STATUS_CODES } from '@/app/constants';
import { NextRequest } from 'next/server';
import { corsOptions, getCollection, postItem } from '@/app/services/api/_db';
import { FactorySvc } from '@/app/services/api/factory';
import { formDataToObject } from '@/app/utils';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

const collection = 'messages';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const col = await getCollection(collection);
  const svc = FactorySvc(collection, col);

  const formData = await req.formData();
  const dataObj = formDataToObject(formData, { ids: FIELD_TYPES.MULTISELECT });
  const layoutSvc = FactorySvc('layouts', await getCollection('layouts'));
  const followersSvc = FactorySvc(
    'followers',
    await getCollection('followers')
  );

  const isUpdate = (dataObj.layoutId  && dataObj.layoutId !== 'undefined') || (dataObj._id && dataObj._id !== 'undefined');
  const layoutId = dataObj.layoutId || dataObj._id;

  if (isUpdate) {
    await layoutSvc.update(
      {
        _id: new ObjectId(layoutId),
        tpl: {
          personalMessage: dataObj.personalMessage,
          collectiveMessage: dataObj.collectiveMessage,
        },
      },
      true
    );
  }

  try {
    const layout = isUpdate
      ? await layoutSvc.getById(layoutId)
      : await layoutSvc.create({
          name: dataObj.layout,
          type: 'instagram',
          tpl: {
            personalMessage: dataObj.personalMessage,
            collectiveMessage: dataObj.collectiveMessage,
          },
        });

    const createDate = new Date();

    const items = await Promise.all(
      dataObj.ids.map(async (id: string) => {
        const follower = await followersSvc.findOne({ id });
        // If message already exist for this user, skip it
        const messageExist = await svc.findOne({
          _followerId: new ObjectId(follower._id),
          _layoutId: new ObjectId(layout._id),
          status: 'scheduled',
        });

        if (messageExist) {
          return messageExist;
        }
        const obj: Record<string, any> = {
          _followerId: new ObjectId(follower._id),
          _layoutId: new ObjectId(layout._id),
          type: layout.type,
          status: 'scheduled',
          created: createDate,
        };
        return svc.create(obj);
      })
    );
    revalidatePath(`/admin/instagram`);

    return Response.json(
      { data: [items] },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: Error | any) {
    return Response.json(
      { err: err?.message },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
