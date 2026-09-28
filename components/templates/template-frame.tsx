"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "@/lib/templates/render";

/**
 * Shows a rendered template document as a paper-sized page scaled to fit its
 * container. The iframe is sandboxed WITHOUT allow-scripts, so nothing inside
 * can execute; allow-same-origin is only there so we can measure its height.
 */
export default function TemplateFrame({
  srcDoc,
  title = "Resume template preview",
  className,
}: {
  srcDoc: string;
  title?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(A4_HEIGHT_PX);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / A4_WIDTH_PX));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function measure() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    setHeight(Math.max(A4_HEIGHT_PX, doc.documentElement.scrollHeight));
  }

  return (
    <div
      ref={wrapRef}
      className={cn("w-full overflow-hidden rounded-sm border border-cream-dark bg-white shadow-sm", className)}
      style={{ height: height * scale }}
    >
      <iframe
        ref={frameRef}
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-same-origin"
        onLoad={measure}
        scrolling="no"
        style={{
          width: A4_WIDTH_PX,
          height,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "block",
        }}
      />
    </div>
  );
}
