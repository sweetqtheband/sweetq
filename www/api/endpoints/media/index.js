import { app } from "../../services/app";
import { authSvc } from "../../services/auth";

const medias = [
  {
    id: "caminocorrecto",
    title: "El camino correcto",
    date: "2023-05-05",
    cover: "caminocorrecto.jpg",
    video: "caminocorrecto.mp4",
    status: "released",
  },
  {
    id: "atrapado",
    title: "Atrapado en el tiempo",
    date: "2024-01-26",
    cover: "atrapado.jpg",
    video: "atrapado.mp4",
    status: "released",
  },
  {
    id: "losiento",
    title: "Lo siento, pero no",
    date: "2024-03-29",
    cover: "losiento.jpg",
    video: "losiento.mp4",
    status: "latest",
  },
  {
    id: "quevamos",
    title: "¿Qué vamos a hacer?",
    date: "2024-06-28",
    cover: "quevamos.jpg",
    video: "default.mp4",
    status: "upcoming",
    spotifyId: "album/732Pm0mxnNeGec676x28vW",
    appleId: "album/qué-vamos-a-hacer/1734913974",
  },
  {
    id: "ley",
    title: "Ley de la atracción",
    date: "2024-09-01",
    cover: "ley.jpg",
    video: "default.mp4",
    status: "upcoming",
  },
  {
    id: "fiesta",
    title: "Fiesta",
    date: "2024-11-01",
    cover: "fiesta.jpg",
    video: "default.mp4",
    status: "upcoming",
  },
];

app.get('/media', (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});

app.get("/media/:trackId", (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias.find(item => item.id === req.params.trackId) });
  }
});