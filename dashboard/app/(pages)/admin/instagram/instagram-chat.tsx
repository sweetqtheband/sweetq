import { ContentArea, Panel } from '@/app/components';
import { SkeletonPlaceholder, SkeletonText } from '@carbon/react';
import { useEffect, useRef, useState } from 'react';

import './instagram-chat.scss';
import { instagram } from '@/app/services/instagram';
import { dateFormat, getClasses } from '@/app/utils';
import { renderField } from '@/app/render';
import { FIELD_TYPES } from '@/app/constants';
import { useEventBus } from '@/app/hooks/event';
import { off } from 'process';

export default function InstagramChat({
  item,
  translations,
  setItem = () => true,
  onSave = () => true,
}: Readonly<{
  item: Record<string, any> | null;
  translations: Record<string, any>;
  setItem: Function;
  onSave: Function;
}>) {
  const [messages, setMessages] = useState<any[]>([]);
  const [forceClose, setForceClose] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const data: Record<string, any> = {
    date: null,
    username: null,
  };

  const { on: onInstagramMessage, off: offInstragramMessage } =
    useEventBus('chat');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  onInstagramMessage((data) => {
    if (
      data.message &&
      data.sender.id === String(item?.instagram_id) &&
      data.recipient.id === process.env.NEXT_PUBLIC_INSTAGRAM_ID
    ) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.message.mid,
          from: {
            username: item?.username,
            id: item?.instagram_id,
          },
          to: {
            data: [
              {
                username: process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME,
                id: process.env.NEXT_PUBLIC_INSTAGRAM_ID,
              },
            ],
          },
          message: data.message.text,
          created_time: new Date(data.timestamp).toISOString(),
        },
      ]);
    }
  });

  useEffect(() => {
    if (item && !isInitialized) {
      const initialize = async () => {
        const response = await instagram.getMessages(
          item.instagram_conversation_id
        );

        setMessages([...response.data.reverse()]);

        setIsInitialized(true);
      };
      initialize();
    }
  }, [item, isInitialized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onCloseHandler = async () => {
    setIsInitialized(false);
    setForceClose(false);
    setItem(null);
    offInstragramMessage();
  };

  const onSaveHandler = async (text: string) => {
    if (text) {
      const { data: response } = await onSave({
        text,
        conversation_id: item?.instagram_conversation_id,
        recipient: item?.instagram_id,
      });

      if (response) {
        const data = response.data;

        if (data) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: data.message_id,
              from: {
                username: process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME,
                id: process.env.NEXT_PUBLIC_INSTAGRAM_ID,
              },
              to: {
                data: [
                  {
                    username: item?.username,
                    id: item?.instagram_id,
                  },
                ],
              },
              message: text,
              created_time: new Date().toISOString(),
            },
          ]);
        }
      }
    }
  };

  const parseDate = (date: Date) => {
    let formatStr = 'chat.date';
    if (today.getFullYear() !== date.getFullYear()) {
      formatStr = 'chat.dateYear';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      yesterday.getFullYear() === date.getFullYear() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getDate() === date.getDate()
    ) {
      formatStr = 'chat.dateYesterday';
    }

    if (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    ) {
      formatStr = 'chat.dateToday';
    }

    return dateFormat(date, formatStr, null, translations);
  };

  const renderMessage = (
    msg: Record<string, any>,
    previous: Record<string, any> | null,
    next: Record<string, any> | null,
    index: number
  ) => {
    const isMe =
      process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME === msg.from.username;

    let hideAvatar = false;

    const classesObj: any = {
      message: true,
      'message-personal': isMe,
      'message-first': false,
      'message-last': false,
    };

    const img = !isMe
      ? renderField({
          type: FIELD_TYPES.IMAGE,
          field: msg.from.username,
          value: item?.profile_pic_url,
        })
      : null;

    const createdTime = new Date(msg.created_time);
    const date = dateFormat(createdTime, 'timestamp', null, translations);

    let updateDate = false;
    if (date !== data.date) {
      data.date = date;
      updateDate = true;
    }

    if (
      updateDate ||
      !previous ||
      previous.from.username !== msg.from.username
    ) {
      classesObj['message-first'] = true;
    } else {
      if (
        (next &&
          next.from.username !== msg.from.username &&
          previous?.from.username === msg.from.username) ||
        (next?.created_time &&
          date !==
            dateFormat(
              new Date(next.created_time),
              'timestamp',
              null,
              translations
            ) &&
          next.from.username === msg.from.username &&
          previous?.from.username === msg.from.username) ||
        !next
      ) {
        classesObj['message-last'] = true;
      }
    }

    if (
      !isMe &&
      next?.from.username === msg.from.username &&
      next?.created_time &&
      date ===
        dateFormat(new Date(next.created_time), 'timestamp', null, translations)
    ) {
      hideAvatar = true;
    }

    const classes = getClasses(classesObj);

    return (
      <div key={`loop-${index}`}>
        {updateDate ? (
          <div className="date" key={`date-${index}`}>
            {parseDate(createdTime)}
          </div>
        ) : null}
        <div className={classes} key={`message-${index}`}>
          {!isMe && !hideAvatar ? (
            <figure className="avatar">{img}</figure>
          ) : null}
          <LinkifyText text={msg.message} />
        </div>
      </div>
    );
  };

  const LinkifyText = ({ text }: { text: string }) => {
    return (
      <p>
        {text.split(/(https?:\/\/\S+)/g).map((part, index) =>
          part.match(/https?:\/\/\S+/) ? (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  const renderSkeletons = (count: number) => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      const classes = getClasses({
        message: true,
        skeleton: true,
        spaced: true,
        'message-personal': i % 2 !== 0,
        'message-first': true,
      });

      skeletons.push(
        <div className={classes} key={`skeleton-${i}`}>
          {i % 2 === 0 ? (
            <div className="avatar">
              <SkeletonPlaceholder />
            </div>
          ) : null}
          <div className="text">
            <SkeletonText />
          </div>
        </div>
      );
    }
    return skeletons;
  };

  const getContent = (item: Record<string, any>) => {
    return (
      <>
        <div className="chat--header">
          <div className="title">{item.full_name}</div>
          <div className="subtitle">{item.username}</div>
          <figure className="avatar">
            {renderField({
              type: FIELD_TYPES.IMAGE,
              field: item.username,
              value: item?.profile_pic_url,
            })}
          </figure>
        </div>
        <div className="chat--area" ref={scrollRef}>
          <div className="messages">
            {!isInitialized
              ? renderSkeletons(5)
              : messages.map((message, index) =>
                  renderMessage(
                    message,
                    messages?.[index - 1] || null,
                    messages?.[index + 1] || null,
                    index
                  )
                )}
          </div>
        </div>
        <footer>
          <ContentArea
            id="message"
            variant="input"
            translations={translations}
            onSend={onSaveHandler}
            hasParameter={false}
          />
        </footer>
      </>
    );
  };
  const content = item ? getContent(item) : null;

  return (
    <Panel
      overlay={false}
      actionIcon={null}
      onClose={onCloseHandler}
      forceClose={forceClose}
    >
      {content}
    </Panel>
  );
}
