'use client';

import { Table } from '@/app/components';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function PageTable({
  items = [],
  total = 0,
  pages = 0,
  children,
}: Readonly<{
  items: any[];
  total: number;
  pages: number;
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const onClick = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    const params = new URLSearchParams(searchParams);
    params.set('follower_id', String(target?.dataset?.id));

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Table
      className="items followers"
      items={items}
      total={total}
      pages={pages}
      showSearch={true}
      showPaginator={true}
      onClick={onClick}
    >
      {children}
    </Table>
  );
}
