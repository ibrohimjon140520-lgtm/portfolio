"use client";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Project, projects } from "../lib/data";
export default function ProjectOverlay({
  project,
  onClose,
  onChange,
}: {
  project: Project;
  onClose: () => void;
  onChange: (p: Project) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const index = projects.findIndex((p) => p.id === project.id);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const previous = document.activeElement as HTMLElement | null;
    d.showModal();
    return () => {
      d.close();
      previous?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [project.id]);
  const move = (direction: number) =>
    onChange(projects[(index + direction + projects.length) % projects.length]);
  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby="project-title"
      aria-describedby="project-description"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      <div className="dialog-scroll" ref={scroll}>
        <div className="dialog-toolbar">
          <span>PROJECT {String(index + 1).padStart(2, "0")} / 06</span>
          <span>CREATOR / CONCEPT STUDY</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close project"
          >
            <X size={22} />
          </button>
        </div>
        <div className="dialog-cover">
          <img
            src={project.cover}
            alt={`${project.title} — ${project.caption}`}
            width={1400}
            height={1000}
          />
        </div>
        <div className="dialog-content">
          <div className="dialog-title">
            <p className="eyebrow">
              {project.category} / {project.year}
            </p>
            <h2 id="project-title">
              {project.title}
              <ArrowUpRight />
            </h2>
            <p className="project-caption">{project.caption}</p>
          </div>
          <div className="dialog-details">
            <div>
              <p id="project-description">{project.description}</p>
              <p>{project.concept}</p>
            </div>
            <dl>
              <div>
                <dt>ROLE</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>SERVICES</dt>
                <dd>{project.services.join(" / ")}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>Independent concept / editable sample</dd>
              </div>
            </dl>
          </div>
          <div className="project-study">
            <img
              src={project.cover}
              alt={`${project.title} detail study`}
              width={1400}
              height={1000}
            />
            <div>
              <span>FORM / LIGHT / POSSIBILITY</span>
              <p>
                Every world
                <br />
                starts with
                <br />
                <em>an idea.</em>
              </p>
              <span>
                EXPLORATION BY
                <br />
                UMMATILLAYEV IBROHIMJON
              </span>
            </div>
          </div>
          <p className="sample-note">
            This is an original sample project for this portfolio, not a claim
            of client work.
          </p>
          <div className="dialog-bottom">
            <button onClick={() => move(-1)}>
              <ArrowLeft size={18} /> Previous world
            </button>
            <button onClick={onClose}>Back to gallery</button>
            <button onClick={() => move(1)}>
              Next world <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
