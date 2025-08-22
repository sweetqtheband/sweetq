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

  const countriesSvc = FactorySvc('countries', await getCollection('countries'));
  const statesSvc = FactorySvc('states', await getCollection('states'));
  const followersSvc = FactorySvc('followers', await getCollection('followers'));

  const followers = await followersSvc.findAll();  

  const data = followers.reduce((acc: Record<string, any>, follower: Follower) => {
    if (!follower?.country || !follower?.state) {
        if (!acc['unknown']) {
          acc['unknown'] = 0;
        }
        acc['total']++;
      acc['unknown']++;
      return acc;
    }

    if (follower?.country && !acc[follower.country]) {
      acc[follower.country] = {};
    }

    
    if (follower.country && follower.state && !acc[follower.country][follower.state]) {
      acc[follower.country][follower.state] = 0;
    }

    if (follower.state) {
      acc[follower.country][follower.state]++;
    }
    return acc;
  }, {});

  const countries = Object.keys(data).filter(key => 
    !['total', 'unknown'].includes(key));


  data.translations = await Promise.all(
    countries.map(async (id) => {
        const country = await countriesSvc.findOne({ id: String(id) });
        
        const states = await Promise.all(Object.keys(data[id]).map(async (stateId: String ) => {
            const state = await statesSvc.findOne({ id: String(stateId) });
            return {
                id: state.id,
                name: state.name,              
            };
        }));

        return {
            id,
            name: country.name,
            states
        }
    }));

  data.total = followers.length;
  data.unknown = data['unknown'] || 0; 
  
  return Response.json(data);
}