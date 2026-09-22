import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${show ? "reveal-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  no,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  no: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 py-24 md:py-32 ${className}`}>
      <div className="shell">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="display text-sm tracking-[0.4em] text-cyan/80">{no}</span>
            <span className="h-px w-12 bg-cyan/40" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
          <h2 className="display mt-5 text-3xl font-bold leading-tight tracking-tight text-ink md:text-[2.6rem]">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-3xl text-[15px] leading-8 text-muted md:text-base">{intro}</p>}
        </Reveal>
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}

export function Callout({
  tone = "warn",
  title,
  children,
}: {
  tone?: "warn" | "info" | "ok";
  title: string;
  children: ReactNode;
}) {
  const tones = {
    warn: { border: "border-amber/40", bg: "bg-amber/[0.06]", dot: "bg-amber", text: "text-amber" },
    info: { border: "border-cyan/40", bg: "bg-cyan/[0.05]", dot: "bg-cyan", text: "text-cyan" },
    ok: { border: "border-mint/40", bg: "bg-mint/[0.05]", dot: "bg-mint", text: "text-mint" },
  }[tone];
  return (
    <div className={`rounded-2xl border ${tones.border} ${tones.bg} p-6 md:p-7`}>
      <div className="flex items-start gap-3.5">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tones.dot} shadow-[0_0_12px_currentColor]`} />
        <div>
          <h4 className={`font-bold ${tones.text}`}>{title}</h4>
          <div className="mt-2 text-[14px] leading-7 text-ink/80">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="codeblock overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted">{label ?? "application/fhir+json"}</span>
        <button
          onClick={copy}
          className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-cyan/50 hover:text-cyan"
        >
          {copied ? "已複製" : "複製"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 md:p-5">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

function highlight(json: string) {
  const lines = json.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts: ReactNode[] = [];
        const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([^\s":{}[\],]+)/g;
        let m: RegExpExecArray | null;
        let last = 0;
        let key = 0;
        while ((m = re.exec(line)) !== null) {
          if (m.index > last) parts.push(line.slice(last, m.index));
          if (m[1] && m[2]) {
            parts.push(
              <span key={key++} className="k">
                {m[1]}
              </span>,
              m[2]
            );
          } else if (m[1]) {
            parts.push(
              <span key={key++} className="s">
                {m[1]}
              </span>
            );
          } else if (m[3]) {
            parts.push(
              <span key={key++} className="n">
                {m[3]}
              </span>
            );
          } else if (m[4]) {
            parts.push(
              <span key={key++} className="n">
                {m[4]}
              </span>
            );
          } else {
            parts.push(m[5]);
          }
          last = m.index + m[0].length;
        }
        if (last < line.length) parts.push(line.slice(last));
        return (
          <span key={i}>
            {parts}
            {"\n"}
          </span>
        );
      })}
    </>
  );
}
