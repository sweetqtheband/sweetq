"use client";

import { InstagramLogin } from "@/app/components";
import ListLayout from "@/app/components/layouts/list-layout";
import { ACTIONS, Followings } from "@/app/services/followings";
import { useRouter } from "next/navigation";
import MessagePanel from "../message-panel";
import InstagramChat from "../instagram-chat";
import { useState } from "react";
import { Modal } from "@carbon/react";
import { Action } from "@/types/action";

export default function InstagramView(params: Readonly<any>) {
  const [ids, setIds] = useState(null);
  const [item, setItem] = useState(null);
  const [action, setAction] = useState<Action>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const methods = Followings.getMethods(router, params.translations);
  const renders = Followings.getRenders();
  const batchActions = Followings.getBatchActions(setIds, params.translations);
  const itemActions = Followings.getItemActions(setAction, params.translations);

  const onActionClickHandler = async (data: any) => {
    methods.action.onClick(data, setItem);
  };

  const setIsLoadingHandler = (loading: boolean) => {
    setIsLoading(loading);
  };

  const actionClear = () => {
    setAction(null);
  };

  const actionHandler = async (data: any) => {
    if (action?.method) {
      setIsLoadingHandler(true);
      await methods[action?.method](data);
      setIsLoadingHandler(false);
    }

    actionClear();
  };

  return (
    <>
      <InstagramLogin />
      <ListLayout
        {...params}
        methods={methods}
        renders={renders}
        batchActions={batchActions}
        itemActions={itemActions}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        onCopy={methods.onCopy}
        loading={isLoading}
        setExternalLoading={setIsLoadingHandler}
        noAdd={true}
        noDelete={true}
        actionLabel={methods.action.label}
        actionIcon={methods.action.icon}
        onAction={onActionClickHandler}
      />
      <MessagePanel
        ids={ids}
        items={params.items}
        translations={params.translations}
        setIds={setIds}
        layouts={params.layouts}
        onSave={methods.onMessageSave}
        setIsLoading={setIsLoadingHandler}
      />
      <InstagramChat
        item={item}
        translations={params.translations}
        setItem={setItem}
        onSave={methods.onSendInstagramMessage}
      />
      <Modal
        open={action?.type === ACTIONS.CANCEL_MESSAGE && action?.open}
        onRequestClose={() => actionClear()}
        onRequestSubmit={() => actionHandler(action?.item)}
        danger
        modalHeading={params.translations?.[action?.type as string]?.header || "Header"}
        closeButtonLabel={params.translations.close}
        primaryButtonText={params.translations.confirm}
        secondaryButtonText={params.translations.cancel}
        modalLabel={params.translations?.[action?.type as string]?.label || "Label"}
      />
    </>
  );
}
