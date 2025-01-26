import path from "path";
import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import fs from "fs";
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { loadMusicMetadata } from "music-metadata";

app.get("/stream*", (req, res) => {
  if (authSvc.auth(req, res)) {
    const file = path.join(
      __dirname,
      "..",
      `media/${String(req.params["0"]).replace("/", "")}.mp3`
    );
    const stat = fs.statSync(file);
    const total = stat.size;
    if (req.headers?.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const partialStart = parts[0];
      const partialEnd = parts[1];

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
      const chunksize = end - start + 1;
      const rstream = fs.createReadStream(file, { start: start, end: end });

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "audio/mpeg",
      });
      rstream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": total,
        "Content-Type": "audio/mpeg",
      });
      fs.createReadStream(file).pipe(res);
    }
  }
});

// const bucketName = "sweetq-web";

// const s3 = new S3Client({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// app.get("/stream*", async (req, res) => {
//   if (authSvc.auth(req, res)) {
//     const fileName = `/media/${String(req.params["0"]).replace("/", "")}.wav`;

//     try {
//       // Obtener los metadatos del archivo
//       const headCommand = new HeadObjectCommand({
//         Bucket: bucketName,
//         Key: fileName,
//       });
//       const head = await s3.send(headCommand);
//       const fileSize = head.ContentLength;
//       const contentType = head.ContentType;

//       // Leer el encabezado "Range" del cliente
//       const range = req.headers.range;
//       if (!range) {
//         // Si no se especifica el rango, devolver un error 416
//         return res.status(416).send("Range header required");
//       }

//       const parts = range.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end =
//         parts[1] && parseInt(parts[1], 10) <= fileSize - 1
//           ? parseInt(parts[1], 10)
//           : fileSize - 1;

//       if (start >= fileSize) {
//         return res.status(416).send("Requested range not satisfiable");
//       }

//       const chunkSize = end - start + 1;

//       // Obtener el rango especificado del archivo desde S3
//       const getObjectCommand = new GetObjectCommand({
//         Bucket: bucketName,
//         Key: fileName,
//         Range: `bytes=${start}-${end}`,
//       });

//       const response = await s3.send(getObjectCommand);

//       // Configurar los encabezados de respuesta para streaming
//       res.writeHead(206, {
//         "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": chunkSize,
//         "Content-Type": contentType,
//       });

//       // Transmitir el archivo en el rango solicitado
//       response.Body.pipe(res);
//     } catch (error) {
//       console.error("Error al transmitir el archivo:", error);
//       res.status(500).send("Error al transmitir el archivo.");
//     }
//   }
// });

app.get("/metadata-stream*", async (req, res) => {
  const file = path.join(
    __dirname,
    "..",
    `media/${String(req.params["0"]).replace("/", "")}.mp3`
  );

  const fsStat = fs.statSync(file);
  const mm = await loadMusicMetadata();

  const data = await mm.parseFile(file);
  res.json({
    data: {
      fileSize: fsStat.size,
      duration: data.format.duration,
    },
  });
});
