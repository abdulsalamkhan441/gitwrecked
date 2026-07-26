'use client';

import { useRef } from 'react';
import { RoastReport, GitHubUserData } from '@/app/utils/roastEngine';
import { Badge } from '@/app/utils/badges';

export default function RoastCard({
  user,
  report,
  badges,
}: {
  user: GitHubUserData;
  report: RoastReport;
  badges: Badge[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = async (): Promise<HTMLCanvasElement> => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = 600, H = 800;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#05070A';
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 500);
    grad.addColorStop(0, 'rgba(248,81,73,0.12)');
    grad.addColorStop(1, 'rgba(5,7,10,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.fillStyle = '#6E7681';
    ctx.font = '16px monospace';
    ctx.fillText('$ gitwrecked receipt', 48, 70);

    try {
      const img = await loadImage(user.avatar_url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(96, 150, 44, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 52, 106, 88, 88);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#242B36';
      ctx.beginPath();
      ctx.arc(96, 150, 44, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#E6E8EB';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`@${user.login}`, 160, 145);

    ctx.fillStyle = '#F85149';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`GRADE: ${report.grade}`, 160, 172);

    let by = 220;
    ctx.font = '14px monospace';
    badges.slice(0, 3).forEach((b) => {
      ctx.fillStyle = '#D29922';
      ctx.fillText(`${b.emoji} ${b.label}`, 48, by);
      by += 26;
    });

    ctx.fillStyle = '#6E7681';
    ctx.font = '13px monospace';
    ctx.fillText('DAMAGE SCORE', 48, by + 20);
    ctx.fillStyle = '#F85149';
    ctx.font = 'bold 40px monospace';
    ctx.fillText(`${report.uselessnessScore}/100`, 48, by + 62);
    ctx.fillStyle = '#E6E8EB';
    ctx.font = '16px monospace';
    wrapText(ctx, report.roastText, 48, by + 110, W - 96, 24, 8);

    ctx.fillStyle = '#6E7681';
    ctx.font = '12px monospace';
    ctx.fillText('gitwrecked.app', 48, H - 40);

    return canvas;
  };

  const download = async () => {
    const canvas = await draw();
    const link = document.createElement('a');
    link.download = `gitwrecked-${user.login}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyImageAndLink = async () => {
    const canvas = await draw();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const link = `${window.location.origin}/roast/${user.login}`;
    try {
      if (blob && 'ClipboardItem' in window) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
      await navigator.clipboard.writeText(link);
    } catch {

    }
  };

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-3">
        <button onClick={download} className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#3FB950] transition-colors">
          download card
        </button>
        <button onClick={copyImageAndLink} className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#D29922] transition-colors">
          copy image + link
        </button>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word + ' ';
      y += lineHeight;
      lines++;
      if (lines >= maxLines - 1) {
        ctx.fillText(line + '…', x, y);
        return;
      }
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}