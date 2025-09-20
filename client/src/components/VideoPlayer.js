import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ videoUrl, poster, captions=[] }){
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);

  React.useEffect(()=>{
    if(!videoRef.current) return;
    playerRef.current = videojs(videoRef.current, {
      controls:true,
      preload:"auto",
      fluid:true,
      playbackRates:[0.5, 1, 1.25, 1.5, 2]
    });
    const p = playerRef.current;
    if(videoUrl) p.src({ src: videoUrl, type: "video/mp4" });
    if(captions?.length){
      captions.forEach(c=>{
        p.addRemoteTextTrack({ kind:"captions", label:c.label, src:c.src, srclang:c.lang, default:c.default }, false);
      });
    }
    return ()=>{ p.dispose(); };
  },[videoUrl, captions]);
  
  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin" poster={poster}></video>
    </div>
  ); 
}