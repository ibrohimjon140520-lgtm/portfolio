"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowUp,
  Aperture,
  Plus,
  Minus,
  Menu,
  X,
  Pause,
  Play,
  Terminal,
  Crosshair,
  Send,
  Radio,
  Linkedin,
  Instagram,
  Github,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact, projects, type Project } from "../lib/data";
import ProjectOverlay from "./ProjectOverlay";
import ScrollGallery from "./ScrollGallery";
import MotionArchive from "./MotionArchive";
import { roundedSignal } from "../lib/carousel";

const binary =
  "01001001 00100000 01000011 01010010 01000101 01000001 01010100 01000101 00100000 01010111 01001111 01010010 01001100 01000100 01010011";
const navigation = ["About", "Works", "Motion", "FAQ", "Contact"];
const questions = [
  [
    "What do you create?",
    "Websites with a point of view. I combine design, creative development, motion and interactive 3D to make digital experiences feel distinctive.",
  ],
  [
    "Can we work together remotely?",
    "Yes. A clear brief, regular feedback and shared milestones keep a remote project moving.",
  ],
  [
    "What does your process look like?",
    "Understand the idea. Explore a visual direction. Build a working prototype. Refine the details and test across screens.",
  ],
  [
    "Are these real client projects?",
    "The six works shown here are independent concept studies. Each explores a different visual or technical idea; they are not presented as client commissions.",
  ],
  [
    "How do we start a project?",
    "Start with the idea, what you need and your timeline. My direct contact links are active below across Telegram, Instagram, LinkedIn, and GitHub.",
  ],
];

