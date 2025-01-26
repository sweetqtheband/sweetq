import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import albums from "../../assets/data/albums";
import medias from "../../assets/data/tracks";
import path from "path";

app.get("/media", (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});

app.get("/media/:trackId", (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias.find((item) => item.id === req.params.trackId) });
  }
});

app.get("/media/album/:albumId", (req, res) => {
  if (authSvc.auth(req, res)) {
    const album = albums.find((album) => album.id === req.params.albumId);
    if (album) {
      res.json({
        data: {
          ...album,
          tracks: album.tracks.map((track) =>
            medias.find((item) => item.id === track.id)
          ),
        },
      });
    } else {
      res.status(404).json({ error: "Album not found" });
    }
  }
});

app.get("/media/:trackId/download", (req, res) => {
  if (authSvc.auth(req, res)) {
    const media = medias.find((item) => item.id === req.params.trackId);
    if (media && media.download) {
      const file = path.join(__dirname, "..", `media/${media.id}.mp3`);
      res.download(file);
    }
  }
});
