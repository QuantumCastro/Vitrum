import { useEffect, useMemo, useRef } from "react";

import type { NoteRead } from "../../api/model";

const hashToUnit = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0) / 2 ** 32;
};

type Props = {
  notes: NoteRead[];
  isActive: boolean;
  onNodeClick: (id: string) => void;
};

export function NeuralGraph({ notes, onNodeClick, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragNodeRef = useRef<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
  } | null>(null);

  const data = useMemo(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 300;
    const height = typeof window !== "undefined" ? window.innerHeight : 500;

    const nodes = notes.map((note) => {
      const base = hashToUnit(note.id);
      const base2 = hashToUnit(`${note.id}-y`);
      return {
        id: note.id,
        label: note.title || "Nueva nota",
        x: base * width,
        y: base2 * height,
        vx: 0,
        vy: 0,
      };
    });

    const links: { source: (typeof nodes)[number]; target: (typeof nodes)[number] }[] = [];
    notes.forEach((source) => {
      source.links?.forEach((targetId) => {
        const target = nodes.find((node) => node.id === targetId);
        const sourceNode = nodes.find((node) => node.id === source.id);
        if (target && sourceNode) {
          links.push({ source: sourceNode, target });
        }
      });
    });

    return { nodes, links };
  }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (!isActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      data.nodes.forEach((node) => {
        if (dragNodeRef.current === node) return;

        data.nodes.forEach((other) => {
          if (node !== other) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1800 / (dist * dist);
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        });

        node.vx += (width / 2 - node.x) * 0.006;
        node.vy += (height / 2 - node.y) * 0.006;
        node.vx *= 0.91;
        node.vy *= 0.91;
        node.x += node.vx;
        node.y += node.vy;

        const padding = 20;
        if (node.x < padding) node.vx += 0.5;
        if (node.x > width - padding) node.vx -= 0.5;
        if (node.y < padding) node.vy += 0.5;
        if (node.y > height - padding) node.vy -= 0.5;
      });

      ctx.lineWidth = 1;
      data.links.forEach((link) => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        const gradient = ctx.createLinearGradient(
          link.source.x,
          link.source.y,
          link.target.x,
          link.target.y,
        );
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.2)");
        gradient.addColorStop(1, "rgba(217, 70, 239, 0.2)");
        ctx.strokeStyle = gradient;
        ctx.stroke();
      });

      data.nodes.forEach((node) => {
        const glowSize = 15;
        const gradient = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, glowSize);
        gradient.addColorStop(0, "rgba(167, 139, 250, 0.8)");
        gradient.addColorStop(1, "rgba(167, 139, 250, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dragNodeRef.current === node ? "#ffffff" : "#e0e7ff";
        ctx.fill();

        ctx.font = "500 11px Inter, sans-serif";
        const computedLabelColor =
          typeof window !== "undefined"
            ? window
                .getComputedStyle(document.documentElement)
                .getPropertyValue("--graph-label")
                .trim()
            : "";
        ctx.fillStyle = computedLabelColor || "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        const label = node.label ?? "";
        ctx.fillText(
          `${label.substring(0, 15)}${label.length > 15 ? "..." : ""}`,
          node.x,
          node.y + 22,
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    if (isActive) render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data, isActive]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getPointerPos(e);
    const clickedNode = data.nodes.find((node) => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return dist < 30;
    });
    if (clickedNode) dragNodeRef.current = clickedNode;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragNodeRef.current) {
      e.preventDefault();
      const { x, y } = getPointerPos(e);
      dragNodeRef.current.x = x;
      dragNodeRef.current.y = y;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    }
  };

  const handleEnd = () => {
    dragNodeRef.current = null;
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getPointerPos(e);
    const clickedNode = data.nodes.find((node) => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return dist < 30;
    });
    if (clickedNode && !dragNodeRef.current) onNodeClick(clickedNode.id);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onClick={handleClick}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="z-10 block h-full w-full cursor-crosshair touch-none active:cursor-grabbing"
      />
    </div>
  );
}
