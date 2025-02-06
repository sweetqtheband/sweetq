import { HTTP_STATUS_CODES } from '@/app/constants';
import { NextRequest } from 'next/server';
import { getCollection } from '@/app/services/api/_db';
import { instagramSvc } from '@/app/services/api/instagram';
import { EA } from '@/app/services/api/_events';

const collection = 'instagram';

export async function GET(req: NextRequest) {
  const col = await getCollection(collection);

  const qp = req.nextUrl.searchParams;
  const svc = instagramSvc(col);
  const code = qp.get('code');
  const stored = await svc.getAccessToken(svc);

  try {
    if (!stored) {
      if (code) {
        const shortLiveTokenResponse = await svc.getShortLiveAccessToken(code);
        if (shortLiveTokenResponse) {
          await svc.storeShortLiveAccessToken(svc, shortLiveTokenResponse);

          const longLiveTokenResponse = await svc.getLongLiveAccessToken(
            shortLiveTokenResponse.access_token
          );

          EA.add(
            'instagram',
            await svc.storeLongLiveAccessToken(svc, longLiveTokenResponse)
          );
        }
      }
    } else {
      if (!stored.long_live_access_token) {
        const longLiveTokenResponse = await svc.getLongLiveAccessToken(
          stored.short_live_access_token
        );

        EA.add(
          'instagram',
          await svc.storeLongLiveAccessToken(svc, longLiveTokenResponse)
        );
      } else {
        EA.add('instagram', svc.parseAuthToken(stored));
      }
    }
  } catch (error) {
    return Response.json('Error', {
      status: HTTP_STATUS_CODES.ERROR,
    });
  } finally {
    return Response.json('Ok', {
      status: HTTP_STATUS_CODES.OK,
    });
  }
}

export async function POST(req: NextRequest) {
  const qp = req.nextUrl.searchParams;

  const formData = await req.formData();
  return Response.json('', {
    status: HTTP_STATUS_CODES.OK,
  });
}
