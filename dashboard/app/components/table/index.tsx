"use client";

import config from "@/app/config";
import { TableSearch, TablePaginator } from "..";
import "./table.scss";

export default function TableComponent({
  items = [], 
  showSearch = true,
  showPaginator = true,
  className = "",
  limit = config.table.limit,
  total = 0, 
  pages = 0,
  onClick = () => true,
  children
}: Readonly<{
  items: any[],
  showSearch: boolean
  showPaginator: boolean,
  className: string,
  limit?: number,
  total?: number,
  pages?: number,
  onClick?: Function,
  children: React.ReactNode,
}>) {       
  const onClickHandler = (e:any) => {
    onClick(e);
  }

  const showFilters = showSearch || children;
  return (
    <div className={`table ${className}`}>      
      { showFilters ? 
        <div className="table--filters-wrapper">
          <div className="table--filters">
            {children}
          </div>
          {showSearch ? <TableSearch /> : null}
        </div> : null
      }
       <div className="table--list" onClick={onClickHandler}>
        {
          items.map((item: any) => (          
              <div key={item.id} data-id={item.id} className="item">
                {item.render}
              </div>)) 
        }
      </div>
      {showPaginator ?       
      <TablePaginator 
        total={total}
        pages={pages}    
        limit={limit}
      ></TablePaginator>
      :null}
    </div>)
}