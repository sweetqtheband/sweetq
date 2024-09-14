"use client";

import { Step } from '@/types/paginator';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function TablePaginatorComponent({
  total, 
  pages, 
  limit
}:Readonly<{
  total: number, 
  pages: number, 
  limit: number, 
}>) { 

const searchParams = useSearchParams();
const pathname = usePathname();
const { replace } = useRouter();

const onPageChangeHandler = (page:number, limit: number) => {    

  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  params.set('limit', String(limit))

  replace(`${pathname}?${params.toString()}`);
}

const currentPage = Number(searchParams.get('page')) || 0;

let maxCurrent = (currentPage + 1) * limit;
maxCurrent = total < maxCurrent ? total : maxCurrent;

const stepPages : Step[] = [...Array(pages)].map((_, index) => ({ step: index, button: true}));
const totalPages = Math.round( total / limit ) + 1;

let firstButton = null, prevButton = null, nextButton = null, lastButton = null;

// Set bound limits 
let initialBounds = [0, 3];
let finalBounds = [totalPages - 2, totalPages];

if (currentPage > 1) {
  initialBounds[0] = currentPage - 1;
  initialBounds[1] = currentPage + 2;
  prevButton = <button onClick={() => onPageChangeHandler(currentPage - 1, limit)}>{'<'}</button>;
  firstButton = <button onClick={() => onPageChangeHandler(0, limit)}>{'<<'}</button>;
}

if (initialBounds[1] >= finalBounds[0]) {
  initialBounds = [totalPages - 5, totalPages - 2];  
  finalBounds = [totalPages - 2, totalPages]
}


if (currentPage < totalPages && currentPage < totalPages - 4) {
  nextButton = <button onClick={() => onPageChangeHandler(currentPage + 1, limit)}>{'>'}</button>;
  lastButton = <button onClick={() => onPageChangeHandler(totalPages - 1, limit)}>{'>>'}</button>;
}

const paginatedStepPages = 
(currentPage >= totalPages - 4 ? 
[
  ...stepPages.slice(initialBounds[0],initialBounds[1]),  
  ...stepPages.slice(finalBounds[0],finalBounds[1]), 
] :
[
  ...stepPages.slice(initialBounds[0],initialBounds[1]), 
  {step: '...', button: false}, 
  ...stepPages.slice(finalBounds[0],finalBounds[1]), 
])

const steps : Step[] = 
stepPages.length < 5 ?
stepPages :
paginatedStepPages;

const renderStep = (page: Step) => page.button ? 
        <button 
        className={currentPage === page.step ? 'active' : ''}
        key={`page-${page.step}`}
        onClick={() => onPageChangeHandler(page.step as number, limit)}>{page.step as number + 1}</button> :
        <span key={`page-${page.step}`} className="separator">{page.step}</span>;

return (
  <div className="table--paginator">
    Mostrando {currentPage * limit} - {maxCurrent}  de {total}
    { firstButton } 
    { prevButton }
    {      
      steps.map((page:Step) => renderStep(page))
    }
    { nextButton } 
    { lastButton }
  </div>
);
}