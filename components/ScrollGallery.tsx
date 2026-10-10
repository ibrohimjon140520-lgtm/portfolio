"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { carouselPose } from "../lib/carousel";

export default function ScrollGallery({
  children,
  disabled,
  count,
}: {
  children: ReactNode;
  disabled: boolean;
  count: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (disabled || !stage.current) {
      setEnhanced(false);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const el = stage.current;
    const panels = Array.from(
      el.querySelectorAll<HTMLElement>(".camera-perspective"),
    );
    const cards = panels.map((panel) =>
      panel.querySelector<HTMLButtonElement>(".camera-card")!,
    );
    const state = { phase: 0 };
    el.classList.add("gallery-enhanced");
    setEnhanced(true);
    const paint = () => {
      const radius = Math.min(
        560,
        window.innerWidth * (window.innerWidth < 760 ? 0.72 : 0.42),
      );
      const index = Math.min(count - 1, Math.max(0, Math.round(state.phase)));
      panels.forEach((panel, i) => {
        const pose = carouselPose(i, state.phase, count, radius);
        gsap.set(panel, {
          ...pose,
          xPercent: -50,
          yPercent: -50,
          force3D: true,
        });
        panel.dataset.front = String(i === index);
        cards[i].tabIndex = i === index ? 0 : -1;
      });
      setCurrent((previous) => (previous === index ? previous : index));
      el.style.setProperty(
        "--orbit-progress",
        String(state.phase / (count - 1)),
      );
    };
    const ctx = gsap.context(() => {
      paint();
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "works-orbit",
          trigger: el,
          start: "top top",
          end: () =>
            `+=${Math.max(550, window.innerHeight * 0.85) * (count - 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: paint,
        },
      });
      timeline.fromTo(
        state,
        { phase: 0 },
        {
          immediateRender: false,
          phase: count - 1,
          duration: count - 1,
          ease: "none",
          onUpdate: paint,
        },
      );
      trigger.current = timeline.scrollTrigger ?? null;
    }, el);
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("resize", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", refresh);
      trigger.current = null;
      ctx.revert();
      panels.forEach((panel) => {
        delete panel.dataset.front;
      });
      cards.forEach((card) => {
        card.tabIndex = 0;
      });
      el.classList.remove("gallery-enhanced");
      el.style.removeProperty("--orbit-progress");
    };
  }, [disabled, count]);
  const go = (index: number) => {
    const st = trigger.current;
    if (!st) return;
    window.scrollTo({
      top:
        st.start +
        ((st.end - st.start) * Math.min(count - 1, Math.max(0, index))) /
          (count - 1),
      behavior: "smooth",
    });
  };
  const leave = () => {
    const st = trigger.current;
    if (st)
      window.scrollTo({ top: st.end + window.innerHeight, behavior: "smooth" });
  };
  return (
    <div className="gallery-scroll">
      <div
        ref={stage}
        className="gallery-stage"
        role="region"
        aria-label="Scroll-controlled 3D project gallery"
        onKeyDown={(event) => {
          if (!enhanced || !["ArrowLeft", "ArrowRight"].includes(event.key))
            return;
          event.preventDefault();
          go(current + (event.key === "ArrowRight" ? 1 : -1));
        }}
      >
        <div className="gallery-hud">
          <span>ARCHIVE / SPATIAL VIEW</span>
          <span>
            CAM-{String(current + 1).padStart(2, "0")} / 0{count}
          </span>
        </div>
        <div className="camera-grid">{children}</div>
        <div className="orbit-controls" hidden={!enhanced}>
          <button
            onClick={() => go(current - 1)}
            disabled={current === 0}
            aria-label="Previous camera"
          >
            <ArrowLeft size={20} />
          </button>
          <p>
            <span>SCROLL TO ROTATE</span>
            <span className="orbit-track">
              <i />
            </span>
          </p>
          <button
            onClick={() => go(current + 1)}
            disabled={current === count - 1}
            aria-label="Next camera"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        <button className="orbit-skip" onClick={leave} hidden={!enhanced}>
          CONTINUE BELOW <ArrowDown size={12} />
        </button>
      </div>
    </div>
  );
}
