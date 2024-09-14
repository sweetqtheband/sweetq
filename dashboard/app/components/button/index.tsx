import { getClasses, setClasses } from "@/app/utils";
import "./button.scss";

type Button = "button" | "submit" | "reset" | undefined;

export default function ButtonComponent({
  type = "button",  
  className = null,      
  disabled = false,
  variant = "primary",
  children,
  onClick = () => true,  
}: Readonly<{
  type?: Button,
  className?: string | Record<string, boolean> | Array<string> | null,  
  disabled?: boolean,
  variant?: string,
  children: React.ReactNode,
  onClick?: Function,  
}>) {  
  const classes = getClasses({
    button: true,
    [`${setClasses(className)}`]: true
  });

  const onClickHandler = (e:any) => {
    onClick(e);
  };


  return (
    <button
      type={type}      
      data-variant={variant}
      className={classes}      
      disabled={disabled}
      onClick={onClickHandler}      
  >{children}</button>
  );
}
