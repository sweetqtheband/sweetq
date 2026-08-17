import DynamicStyles from "@/app/components/css/dynamic-styles";
import { SocialNetworks } from "@/app/services/socialNetworks";
import { HeaderComponentProps } from "@/app/(pages)/home/interfaces";

export default async function SocialNetworksModule(props: Readonly<HeaderComponentProps>) {
  const socialNetworks = await SocialNetworks.getList();

  const variables: Record<string, string> = {};
  const classes: Record<string, Record<string, string>> = {};

  socialNetworks.forEach((item: any) => {
    const name = item.name.toLowerCase().replace(/\s/g, "-");
    variables[`logo-${name}`] = `url(${item.logo})`;
    classes[`logo-${name}`] = { "background-image": `var(--logo-${name})` };
  });

  return (
    <>
      <DynamicStyles variables={variables} classes={classes} />
      <div className="sq-platforms-icons">
        {socialNetworks.map((item: any) => {
          const name = item.name.toLowerCase().replace(/\s/g, "-");
          return (
            <a
              key={item._id}
              title={item.name}
              className={`sq-button sq-${name}`}
              target="_blank"
              href={item.link}
            >
              <span className={`sq-logo logo-${name}`}></span>
            </a>
          );
        })}
      </div>
    </>
  );
}
