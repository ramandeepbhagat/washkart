import React from "react";

export default function ProjectDemo() {
  const handleOnLoad = (e) => {
    console.log(e);
    let g = document.getElementById("demo_gif");
    g.style.display = "none";
  };

  return (
    <div className="container">
      <h1>
        Project video -
        <a href="https://github.com/ramandeepbhagat/washkart" target="_blank">
          &nbsp;Source code
        </a>
      </h1>
      <div className="my-3">
        <div
          style={{
            position: "relative",
            paddingBottom: 56.25 + "%",
            height: 0,
          }}
        >
          <img
            id="demo_gif"
            src="https://cdn.loom.com/sessions/thumbnails/2f5a294a7f1b45af8318233c22a75a86-with-play.gif"
          />

          <iframe
            className="iframe-video-demo"
            src="https://www.loom.com/embed/2f5a294a7f1b45af8318233c22a75a86"
            frameBorder="0"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allowFullScreen={true}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 100 + "%",
              height: 100 + "%",
            }}
            onLoad={handleOnLoad}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
