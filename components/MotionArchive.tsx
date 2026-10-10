"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const clips = [
  { file: "sculpture", category: "DA//3D", label: "MOTION GRAPHICS" },
  { file: "code", category: "APP//REEL", label: "CREATIVE DEVELOPMENT" },
  { file: "boot", category: "BOOT", label: "BOOT SEQUENCE" },
  { file: "wave", category: "SURFACE", label: "DIGITAL MATTER" },
  { file: "rings", category: "FORM", label: "FORM EXPLORATION" },
  { file: "portrait", category: "DA//MISC", label: "VISUAL RESEARCH" },
  { file: "vortex", category: "DA//FLOW", label: "PARTICLE FLOW" },
  { file: "red", category: "SIGNAL", label: "CHROMATIC SIGNAL" },
  { file: "sculpture", category: "MOTION", label: "STRUCTURE / 002" },
  { file: "orbit", category: "SPATIAL", label: "SPATIAL FREQUENCY" },
];
function MotionFeed({
  clip,
  index,
  paused,
}: {
  clip: (typeof clips)[number];
  index: number;
  paused: boolean;
}) {
  const container = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [stopped, setStopped] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = video.current,
      wrapper = container.current;
    if (!player || !wrapper) return;
    let visible = false,
      disposed = false;
    const sync = () => {
      if (visible && !paused && !stopped && !document.hidden) {
        if (!player.getAttribute("src"))
          player.src = `/motion/${clip.file}.mp4`;
        player
          .play()
          .then(() => {
            if (!disposed) setBlocked(false);
          })
          .catch(() => {
            if (!disposed) setBlocked(true);
          });
      } else player.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.08 },
    );
    observer.observe(wrapper);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      player.pause();
    };
  }, [clip.file, paused, stopped]);
  return (
    <article ref={container} className={`motion-feed motion-feed-${index + 1}`}>
      <div className="motion-feed-screen">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster={`/motion/${clip.file}.jpg`}
          aria-label={`${clip.label} — original generative animation`}
          onError={() => setFailed(true)}
        />
        <div className="motion-scanlines" aria-hidden="true" />
        <div className="motion-feed-top">
          <span className="rec">
            <i aria-hidden="true" />
            REC
          </span>
          <span>
            CAM-{String(index + 7).padStart(2, "0")} // {clip.category}
          </span>
        </div>
        <div className="motion-feed-bottom">
          <time data-clock="" data-fullclock="" aria-live="off">
            --:--:-- UTC
          </time>
          <span>{clip.label}</span>
        </div>
        {!failed && (
          <button
            className="motion-playback"
            disabled={paused}
            onClick={() => {
              if (blocked) {
                video.current
                  ?.play()
                  .then(() => {
                    setBlocked(false);
                    setStopped(false);
                  })
                  .catch(() => setBlocked(true));
              } else setStopped((value) => !value);
            }}
            aria-label={`${stopped || blocked ? "Play" : "Pause"} ${clip.label.toLowerCase()}`}
            aria-pressed={stopped}
          >
            {stopped || blocked ? <Play size={13} /> : <Pause size={13} />}
          </button>
        )}
        {failed && (
          <span className="motion-unavailable">PREVIEW / SIGNAL OFFLINE</span>
        )}
      </div>
      <div className="motion-feed-strip">
        <span>CAM-{String(index + 7).padStart(2, "0")}</span>
        <i
          className={paused || stopped || blocked || failed ? "is-idle" : ""}
          aria-hidden="true"
        />
        <span>{clip.category}</span>
      </div>
    </article>
  );
}
export default function MotionArchive({ paused }: { paused: boolean }) {
  return (
    <section
      id="motion"
      className="section motion-section"
      aria-labelledby="motion-title"
    >
      <div className="section-label">
        <span>
          <i />
          03 / MOTION SURVEILLANCE
        </span>
        <span>10 CHANNELS / ORIGINAL EXPERIMENTS</span>
      </div>
      <div className="motion-heading">
        <h2 id="motion-title">
          LIVE <span className="outline-word">EXPERIMENTS.</span>
        </h2>
        <p>
          Form. Particles. Interference.
          <br />A collection of moving ideas.
        </p>
      </div>
      <div className="motion-wall">
        {clips.map((clip, index) => (
          <MotionFeed
            key={`${clip.file}-${index}`}
            clip={clip}
            index={index}
            paused={paused}
          />
        ))}
      </div>
      <div className="motion-end">
        <span>GENERATIVE MOTION STUDIES / 2026</span>
        <span>END OF FEED_</span>
      </div>
    </section>
  );
}
