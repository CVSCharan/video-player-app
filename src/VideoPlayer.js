import React, { useState, useRef, useEffect } from "react";
// import "./VideoPlayer.css";

const VideoPlayer = () => {
  const [isPaused, setIsPaused] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCaptionsVisible, setIsCaptionsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPaused, setWasPaused] = useState(true);

  const videoRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName.toLowerCase() === "input") return;

      switch (e.key.toLowerCase()) {
        case " ":
          if (document.activeElement.tagName.toLowerCase() === "button") return;
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullScreenMode();
          break;
        case "t":
          toggleTheaterMode();
          break;
        case "i":
          toggleMiniPlayerMode();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          skip(-5);
          break;
        case "arrowright":
        case "l":
          skip(5);
          break;
        case "c":
          toggleCaptions();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (isPaused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const toggleTheaterMode = () => {
    setIsTheater(!isTheater);
  };

  const toggleFullScreenMode = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMiniPlayerMode = () => {
    if (isMiniPlayer) {
      document.exitPictureInPicture();
    } else {
      videoRef.current.requestPictureInPicture();
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (duration) => {
    videoRef.current.currentTime += duration;
  };

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    videoRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === "0");
  };

  const changePlaybackSpeed = () => {
    let newPlaybackRate = videoRef.current.playbackRate + 0.25;
    if (newPlaybackRate > 2) newPlaybackRate = 0.25;
    videoRef.current.playbackRate = newPlaybackRate;
    setPlaybackRate(newPlaybackRate);
  };

  const toggleCaptions = () => {
    const captions = videoRef.current.textTracks[0];
    const isHidden = captions.mode === "hidden";
    captions.mode = isHidden ? "showing" : "hidden";
    setIsCaptionsVisible(isHidden);
  };

  const handleLoadedData = () => {
    setDuration(videoRef.current.duration);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleTimelineUpdate = (e) => {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    const previewImgNumber = Math.max(
      1,
      Math.floor((percent * videoRef.current.duration) / 10)
    );
    const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`;

    if (isScrubbing) {
      e.preventDefault();
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }

    timelineContainerRef.current.style.setProperty(
      "--preview-position",
      percent
    );
    timelineContainerRef.current.style.setProperty(
      "--progress-position",
      percent
    );
  };

  const toggleScrubbing = (e) => {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    const isCurrentlyScrubbing = (e.buttons & 1) === 1;

    if (isCurrentlyScrubbing) {
      setWasPaused(videoRef.current.paused);
      videoRef.current.pause();
    } else {
      videoRef.current.currentTime = percent * videoRef.current.duration;
      if (!wasPaused) videoRef.current.play();
    }

    setIsScrubbing(isCurrentlyScrubbing);
    videoContainerRef.current.classList.toggle(
      "scrubbing",
      isCurrentlyScrubbing
    );

    handleTimelineUpdate(e);
  };

  const formatDuration = (time) => {
    const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: 2,
    });
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  return (
    <div
      ref={videoContainerRef}
      className={`video-container ${isPaused ? "paused" : ""} ${
        isTheater ? "theater" : ""
      } ${isFullScreen ? "full-screen" : ""} ${
        isCaptionsVisible ? "captions" : ""
      } ${isScrubbing ? "scrubbing" : ""}`}
      data-volume-level={isMuted ? "muted" : volume >= 0.5 ? "high" : "low"}
    >
      <img
        className="thumbnail-img"
        src={`assets/previewImgs/preview${Math.max(
          1,
          Math.floor((currentTime / duration) * 10)
        )}.jpg`}
        alt="Thumbnail"
      />
      <div className="video-controls-container">
        <div
          className="timeline-container"
          ref={timelineContainerRef}
          onMouseMove={handleTimelineUpdate}
          onMouseDown={toggleScrubbing}
        >
          <div className="timeline">
            <img
              className="preview-img"
              src={`assets/previewImgs/preview${Math.max(
                1,
                Math.floor((currentTime / duration) * 10)
              )}.jpg`}
              alt="Preview"
            />
            <div className="thumb-indicator"></div>
          </div>
        </div>
        <div className="controls">
          <button className="play-pause-btn" onClick={togglePlay}>
            <svg className="play-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
            <svg className="pause-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          </button>
          <div className="volume-container">
            <button className="mute-btn" onClick={toggleMute}>
              <svg className="volume-high-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
                />
              </svg>
              <svg className="volume-low-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
                />
              </svg>
              <svg className="volume-muted-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
                />
              </svg>
            </button>
            <input
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="any"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
          <div className="duration-container">
            <div className="current-time">{formatDuration(currentTime)}</div> /{" "}
            <div className="total-time">{formatDuration(duration)}</div>
          </div>
          <button className="captions-btn" onClick={toggleCaptions}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z"
              />
            </svg>
          </button>
          <button className="speed-btn wide-btn" onClick={changePlaybackSpeed}>
            {playbackRate}x
          </button>
          <button className="mini-player-btn" onClick={toggleMiniPlayerMode}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
              />
            </svg>
          </button>
          <button className="theater-btn" onClick={toggleTheaterMode}>
            <svg className="tall" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
              />
            </svg>
            <svg className="wide" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
              />
            </svg>
          </button>
          <button className="full-screen-btn" onClick={toggleFullScreenMode}>
            <svg className="open" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              />
            </svg>
            <svg className="close" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              />
            </svg>
          </button>
        </div>
      </div>
      <video
        ref={videoRef}
        src="assets/Video.mp4"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
      >
        <track kind="captions" srclang="en" src="assets/subtitles.vtt" />
      </video>
    </div>
  );
};

export default VideoPlayer;
