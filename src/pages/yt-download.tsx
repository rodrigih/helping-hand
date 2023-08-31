import React, { useState } from "react";
import Axios from "axios";
import FileDownload from "js-file-download";

type VideoDownloadFormElement = HTMLFormControlsCollection & {
  url: HTMLInputElement;
};

type VideoDownloadForm = HTMLFormElement & {
  readonly elements: VideoDownloadFormElement;
};

const defaultFileName = "download.webm";

const getFileNameFromHeader = (response) => {
  const contentDisposition = response.headers["content-disposition"];

  if (!contentDisposition) {
    return defaultFileName;
  }

  const [_, fileName] = contentDisposition.split("filename=");

  return fileName;
};

const handleSubmit = async (
  e: React.FormEvent<VideoDownloadForm>,
  setLink: (link: string) => void,
  setError: (error: any) => void
) => {
  e.preventDefault();

  const form = e.currentTarget.elements;
  const url = form.url.value;

  setLink(url);

  // Fetch Video and initiate Download
  const response = await Axios({
    method: "POST",
    url: "api/yt-download",
    responseType: "blob",
    data: { url },
  });

  const fileName = getFileNameFromHeader(response);

  if (response.status === 200) {
    setError(null);
    FileDownload(response.data, fileName);
  }
  else {
    setError(response.data);
  }
};

const YTDownload = () => {
  const [link, setLink] = useState("");
  const [error, setError] = useState(null);

  const renderLink = () => {
    if (!link) {
      return null;
    }

    return (
      <div>
        <div>You entered: &quot;{link}&quot;</div>
        <div>Download should start soon.</div>
      </div>
    );
  };

  const renderError = () => {
    if (error) {
      return (
        <div>
          <div>ERROR:</div>
          <div>{error}</div>
        </div>
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col">
        <h1>Video Download Page</h1>

        <form
          onSubmit={(e) => {
            handleSubmit(e as React.FormEvent<VideoDownloadForm>, setLink, setError);
          }}
        >
          <label htmlFor="url">Enter URL:</label>
          <input type="text" name="url" />
          <input type="submit" className="block" />
        </form>

        {renderLink()}
        {renderError()}
      </div>
    </main>
  );
};

export default YTDownload;
