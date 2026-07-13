import { useEffect, useRef } from "react";

export function Waveform({ level: pulse }: { level: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(0);
  useEffect(() => { if (pulse > 0) levelRef.current = 1; }, [pulse]);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const canvas = ref.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const { width, height } = canvas;
      const now = performance.now() / 1000;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(255, 255, 255, 0.08)";
      context.fillRect(0, 0, width, height);
      const center = height * 0.48;
      const amplitudeBase = 24 + levelRef.current * 96;
      for (let index = 0; index < 54; index += 1) {
        const x = (index / 53) * width;
        const wave = Math.sin(index * 0.58 + now * 2.8) * Math.cos(index * 0.21 + now);
        const amplitude = 22 + Math.abs(wave) * amplitudeBase;
        context.beginPath(); context.moveTo(x, center - amplitude); context.lineTo(x, center + amplitude);
        context.lineWidth = 4; context.lineCap = "round";
        context.strokeStyle = index % 3 === 0 ? "rgba(255, 218, 143, 0.9)" : index % 3 === 1 ? "rgba(175, 224, 214, 0.86)" : "rgba(219, 157, 169, 0.78)";
        context.stroke();
      }
      levelRef.current *= 0.92;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} id="waveCanvas" width={720} height={360} />;
}
