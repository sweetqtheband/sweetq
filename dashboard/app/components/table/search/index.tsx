"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Input from '../../input';

export default function TableSearchComponent() {

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const onSearchHandler = (query:string) => {      

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('query', String(query));    
      params.delete('limit');
      params.delete('page');
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }


  return (
    <div className="table--search">
      <Input type="text" placeholder='Buscar...' onChange={(value:string) => {
        onSearchHandler(value);          
      }}/>
    </div>
  )
};