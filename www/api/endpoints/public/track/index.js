import { app } from "../../../services/app";
import medias from "../../../assets/data/tracks";

app.get("/public/track/:trackId", (req, res) => {
  res.json({ data: medias.find((item) => item.id === req.params.trackId) });
});
