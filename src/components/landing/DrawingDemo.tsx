import { useRef, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

type Point = [number, number];
type Stroke = Point[];

function makeArc(cx: number, cy: number, r: number, steps = 24): Stroke {
  const pts: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// "You" draws: a sun + two mountains + ground horizon
const YOU_STROKES: Stroke[] = [
  makeArc(0.78, 0.24, 0.13, 22),
  [[0.06, 0.84], [0.28, 0.36], [0.50, 0.84]],
  [[0.42, 0.84], [0.64, 0.44], [0.88, 0.84]],
  [[0.04, 0.86], [0.96, 0.86]],
];

// "@friend" draws: a cat face
const FRIEND_STROKES: Stroke[] = [
  makeArc(0.50, 0.57, 0.32, 28),
  [[0.26, 0.32], [0.30, 0.16], [0.42, 0.28]],
  [[0.58, 0.28], [0.70, 0.16], [0.74, 0.32]],
  makeArc(0.37, 0.48, 0.055, 12),
  makeArc(0.63, 0.48, 0.055, 12),
  [[0.40, 0.70], [0.46, 0.75], [0.50, 0.76], [0.54, 0.75], [0.60, 0.70]],
  [[0.08, 0.58], [0.34, 0.62]],
  [[0.08, 0.66], [0.34, 0.68]],
  [[0.66, 0.62], [0.92, 0.58]],
  [[0.66, 0.68], [0.92, 0.66]],
];

const STROKE_DUR = 900;
const STROKE_GAP = 220;
const MIRROR_LAG = 220;
const PHASE_PAUSE = 2000;
const LOOP_HOLD = 1000;
const FADE_DUR = 700;

const YOU_PHASE_DUR = YOU_STROKES.length * (STROKE_DUR + STROKE_GAP);
const FRIEND_PHASE_DUR = FRIEND_STROKES.length * (STROKE_DUR + STROKE_GAP);
const LOOP_DUR =
  YOU_PHASE_DUR + PHASE_PAUSE + FRIEND_PHASE_DUR + PHASE_PAUSE + LOOP_HOLD + FADE_DUR;

const FRIEND_PHASE_START = YOU_PHASE_DUR + PHASE_PAUSE;

const YOU_COLOR = "hsl(350,65%,45%)";
const FRIEND_COLOR = "hsl(220,70%,55%)";

function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  progress: number,
  color: string,
  alpha: number,
  w: number,
  h: number
) {
  if (progress <= 0 || stroke.length < 2) return;
  const end = Math.max(2, Math.round((stroke.length - 1) * Math.min(1, progress)) + 1);
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(stroke[0][0] * w, stroke[0][1] * h);
  for (let i = 1; i < end; i++) {
    ctx.lineTo(stroke[i][0] * w, stroke[i][1] * h);
  }
  ctx.stroke();
  ctx.globalAlpha = prev;
}

function renderCursor(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  progress: number,
  color: string,
  w: number,
  h: number
) {
  if (progress <= 0 || progress >= 1 || stroke.length < 1) return;
  const idx = Math.min(stroke.length - 1, Math.round((stroke.length - 1) * progress));
  const [cx, cy] = stroke[idx];
  ctx.beginPath();
  ctx.arc(cx * w, cy * h, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function setupCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

type Phase = "idle" | "loading" | "animating";

const LOADING_DELAY = 2000;

const DrawingDemo = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const containerRef = useRef<HTMLDivElement>(null);

  // bottom-left: You draw here
  const localLeftRef = useRef<HTMLCanvasElement>(null);
  // top-left: You see @friend's strokes
  const remoteLeftRef = useRef<HTMLCanvasElement>(null);
  // bottom-right: @friend draws here
  const localRightRef = useRef<HTMLCanvasElement>(null);
  // top-right: @friend sees your strokes
  const remoteRightRef = useRef<HTMLCanvasElement>(null);

  // Observe when container enters the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          setPhase("loading");
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // After 2 s in loading, start the animation
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setTimeout(() => setPhase("animating"), LOADING_DELAY);
    return () => clearTimeout(id);
  }, [phase]);

  // Canvas animation loop — only runs while phase === "animating"
  useEffect(() => {
    if (phase !== "animating") return;

    const ll = localLeftRef.current;
    const rl = remoteLeftRef.current;
    const lr = localRightRef.current;
    const rr = remoteRightRef.current;
    if (!ll || !rl || !lr || !rr) return;

    const setup = () => {
      if (!ll.clientWidth) return null;
      return {
        ll: setupCanvas(ll),
        rl: setupCanvas(rl),
        lr: setupCanvas(lr),
        rr: setupCanvas(rr),
      };
    };

    let cvs = setup();
    let startTime: number | null = null;
    let rafId: number;

    const frame = (ts: number) => {
      if (!cvs) {
        cvs = setup();
        if (!cvs) {
          rafId = requestAnimationFrame(frame);
          return;
        }
      }

      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) % LOOP_DUR;

      const { ll: cLL, rl: cRL, lr: cLR, rr: cRR } = cvs;

      cLL.ctx.clearRect(0, 0, cLL.w, cLL.h);
      cRL.ctx.clearRect(0, 0, cRL.w, cRL.h);
      cLR.ctx.clearRect(0, 0, cLR.w, cLR.h);
      cRR.ctx.clearRect(0, 0, cRR.w, cRR.h);

      const fadeAlpha =
        elapsed > LOOP_DUR - FADE_DUR ? (elapsed - (LOOP_DUR - FADE_DUR)) / FADE_DUR : 0;

      YOU_STROKES.forEach((stroke, i) => {
        const t0 = i * (STROKE_DUR + STROKE_GAP);
        const lp = (elapsed - t0) / STROKE_DUR;
        const rp = (elapsed - t0 - MIRROR_LAG) / STROKE_DUR;
        if (lp > 0) {
          renderStroke(cLL.ctx, stroke, lp, YOU_COLOR, 1, cLL.w, cLL.h);
          if (lp < 1) renderCursor(cLL.ctx, stroke, lp, YOU_COLOR, cLL.w, cLL.h);
        }
        if (rp > 0) {
          renderStroke(cRR.ctx, stroke, rp, YOU_COLOR, 0.55, cRR.w, cRR.h);
        }
      });

      FRIEND_STROKES.forEach((stroke, i) => {
        const t0 = FRIEND_PHASE_START + i * (STROKE_DUR + STROKE_GAP);
        const lp = (elapsed - t0) / STROKE_DUR;
        const rp = (elapsed - t0 - MIRROR_LAG) / STROKE_DUR;
        if (lp > 0) {
          renderStroke(cLR.ctx, stroke, lp, FRIEND_COLOR, 1, cLR.w, cLR.h);
          if (lp < 1) renderCursor(cLR.ctx, stroke, lp, FRIEND_COLOR, cLR.w, cLR.h);
        }
        if (rp > 0) {
          renderStroke(cRL.ctx, stroke, rp, FRIEND_COLOR, 0.55, cRL.w, cRL.h);
        }
      });

      if (fadeAlpha > 0) {
        [cLL, cRL, cLR, cRR].forEach(({ ctx, w, h }) => {
          ctx.fillStyle = `rgba(255,255,255,${fadeAlpha})`;
          ctx.fillRect(0, 0, w, h);
        });
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  const canvasClass = "block w-full aspect-[4/3] bg-canvas rounded-xl";
  const localLeftClass = `${canvasClass} ring-2 ring-primary/30`;
  const localRightClass = `${canvasClass} ring-2 ring-[hsl(220,70%,55%)]/30`;

  return (
    <div ref={containerRef} className="relative grid grid-cols-2 gap-3">
      {/* Loading overlay */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-10 rounded-xl bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-10 h-10 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-sm font-body text-muted-foreground tracking-wide">
            Connecting<DotDot />
          </p>
        </div>
      )}

      {/* Left panel — "You" */}
      <div className="flex flex-col gap-2">
        <div className="relative rounded-xl overflow-hidden">
          <canvas ref={remoteLeftRef} className={canvasClass} />
          <span className="absolute bottom-1.5 left-2 text-[10px] font-body text-muted-foreground bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            @friend's strokes
          </span>
        </div>
        <div className="relative rounded-xl overflow-hidden">
          <canvas ref={localLeftRef} className={localLeftClass} />
          <span className="absolute bottom-1.5 left-2 text-[10px] font-body text-primary bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded font-semibold">
            You
          </span>
        </div>
      </div>

      {/* Right panel — "@friend" */}
      <div className="flex flex-col gap-2">
        <div className="relative rounded-xl overflow-hidden">
          <canvas ref={remoteRightRef} className={canvasClass} />
          <span className="absolute bottom-1.5 left-2 text-[10px] font-body text-muted-foreground bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            Your strokes
          </span>
        </div>
        <div className="relative rounded-xl overflow-hidden">
          <canvas ref={localRightRef} className={localRightClass} />
          <span
            className="absolute bottom-1.5 left-2 text-[10px] font-body bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded font-semibold"
            style={{ color: "hsl(220,70%,55%)" }}
          >
            @friend
          </span>
        </div>
      </div>
    </div>
  );
};

/** Animated "..." that cycles 1→2→3 dots */
function DotDot() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    return () => clearInterval(id);
  }, []);
  return <span className="inline-block w-6 text-left">{".".repeat(dots)}</span>;
}

export default DrawingDemo;

