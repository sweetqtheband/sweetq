"use client";

import { ACTIONS, STORAGE, TREATMENTS } from "@/app/constants";
import { Storage } from "@/app/services/storage";
import Image from "next/image";

export default function TableCell({
  follower
}: 
Readonly<{
  follower: Record<string, any>
}>) {
  
  const imageErrorHandler = (e:any) => {
    Storage.setValue(ACTIONS.DATA_UPDATE, true, STORAGE.LOCAL);
  }

  return (
    <div className="table--row">
      <div className="table--cell name" data-id={follower.id}>
        <Image
          alt={follower.full_name}
          className="image"
          width={40}
          height={40}
          onError={imageErrorHandler}
          src={follower.profile_pic_url}
        ></Image>
        {follower.full_name !== "" ? follower?.full_name : follower.username}
      </div>
      <div className="table--cell treatment">
        {TREATMENTS[(follower.treatment || 1) - 1]}
      </div>
    </div>
  )
};
