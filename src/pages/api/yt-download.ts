import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
import cp from "child_process";

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

type Temp = {
  url: string;
};

//TODO: Write Typescript types 
const downloadVideoAndAudio = (url, audioOptions, videoOptions) => {
  const ffmpegArgs = [
    // Suppress output
    "-loglevel", "8", "-hide_banner",
    // Inputs
    "-i", "pipe:3",
    "-i", "pipe:4",
    // Map audio and video from streams
    "-map", "0:a",
    "-map", "1:v",
    // Keep encoding
    "-vcodec", "copy",
    // Define output file
    "output.mkv"
  ];

  const ffmpegProcess = cp.spawn(ffmpeg, ffmpegArgs, {
    windowsHide:true,
    stdio: [
      // stdin, stdout, stderr
      "inherit","pipe","inherit",
      // pipes (both input videos)
      "pipe","pipe"
    ]
  });

  return ffmpegProcess;
};

const downloadFile = (
  req: NextApiRequest<Temp>,
  res: NextApiResponse<Data>
) => {
  if (req.method !== "POST") {
    res.send({ error: "Invalid Request", reqMethod: req.method });
  }

  const url = req.body.url;
  const isUrlValid = ytdl.validateURL(url);

  if (!isUrlValid) {
    res.send({ error: "Invalid Youtube URL" });
  }

  // Set Headers
  const fileName = "foobar";
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "application/octet-stream");

  try {
    const audioOptions = {quality: "highestaudio"};
    const videoOptions = {quality: "highestvideo"};

    const download = downloadVideoAndAudio(url, audioOptions, videoOptions);

    const audioDownload = ytdl(url, audioOptions);
    const videoDownload = ytdl(url, videoOptions);

    audioDownload.pipe(download.stdio[3]);
    videoDownload.pipe(download.stdio[4]);
    download.stdout.pipe(res);

  } catch (e) {
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({ error: `Unknown Error: ${e}` });
  }
};

export default downloadFile;
