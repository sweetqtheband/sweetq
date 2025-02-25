'use client';

import { ChangeEvent, KeyboardEventHandler, useRef, useState } from 'react';
import './page.scss';
import { Auth } from '@/app/services/auth';
import Image from 'next/image';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { TextInput, Button, PasswordInput } from '@carbon/react';
import { translationIds } from '@carbon/react/lib/components/NumberInput/NumberInput';

export default function LoginView({
  translations = {},
}: Readonly<{
  translations: Record<string, string>;
}>) {
  const passwordRef = useRef(null);

  const [formState, setFormState] = useState({ username: '', password: '' });

  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const onInputHandler = (field: string, value: string) => {
    setFormState({
      ...formState,
      [field]: value,
    });
  };

  const onSaveHandler = async () => {
    if (invalidCredentials) {
      setInvalidCredentials(false);
    }

    try {
      await Auth.login(formState);
      location.href = '/admin/dashboard';
    } catch (err: any) {
      if (err.response.status === HTTP_STATUS_CODES.ERROR) {
        setInvalidCredentials(err.response.data === ERRORS.INVALID_CREDENTIALS);
      }
    }
  };

  const onUsernameKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === 'Enter') {
      if (passwordRef.current) {
        const input = passwordRef.current as HTMLInputElement;
        input.focus();
      }
    } else if (invalidCredentials) {
      setInvalidCredentials(false);
    }
  };

  const onPasswordKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === 'Enter') {
      onSaveHandler();
      if (passwordRef.current) {
        const input = passwordRef.current as HTMLInputElement;
        input.blur();
      }
    } else if (invalidCredentials) {
      setInvalidCredentials(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login">
        <header>
          <Image
            alt={'Logo'}
            className="image"
            width={80}
            height={80}
            src={'/logo.svg'}
          ></Image>
        </header>
        <section>
          <TextInput
            id="username"
            labelText={translations.email}
            name="username"
            type="text"
            value={formState.username}
            invalid={invalidCredentials}
            size="md"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onInputHandler('username', event.target?.value)
            }
            onKeyUp={onUsernameKeyUpHandler}
            placeholder={translations.email}
          />
          <PasswordInput
            id="password"
            labelText={translations.password}
            ref={passwordRef}
            name="password"
            type="password"
            value={formState.password}
            invalid={invalidCredentials}
            size="md"
            showPasswordLabel={translations.showPassword}
            hidePasswordLabel={translations.hidePassword}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onInputHandler('password', event.target?.value)
            }
            onKeyUp={onPasswordKeyUpHandler}
            placeholder={translations.password}
          />
        </section>
        <footer>
          <Button kind="secondary" onClick={onSaveHandler}>
            {translations.login}
          </Button>
        </footer>
      </div>
    </div>
  );
}
