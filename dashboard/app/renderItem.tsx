import { Size } from '@/types/size';
import { RENDER_TYPES, SIZES } from './constants';
import { Tag } from '@carbon/react';

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

const renderers = {
  [RENDER_TYPES.COLOR]: renderColor,
  [RENDER_TYPES.TAG]: renderTag,
};

// Main renderer
export const renderItem = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
