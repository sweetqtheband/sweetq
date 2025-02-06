import { Size } from '@/types/size';
import { RENDER_TYPES, SIZES } from './constants';
import { Tag } from '@carbon/react';
import Link from 'next/link';

const renderColor = (obj: any) => (
  <>
    <span className={`color-block ${obj.color}`}>T</span>
    {obj.value}
  </>
);

const renderTag = (obj: any) => (
  <Tag size={SIZES.SM as Size.sm} type={obj.color}>
    {obj.value}
  </Tag>
);

const renderLink = (obj: any) => (
  <Link href={obj.href} target="_blank" onClick={(e) => e.stopPropagation()}>
    {obj.value}
  </Link>
);

const renderers = {
  [RENDER_TYPES.COLOR]: renderColor,
  [RENDER_TYPES.TAG]: renderTag,
  [RENDER_TYPES.LINK]: renderLink,
};

// Main renderer
export const renderItem = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
