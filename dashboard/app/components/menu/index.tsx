'use client';

import { Route } from "@/types/route.d";
import Link from "next/link";

import './menu.scss';
import Image from "next/image";
import { Auth } from "@/app/services/auth";
import { useEffect, useState } from "react";
import { ACTIONS, STORAGE } from "@/app/constants";
import { Storage } from "@/app/services/storage";
import { Button } from "..";
import { Update } from "@/app/services/update";

export default function MenuComponent() {
  const routes: Route[] = [
    {
      text: 'Instagram',
      path: '/instagram',
    }, {
      text: 'Gmail',
      path: '/gmail'
    }
  ];

  const [needUpdate, setNeedUpdate] = useState(false);

  const logoutHandler = () => {
    Auth.logout();
  }

  const updateHandler = () => {
    Update.schedule();
  }

  useEffect(() => {
    setNeedUpdate(Storage.getValue(ACTIONS.DATA_UPDATE, STORAGE.LOCAL))    
  }, []);

  return (
    <nav className="menu">
      <div className="left">
        <ul>
          {routes.map((route) => (
            <li key={route.path}>
              <Link href={route.path}>{route.text}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="right">
        { needUpdate ? <Button variant="secondary" onClick={updateHandler}>Actualizar</Button> :  null }
        <Image
          alt={"Salir"}
          width={40}
          height={40}
          onClick={logoutHandler}
          src={"/icons/logout.svg"}
        ></Image>
      </div>
    </nav>
  );
}