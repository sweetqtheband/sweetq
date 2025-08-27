import { NextRequest } from 'next/server';
import { corsOptions, getCollection } from '@/app/services/api/_db';
import { ERRORS } from '@/app/constants';
import { FactorySvc } from '@/app/services/api/factory';
import { Follower } from '@/types/follower';

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);
  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  
  const followersSvc = FactorySvc('followers', await getCollection('followers'));
  const tagsSvc = FactorySvc('tags', await getCollection('tags'));

  const tags = await tagsSvc.findAll();

  const followers = await followersSvc.findAll();    

  const data = {
    total: followers.length,    
    byTag: tags.map((tag: Record<string, any>) => {
      return {
        id: tag._id.toString(),
        name: tag.name,        
        count: followers.filter((follower: Follower) => follower.tags?.includes(tag._id.toString())).length
      }
    })
  }

  return Response.json(data);
}