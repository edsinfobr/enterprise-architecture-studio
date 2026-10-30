import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import { slug } from "./storage";

interface ExportOpts {
  fileName: string;
  /** Background color applied to the exported image. */
  background?: string;
}

function triggerDownload(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}

export async function exportPng(el: HTMLElement, opts: ExportOpts) {
  const dataUrl = await toPng(el, {
    backgroundColor: opts.background ?? "#ffffff",
    pixelRatio: 2,
    cacheBust: true,
  });
  triggerDownload(dataUrl, `${slug(opts.fileName)}.png`);
}

export async function exportSvg(el: HTMLElement, opts: ExportOpts) {
  const dataUrl = await toSvg(el, {
    backgroundColor: opts.background ?? "#ffffff",
    cacheBust: true,
  });
  triggerDownload(dataUrl, `${slug(opts.fileName)}.svg`);
}

export async function exportPdf(el: HTMLElement, opts: ExportOpts) {
  const dataUrl = await toPng(el, {
    backgroundColor: opts.background ?? "#ffffff",
    pixelRatio: 2,
    cacheBust: true,
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const orientation = img.width >= img.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fit the image within the page while preserving aspect ratio.
  const margin = 24;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const ratio = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;

  pdf.addImage(dataUrl, "PNG", x, y, w, h);
  pdf.save(`${slug(opts.fileName)}.pdf`);
}
