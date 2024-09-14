"use client"

import { Input, Button } from "@/app/components";
import { useRef, useState } from "react";
import "./page.scss";
import { Auth } from "@/app/services/auth";
import Image from "next/image";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";


export default function LoginPage() {
  const passwordRef = useRef(null);
  
  const [formState, setFormState] = useState({ username: "", password: "" });

  const [invalidCredentials, setInvalidCredentials] = useState(false);
  
  const onInputHandler = (field: string, value:string) => {
    setFormState({
      ...formState,
      [field]: value
    })
  };

  const onSaveHandler = async () => {
    if (invalidCredentials) {
      setInvalidCredentials(false);
    }

    try {
      await Auth.login(formState);
      location.href = "/dashboard";
    } catch (err:any) {
      console.log(err);
      if (err.response.status === HTTP_STATUS_CODES.ERROR) {
        setInvalidCredentials(err.response.data === ERRORS.INVALID_CREDENTIALS);
      }
    }
  };

  const onUsernameKeyUpHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (passwordRef.current) 
      {
        const input = passwordRef.current as HTMLInputElement;
        input.focus();
      }
    } else if (invalidCredentials) {
      setInvalidCredentials(false);
    }
  };

  const onPasswordKeyUpHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
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
            alt={"Logo"}
            className="image"
            width={80}
            height={80}
            src={"logo.svg"}
          ></Image>
        </header>
        <section>
          <Input
            name="username"
            type="text"
            value=""
            error={invalidCredentials}
            onInput={(value: string) => onInputHandler("username", value)}
            onKeyUp={onUsernameKeyUpHandler}
            placeholder={"Usuario"}
          ></Input>
          <Input
            ref={passwordRef}
            name="password"
            type="password"
            value=""
            error={invalidCredentials}
            onInput={(value: string) => onInputHandler("password", value)}
            onKeyUp={onPasswordKeyUpHandler}
            placeholder={"Password"}
          ></Input>
        </section>
        <footer>
          <Button onClick={onSaveHandler}>Login</Button>
        </footer>
      </div>
    </div>
  );
}
