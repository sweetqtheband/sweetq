import { Aside } from "@/types/aside";

export const createAside = () => {
  let aside: Aside = {
    before: [],
    after: [],
    main: [],
  };

  return {
    addBefore: (component: React.ReactNode, key: string | null = null) => {
      if (!key) {
        throw new Error("Key is required when adding a component to the aside.");
      }
      if (!aside.before.some((item) => item.key === key)) {
        aside.before.push({ key, component });
      }
    },
    addAfter: (component: React.ReactNode, key: string | null = null) => {
      if (!key) {
        throw new Error("Key is required when adding a component to the aside.");
      }
      if (!aside.after.some((item) => item.key === key)) {
        aside.after.push({ key, component });
      }
    },
    addMain: (component: React.ReactNode, key: string | null = null) => {
      if (!key) {
        throw new Error("Key is required when adding a component to the aside.");
      }
      if (!aside.main.some((item) => item.key === key)) {
        aside.main.push({ key, component });
      }
    },
    getAside: () => aside,
    setAside: (newAside: Aside) => {
      aside = newAside;
    },
  };
};