function Glitch({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`glitch ${className}`}>
      <span>{text}</span>
      <span className="glitch-copy glitch-a" aria-hidden="true">
        {text}
      </span>
      <span className="glitch-copy glitch-b" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
function Clock() {
  return (
    <time className="live-clock" data-clock="" aria-live="off">
      --:--:-- UTC
    </time>
  );
}
function Rec() {
  return (
    <span className="rec">
      <i aria-hidden="true" />
      REC
    </span>
  );
}
function BinaryBand({ className = "" }: { className?: string }) {
  return (
    <div className={`binary-band ${className}`} aria-hidden="true">
      <span>
        {binary} {binary}
      </span>
    </div>
  );
}
function SectionLabel({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note: string;
}) {
  return (
    <div className="section-label">
      <span>
        <i />
        {number} / {title}
      </span>
      <span>{note}</span>
    </div>
  );
}
function SignalSculpture() {
  return (
    <div className="signal-sculpture" data-parallax="-100" aria-hidden="true">
      <svg viewBox="0 0 800 650" fill="none">
        <defs>
          <radialGradient id="signal-halo">
            <stop stopColor="#fff" stopOpacity=".12" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="signal-line" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff" stopOpacity=".05" />
            <stop offset=".38" stopColor="#e8e8e8" />
            <stop offset=".7" stopColor="#818181" />
            <stop offset="1" stopColor="#fff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <ellipse cx="400" cy="320" rx="330" ry="310" fill="url(#signal-halo)" />
        <g transform="translate(400 320) rotate(-24)">
          {Array.from({ length: 44 }, (_, i) => {
            const t = (i - 21.5) / 22;
            const radius = Math.sqrt(1 - t * t);
            return (
              <ellipse
                key={i}
                cx={roundedSignal(t * 235)}
                cy={roundedSignal(Math.sin(t * Math.PI) * 26)}
                rx={roundedSignal(radius * 75 + 2)}
                ry={roundedSignal(radius * 239)}
                stroke="url(#signal-line)"
                strokeWidth={i % 3 ? ".8" : "1.8"}
                transform={`rotate(${roundedSignal(t * 35)})`}
              />
            );
          })}
          <ellipse
            rx="273"
            ry="54"
            stroke="#eee"
            strokeWidth="1"
            transform="rotate(30)"
          />
          <ellipse
            rx="310"
            ry="79"
            stroke="#666"
            strokeWidth=".6"
            transform="rotate(-16)"
          />
        </g>
        <path
          d="M60 320h80m520 0h80M400 25v60m0 480v60"
          stroke="#555"
          strokeWidth=".7"
        />
        <rect
          x="175"
          y="95"
          width="450"
          height="450"
          stroke="#ffffff20"
          strokeDasharray="3 14"
        />
        <path
          d="M175 130V95h35m380 0h35v35m0 380v35h-35m-380 0h-35v-35"
          stroke="#eee"
        />
        <circle cx="400" cy="320" r="4" fill="#ec3939" />
      </svg>
      <span className="signal-coordinate">
        SUBJECT_001
        <br />
        FORM / UNDEFINED
      </span>
    </div>
  );
}

export default function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const close = useCallback(() => setSelected(null), []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      hour12: false,
    });
    const tick = () => {
      if (document.hidden) return;
      const now = new Date();
      root.current
        ?.querySelectorAll<HTMLTimeElement>("[data-clock]")
        .forEach((el) => {
          el.textContent = `${el.hasAttribute("data-fullclock") ? now.toISOString().slice(0, 10) + " " : ""}${format.format(now)} UTC`;
          el.dateTime = now.toISOString();
        });
    };
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menu]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced || paused) return;
      const mobile = matchMedia("(max-width: 760px)").matches;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 0.65,
          },
        })
        .to(
          ".signal-sculpture",
          {
            rotationY: 38,
            rotationZ: -12,
            z: -200,
            y: 180,
            scale: 1.25,
            ease: "none",
          },
          0,
        )
        .to(".hero-title", { y: -95, z: 110, rotationX: 8, ease: "none" }, 0)
        .to(".hero-reticle", { y: 80, rotation: 45, ease: "none" }, 0);
      gsap.utils.toArray<HTMLElement>("[data-flip]").forEach((el) => {
        gsap.fromTo(
          el,
          {
            rotationX: mobile ? 8 : 16,
            y: 65,
            z: -90,
            opacity: 0.35,
            transformOrigin: "50% 100%",
          },
          {
            rotationX: 0,
            y: 0,
            z: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "top 52%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".binary-band span").forEach((el, i) =>
        gsap.to(el, {
          x: i % 2 ? 100 : -100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }),
      );
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    const observer = new ResizeObserver(refresh);
    if (root.current) observer.observe(root.current);
    document.fonts.ready.then(() => {
      if (root.current) refresh();
    });
    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, [reduced, paused]);

  const liveContacts = contact.filter((item) => item.href);
  return (
    <div
      ref={root}
      className={`surveillance ${paused || reduced ? "effects-paused" : ""}`}
    >
      <a href="#works" className="skip-link">
        Skip to works
      </a>
      <div className="screen-texture" aria-hidden="true" />
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Ibrohimjon — home">
          <Aperture size={24} />
          <span>
            IBROHIMJON<span className="wordmark-suffix">.DEV</span>
          </span>
        </a>
        <nav
          id="main-navigation"
          className={menu ? "navigation open" : "navigation"}
          aria-label="Main navigation"
        >
          {navigation.map((item, i) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenu(false)}
            >
              <span className="nav-index">0{i + 1}</span>
              <Glitch text={item.toUpperCase()} />
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="effects-button"
            aria-label={paused ? "Play visual effects" : "Pause visual effects"}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMenu((value) => !value)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-controls="main-navigation"
            aria-expanded={menu}
          >
            {menu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>
      <main>
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span>
              <Rec /> CAM-00 // PERSONAL ARCHIVE
            </span>
            <Clock />
          </div>
          <BinaryBand />
          <div className="hero-stage">
            <SignalSculpture />
            <div className="hero-kicker">
              <span>INDEPENDENT CREATIVE DEVELOPER</span>
              <span>PORTFOLIO / 2026</span>
            </div>
            <div className="hero-reticle" aria-hidden="true">
              <Crosshair size={24} strokeWidth={0.7} />
            </div>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-surname">UMMATILLAYEV</span>
              <Glitch text="IBROHIM" />
              <span className="hero-subtitle">
                DESIGNING THE UNEXPECTED.
                <br />
                CODING THE UNSEEN.
              </span>
            </h1>
            <div className="hero-sidecode" aria-hidden="true">
              [ X:0041 / Y:0089 ]<br />
              SIGNAL: ACTIVE
              <br />
              NO FILTER.
              <br />
              JUST FREQUENCY.
            </div>
            <span className="frame-corner top-left" aria-hidden="true" />
            <span className="frame-corner top-right" aria-hidden="true" />
            <span className="frame-corner bottom-left" aria-hidden="true" />
            <span className="frame-corner bottom-right" aria-hidden="true" />
          </div>
          <BinaryBand className="binary-bottom" />
          <div className="hero-bottomline">
            <a href="#about">
              <ArrowDown size={15} /> SCROLL TO DECODE
            </a>
            <span>6 CHANNELS / ONE CREATIVE MIND</span>
            <span className="signal-status">
              <i /> ALL SYSTEMS NOMINAL
            </span>
          </div>
        </section>
        <section
          id="about"
          className="section about-section"
          aria-labelledby="about-title"
        >
          <SectionLabel
            number="01"
            title="SUBJECT PROFILE"
            note="ACCESS GRANTED"
          />
          <div className="about-layout" data-flip>
            <div className="about-symbol" aria-hidden="true">
              <Aperture size={105} strokeWidth={0.7} />
              <span>[ HUMAN, MOSTLY. ]</span>
            </div>
            <div className="about-copy">
              <p className="terminal-prompt">
                ~/ibrohimjon <span>$ whoami</span>
              </p>
              <h2 id="about-title">
                A developer’s logic.
                <br />
                An artist’s <em>instinct.</em>
              </h2>
              <p>
                I’m Ummatillayev Ibrohimjon. I build expressive websites and
                digital experiences at the intersection of design, code and
                motion.
              </p>
              <p>
                Curious by default. Drawn to unusual ideas. Always looking for
                that small detail that makes you stop scrolling.
              </p>
              <div className="about-actions">
                <a href="#works" className="text-link">
                  <span>[ VIEW SELECTED WORK ]</span>
                  <ArrowUpRight size={16} />
                </a>
                <a href="#contact" className="text-link text-link-accent">
                  <span>[ DIRECT CHANNELS ]</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
            <div className="profile-note">
              <Terminal size={18} />
              <span>
                STATUS: EXPLORING
                <br />
                MODE: INDEPENDENT
                <br />
                OUTPUT: DIGITAL
              </span>
            </div>
          </div>
        </section>
        <section
          id="works"
          className="section works-section"
          aria-labelledby="works-title"
        >
          <SectionLabel
            number="02"
            title="SURVEILLANCE ARCHIVE"
            note="06 ACTIVE CHANNELS"
          />
          <div className="section-heading" data-flip>
            <h2 id="works-title">
              <Glitch text="SELECTED" />
              <br />
              <span className="outline-word">TRANSMISSIONS.</span>
            </h2>
            <p>
              Six independent concept studies.
              <br />
              Different worlds. Same frequency.
              <br />
              <span className="red-text">[ SELECT A FEED TO EXPLORE ]</span>
            </p>
          </div>
          <ScrollGallery disabled={reduced || paused} count={projects.length}>
            {projects.map((project, i) => (
              <article className="camera-perspective" key={project.id}>
                <button
                  className="camera-card"
                  onClick={() => setSelected(project)}
                  aria-label={`Explore ${project.title}, ${project.category}`}
                >
                  <div className="feed-viewport">
                    <img
                      className="feed-image"
                      src={project.cover}
                      alt={`${project.title} — ${project.caption}`}
                      width={1400}
                      height={1000}
                      loading="lazy"
                    />
                    <div className="feed-topline">
                      <span>
                        <Rec /> CAM-0{i + 1}
                      </span>
                      <Clock />
                    </div>
                    <div className="feed-crosshair" aria-hidden="true">
                      +
                    </div>
                    <div className="feed-noise" aria-hidden="true" />
                    <div className="feed-bottomline">
                      <span>
                        CH_0{i + 1} // {project.category.toUpperCase()}
                      </span>
                      <span>HD ◧</span>
                    </div>
                    <span className="feed-open">
                      <ArrowUpRight size={24} />
                    </span>
                    <span className="feed-hover" aria-hidden="true">
                      [ OPEN TRANSMISSION ]
                    </span>
                  </div>
                  <div className="feed-caption">
                    <div>
                      <span className="feed-number">0{i + 1} /</span>
                      <h3>
                        <Glitch text={project.title} />
                      </h3>
                    </div>
                    <span>
                      {project.year} <ArrowUpRight size={16} />
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </ScrollGallery>
          <div className="archive-end">
            <span>END OF ARCHIVE_</span>
            <span>CONCEPT STUDIES / NOT CLIENT COMMISSIONS</span>
            <Aperture size={18} />
          </div>
        </section>
        <MotionArchive paused={paused || reduced} />
        <BinaryBand className="section-divider" />
        <section
          id="faq"
          className="section faq-section"
          aria-labelledby="faq-title"
        >
          <SectionLabel
            number="04"
            title="FREQUENT QUERIES"
            note="CLEAR ANSWERS. NO STATIC."
          />
          <div className="faq-layout">
            <div data-flip>
              <h2 id="faq-title">
                BEFORE
                <br />
                WE <span className="outline-word">CONNECT.</span>
              </h2>
              <p>
                Some things you might
                <br />
                want to know.
              </p>
            </div>
            <div className="faq-list">
              {questions.map(([question, answer], i) => (
                <div
                  className={`faq-item ${faq === i ? "is-open" : ""}`}
                  key={question}
                >
                  <h3>
                    <button
                      aria-expanded={faq === i}
                      aria-controls={`answer-${i}`}
                      id={`question-${i}`}
                      onClick={() =>
                        setFaq((current) => (current === i ? null : i))
                      }
                    >
                      <span className="faq-number">0{i + 1}</span>
                      <span>{question}</span>
                      {faq === i ? <Minus size={17} /> : <Plus size={17} />}
                    </button>
                  </h3>
                  <div
                    id={`answer-${i}`}
                    role="region"
                    aria-labelledby={`question-${i}`}
                    hidden={faq !== i}
                  >
                    <p>{answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <footer
          id="contact"
          className="section contact-section"
          aria-labelledby="contact-title"
        >
          <SectionLabel
            number="05"
            title="OPEN A CHANNEL"
            note="END OF TRANSMISSION"
          />
          <div className="contact-top">
            <p className="availability">
              <i /> OPEN TO COLLABORATION
            </p>
            <Clock />
          </div>
          <a
            href="https://t.me/ummatillayev511"
            target="_blank"
            rel="noreferrer noopener"
            className="contact-heading contact-heading-link"
            data-flip
            aria-label="Direct message on Telegram: Let's make some noise"
          >
            <h2 id="contact-title">
              <Glitch text="LET’S MAKE" />
              <br />
              <span className="outline-word">SOME NOISE.</span>
            </h2>
            <ArrowUpRight className="contact-arrow" strokeWidth={0.7} />
          </a>
          <div className="contact-bottom">
            <p>
              Have an idea that doesn’t fit the usual?
              <br />
              That’s a good place to start.
              <br />
              <span className="contact-status-note">[ DIRECT CHANNELS ONLINE ]</span>
            </p>
            <div className="contact-channels">
              {liveContacts.length ? (
                liveContacts.map((item) => (
                  <a
                    key={item.label}
                    href={item.href!}
                    target={
                      item.href!.startsWith("mailto:") ? undefined : "_blank"
                    }
                    rel="noreferrer noopener"
                    className="contact-channel-card"
                    aria-label={`${item.label}: ${item.handle || item.hint}`}
                  >
                    <span className="channel-icon-pill" aria-hidden="true">
                      {item.type === "telegram" && <Send size={15} />}
                      {item.type === "channel" && <Radio size={15} />}
                      {item.type === "linkedin" && <Linkedin size={15} />}
                      {item.type === "instagram" && <Instagram size={15} />}
                      {item.type === "github" && <Github size={15} />}
                    </span>
                    <span className="channel-meta">
                      <span className="channel-title">
                        <Glitch text={item.label.toUpperCase()} />
                      </span>
                      {item.handle && (
                        <span className="channel-sub">{item.handle}</span>
                      )}
                    </span>
                    <ArrowUpRight size={17} className="channel-arrow" />
                  </a>
                ))
              ) : (
                <p className="contact-pending">
                  <span>[ CHANNEL PENDING ]</span>
                  <br />
                  Direct contact details coming soon.
                </p>
              )}
            </div>
          </div>
          <div className="footer-line">
            <span>© {new Date().getFullYear()} IBROHIMJON / CREATOR</span>
            <span>DESIGNED TO FEEL DIFFERENT.</span>
            <a href="#home">
              BACK TO TOP <ArrowUp size={14} />
            </a>
          </div>
        </footer>
      </main>
      {selected && (
        <ProjectOverlay
          project={selected}
          onChange={setSelected}
          onClose={close}
        />
      )}
    </div>
  );
}
