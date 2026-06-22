import { getClasses, setClasses } from "@/app/utils";
import Link from "next/link";
import "./link.scss";
import { SizeType } from "@/types/size";
import { ButtonType } from "@/types/button";
import { BUTTON_TYPES, SIZES } from "@/app/constants";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string | Record<string, boolean> | Array<string> | null;
  onClick?: Function;
  variant?: ButtonType;
  size?: SizeType;
}

export default function CustomLink({
  href,
  children,
  variant = BUTTON_TYPES.PRIMARY,
  size = SIZES.MD,
  className = null,
  onClick = () => true,
}: LinkProps) {
  const classes = getClasses({
    "sq-link": true,
    [`${setClasses(className)}`]: true,
  });

  const onClickHandler = (e: any) => {
    onClick(e);
  };

  return (
    <Link
      href={href}
      className={classes}
      data-variant={variant}
      data-size={size}
      onClick={onClickHandler}
    >
      {children}
    </Link>
  );
}
