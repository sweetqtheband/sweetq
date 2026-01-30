"use client";

import { InstagramLogin } from "@/app/components";
import ListLayout from "@/app/components/layouts/list-layout";
import { ACTIONS, Followings } from "@/app/services/followings";
import { useRouter } from "next/navigation";
import MessagePanel from "../message-panel";
import InstagramChat from "../instagram-chat";
import { useState, useMemo, useCallback } from "react";
import { Modal } from "@carbon/react";
import { Action } from "@/types/action";
import { useDeepMemo } from "@/app/hooks/memo";

export default function InstagramView(params: Readonly<any>) {
  const [ids, setIds] = useState(null);
  const [item, setItem] = useState(null);
  const [action, setAction] = useState<Action>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<string | null>("");

  const router = useRouter();

  // Memoize props from server component to prevent new references on re-renders
  const memoItems = useDeepMemo(params.items);
  const memoHeaders = useDeepMemo(params.headers);
  const memoFields = useDeepMemo(params.fields);
  const memoFilters = useDeepMemo(params.filters);
  const memoMultiFields = useDeepMemo(params.multiFields);
  const memoTranslations = useDeepMemo(params.translations);
  const memoLayouts = useDeepMemo(params.layouts);

  // Memoize all objects to prevent unnecessary re-renders
  const methods = useMemo(
    () => Followings.getMethods(router, memoTranslations, open === ACTIONS?.BATCH_EDIT),
    [router, memoTranslations, open]
  );

  const renders = useMemo(() => Followings.getRenders(), []);

  const batchActions = useMemo(
    () => Followings.getBatchActions(setIds, memoTranslations, setOpen),
    [memoTranslations]
  );

  const itemActions = useMemo(
    () => Followings.getItemActions(setAction, memoTranslations),
    [memoTranslations]
  );

  // Memoize CONSTANTS to prevent new object reference on every render
  const CONSTANTS_MEMO = useMemo(() => ({ ACTIONS }), []);

  // Memoize nested method properties to prevent new references on every render
  const onSave = useMemo(() => methods.onSave, [methods]);
  const onDelete = useMemo(() => methods.onDelete, [methods]);
  const onCopy = useMemo(() => methods.onCopy, [methods]);
  const actionLabel = useMemo(() => methods.action?.label ?? "", [methods]);
  const actionIcon = useMemo(() => methods.action?.icon ?? null, [methods]);
  const onMessageSave = useMemo(() => methods.onMessageSave, [methods]);
  const onSendInstagramMessage = useMemo(() => methods.onSendInstagramMessage, [methods]);

  const onActionClickHandler = useCallback(
    async (data: any) => {
      methods.action.onClick(data, setItem);
    },
    [methods.action]
  );

  const setIsLoadingHandler = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const actionClear = useCallback(() => {
    setAction(null);
  }, []);

  const actionHandler = useCallback(
    async (data: any) => {
      if (action?.method) {
        setIsLoadingHandler(true);
        await methods[action?.method](data);
        setIsLoadingHandler(false);
      }

      actionClear();
    },
    [action?.method, methods, setIsLoadingHandler, actionClear]
  );

  return (
    <>
      <InstagramLogin />
      <ListLayout
        id={params.id}
        items={memoItems}
        headers={memoHeaders}
        fields={memoFields}
        multiFields={memoMultiFields}
        filters={memoFilters}
        translations={memoTranslations}
        total={params.total}
        limit={params.limit}
        pages={params.pages}
        ids={ids}
        methods={methods}
        renders={renders}
        batchActions={batchActions}
        itemActions={itemActions}
        onSave={onSave}
        onDelete={onDelete}
        onCopy={onCopy}
        loading={isLoading}
        setExternalLoading={setIsLoadingHandler}
        noAdd={true}
        noDelete={true}
        actionLabel={actionLabel}
        actionIcon={actionIcon}
        onAction={onActionClickHandler}
        open={open}
        setOpen={setOpen}
        CONSTANTS={CONSTANTS_MEMO}
      />
      <MessagePanel
        ids={ids}
        items={memoItems}
        translations={memoTranslations}
        setIds={setIds}
        layouts={memoLayouts}
        onSave={onMessageSave}
        setIsLoading={setIsLoadingHandler}
        open={open}
        setOpen={setOpen}
        CONSTANTS={CONSTANTS_MEMO}
      />
      <InstagramChat
        item={item}
        translations={memoTranslations}
        setItem={setItem}
        onSave={onSendInstagramMessage}
      />
      <Modal
        open={action?.type === ACTIONS?.CANCEL_MESSAGE && action?.open}
        onRequestClose={() => actionClear()}
        onRequestSubmit={() => actionHandler(action?.item)}
        danger
        modalHeading={memoTranslations?.[action?.type as string]?.header || "Header"}
        closeButtonLabel={memoTranslations.close}
        primaryButtonText={memoTranslations.confirm}
        secondaryButtonText={memoTranslations.cancel}
        modalLabel={memoTranslations?.[action?.type as string]?.label || "Label"}
      />
    </>
  );
}
