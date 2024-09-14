"use server";

import  PageTable from "./table";
import  PagePanel from "./panel";
import config from "@/app/config";
import { Followers } from "@/app/services/followers";
import PageFilters from "./filters";
import "./page.scss";
import TableCell from "./table-cell";

export default async function InstagramPage({
  searchParams,
}: Readonly<{
  searchParams?: {
    query?: string;
    country_id?: string;
    state_id?: string;
    city_id?: string;
    follower_id?: string;
    page?: string;
    limit?: string;
  };
}>) {    
  const limit = Number(searchParams?.limit) || config.table.limit;
  const currentPage = Number(searchParams?.page) || 0;
  const query = searchParams?.query ? String(searchParams?.query) : '';
  const cursor = limit * currentPage;  
  const countryId = String(searchParams?.country_id ?? 205);
  const stateId = searchParams?.state_id ? String(searchParams?.state_id) : -1;  
  const cityId = searchParams?.city_id ? String(searchParams?.city_id) : -1;  
  const followerId = searchParams?.follower_id ? String(searchParams?.follower_id) : null;    


  const {total, pages, items: followers} = await Followers.getAll(query, limit, cursor); 

  const follower = followerId ? followers.find((item:Record<string, unknown>) => item.id === followerId) : null;

  const items = followers.map((follower: any) => ({
    ...follower,
    render: (
      <TableCell follower={follower}></TableCell>
    ),
  }));  

  return (
    <>
      <PageTable 
        items={items}     
        total={total}
        pages={pages}>
        <PageFilters 
          countryId={countryId}
          stateId={stateId}
          cityId={cityId}>
        </PageFilters>      
      </PageTable>         
      <PagePanel
      data={follower}>
      </PagePanel>
    </>
  )
}