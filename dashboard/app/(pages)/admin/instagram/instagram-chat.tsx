import { ContentArea, Panel } from '@/app/components';
import { Section } from '@carbon/react';
import { useEffect, useState } from 'react';

import './instagram-chat.scss';
import { instagram } from '@/app/services/instagram';
import { dateFormat, getClasses } from '@/app/utils';
import { renderField } from '@/app/render';
import { FIELD_TYPES } from '@/app/constants';
import { format } from 'path';

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
  const [message, setMessage] = useState<string>('');
  const [forceClose, setForceClose] = useState<boolean>(false);
  const data: Record<string, any> = {
    date: null,
    username: null,
  };

  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  useEffect(() => {
    if (item && !isInitialized) {
      const initialize = async () => {
        const response = await instagram.getMessages(
          item.instagram_conversation_id
        );

        setMessages(response.data.reverse());

        setIsInitialized(true);
      };
      initialize();
    }
  }, [item, isInitialized]);
  const onSaveHandler = async () => {
    setForceClose(true);
    setIsInitialized(false);
    setItem(null);
  };

  const onCloseHandler = async () => {
    setIsInitialized(false);
    setForceClose(false);
    setItem(null);
  };

  const onInputHandler = (text: string) => {
    setMessage(text);
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

  const renderMessage = (msg: Record<string, any>) => {
    const isMe =
      process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME === msg.from.username;
    const classesObj = {
      message: true,
      'message-personal': isMe,
    };

    const classes = getClasses(classesObj);

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

    return (
      <div key={msg.id}>
        {updateDate ? (
          <div className="date">{parseDate(createdTime)}</div>
        ) : null}
        <div className={classes}>
          {!isMe ? <figure className="avatar">{img}</figure> : null}
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
        <div className="chat--area">
          <div className="messages">
            {messages.map((message) => renderMessage(message))}
          </div>
        </div>
        <footer>
          <ContentArea
            id="message"
            variant="input"
            translations={translations}
            onChange={(text: string) => {
              onInputHandler(text);
            }}
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
