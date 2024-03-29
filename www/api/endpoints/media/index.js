import { app } from "../../services/app";
import { authSvc } from "../../services/auth";

const medias = [
  {
    id: "caminocorrecto",
    title: "El camino correcto",
    date: "2023-05-05",
    cover: "caminocorrecto.jpg",
    status: "released",
  },
  {
    id: "atrapado",
    title: "Atrapado en el tiempo",
    date: "2024-01-26",
    cover: "atrapado.jpg",
    status: "released",
  },
  {
    id: "losiento",
    title: "Lo siento, pero no",
    date: "2024-03-29",
    cover: "losiento.jpg",
    status: "latest",
  },
  {
    id: "quevamos",
    title: "¿Qué vamos a hacer?", 
    date: "2024-05-01",
    cover: "quevamos.jpg",
    status: "upcoming",
  },
  {
    id: "ley",
    title: "Ley de la atracción",
    date: "2024-07-01",
    cover: "ley.jpg",
    status: "upcoming",
  },
  {
    id: "fiesta",
    title: "Fiesta",
    date: "2024-09-01",
    cover: null,
    status: "upcoming",
  },
];

app.get('/media', (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});