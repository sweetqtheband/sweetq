"use client";

import { breakpoint, isMobile } from "@/app/utils";
import { useCallback, useContext, useEffect, useState } from "react";
import { WindowContext } from "@/app/context";
import CSSVars from "@/app/components/css/var";

export default function HeaderView({
  translations,
  headerImage,
  headerMobileImage,
  headerVideo,
  headerMobileVideo,
  children,
}: {
  translations: Record<string, string>;
  headerImage?: string;
  headerMobileImage?: string;
  headerVideo?: string;
  headerMobileVideo?: string;
  children?: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  const getImage = useCallback(
    () => (isClient && (isMobile() || breakpoint("mobile")) ? headerMobileImage : headerImage),
    [isClient, headerMobileImage, headerImage]
  );
  const getVideo = useCallback(
    () => (isClient && (isMobile() || breakpoint("mobile")) ? headerMobileVideo : headerVideo),
    [isClient, headerMobileVideo, headerVideo]
  );

  const windowState = useContext(WindowContext);
  const [image, setImage] = useState(getImage());
  const [video, setVideo] = useState(getVideo());
  const [shouldUpdate, setShouldUpdate] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!shouldUpdate && windowState?.resizing) {
      setShouldUpdate(true);
    } else if (shouldUpdate && !windowState?.resizing) {
      setImage(getImage());
      setVideo(getVideo());
      setShouldUpdate(false);
    }
  }, [windowState, shouldUpdate, getImage, getVideo]);

  return (
    <>
      <CSSVars name="header-background-image" value={`url(${image})`}></CSSVars>
      <div className="sq-bg">
        <video className="sq-bg-video" autoPlay muted loop playsInline src={video}></video>
        <div className="sq-wrapper">{children}</div>
      </div>
    </>
  );
}
