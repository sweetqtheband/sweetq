export const getClasses = (obj:Record<string, any>) => Object.keys(obj).filter(name => obj[name]).join(" ");

export const setClasses = (obj:any) => {
  let returning = obj;
  
  if (obj && typeof obj === "object") {
    if (obj instanceof Array) {
      returning = obj.filter(part => {
        if (typeof part === "object") {
          return getClasses(part);
        } else {
          return part;
        }
      }).join(" ");
    } else {
      return getClasses(obj)
    }
  }

  return returning;
}

export const unquote = (str:string) => str.replace(/['"]+/g, "");
