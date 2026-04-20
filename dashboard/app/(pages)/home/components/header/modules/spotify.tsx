import { HeaderComponentProps } from "@/app/(pages)/home/interfaces";

export default async function SpotifyModule(props: Readonly<HeaderComponentProps>) {
  const { config } = props;
  return (
    <div className="sq-spotify-wrapper">
      <iframe
        width="100%"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: "12px" }}
        src={config.spotifyId}
      ></iframe>
    </div>
  );
}
