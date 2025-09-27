import { Size } from "@/types/size";
import { ICON_SIZES, RENDER_TYPES, SIZES } from "./constants";
import { Tag, Tooltip } from "@carbon/react";
import Link from "next/link";
import { LogoWechat, NotSentFilled } from "@carbon/react/icons";

const renderColor = (obj: any) => (
  <>
    <span className={`color-block ${obj.color}`}>T</span>
    {obj.value}
  </>
);

const renderTag = (obj: any) => {
  return (
    <Tag size={SIZES.SM as Size.sm} type={obj.color}>
      {obj.value}
    </Tag>
  );
};

const renderLink = (obj: any) => (
  <Link href={obj.href} target="_blank" onClick={(e) => e.stopPropagation()}>
    {obj.value}
  </Link>
);

const renderStatusMessage = (obj: any, actions: Record<string, any>) => {
  const itemActionHandler = obj?.action ? actions?.[obj.action] : null;

  const onActionClick = (e: MouseEvent, obj: Record<string, any>) => {
    e.stopPropagation();
    if (itemActionHandler && typeof itemActionHandler === "function") {
      itemActionHandler(obj);
    }
  };
  return (
    <Tooltip
      align="left"
      label={obj.value}
      autoAlign
      onClick={(e: MouseEvent) => onActionClick(e, obj)}
    >
      <NotSentFilled size={ICON_SIZES.MD} />
    </Tooltip>
  );
};

const renderInstagramMessage = (obj: any) => {
  return <LogoWechat size={ICON_SIZES.LG} />;
};

const renderers = {
  [RENDER_TYPES.COLOR]: renderColor,
  [RENDER_TYPES.TAG]: renderTag,
  [RENDER_TYPES.LINK]: renderLink,
  [RENDER_TYPES.STATUS_MESSAGE]: renderStatusMessage,
  [RENDER_TYPES.INSTAGRAM_MESSAGE]: renderInstagramMessage,
};

// Main renderer
export const renderItem = (obj: any, actions: Record<string, any>) => {
  const { type } = obj;
  return typeof renderers[type] === "function" && renderers[type](obj, actions);
};
