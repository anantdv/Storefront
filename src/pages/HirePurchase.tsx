import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BadgePercent,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Fingerprint,
  IdCard,
  Info,
  Landmark,
  Mail,
  Phone,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useConfigStore } from '../store/useConfigStore';
import { getAssetUrl } from '../utils/assets';

type EmployeeType = 'government' | 'private';
type PaymentMode = 'monthly' | 'fortnightly';
type ExportKind = 'customer' | 'loan';
type ExportFormat = 'png' | 'pdf';

const TERM_MAP: Record<EmployeeType, number[]> = {
  government: [6, 12],
  private: [6, 12, 18]
};

const FORTNIGHT_MAP: Record<number, number> = {
  6: 12,
  12: 26,
  18: 36
};

const FORTNIGHT_TO_MONTHS: Record<number, number> = {
  12: 6,
  26: 12,
  36: 18
};

const INTEREST_TABLE = [
  { months: 6, monthlyRate: 3.25, totalInterest: 19.05 },
  { months: 12, monthlyRate: 3.24167, totalInterest: 38.09 },
  { months: 18, monthlyRate: 3.24444, totalInterest: 58.4 }
];

const formatCurrency = (symbol: string, value: number) => {
  const rounded = Number.isFinite(value) ? value : 0;
  return `${symbol}${rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateInputValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDaysLocal = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonthsLocal = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const formatReadableDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const EXPORT_WIDTH = 1600;
const EXPORT_HEIGHT = 1000;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const createQrMatrix = (seed: string, size = 29) => {
  const hash = hashString(seed);
  const isFinder = (x: number, y: number) => {
    const zones = [
      [0, 0],
      [size - 7, 0],
      [0, size - 7]
    ];
    return zones.some(([zx, zy]) => x >= zx && x < zx + 7 && y >= zy && y < zy + 7);
  };

  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      if (isFinder(x, y)) return false;
      const value = (hash + x * 17 + y * 31 + x * y * 13) % 11;
      return value < 5 || (x + y + hash) % 7 === 0;
    })
  );
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
};

const buildPdfFromJpeg = (dataUrl: string, width: number, height: number) => {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const header = '%PDF-1.4\n';
  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ`;
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
  const imageHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`;
  const imageFooter = '\nendstream\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

  const parts: BlobPart[] = [];
  const offsets = [0];
  let current = header.length;
  parts.push(header);

  const pushObject = (content: string) => {
    offsets.push(current);
    parts.push(content);
    current += content.length;
  };

  pushObject(obj1);
  pushObject(obj2);
  pushObject(obj3);
  pushObject(imageHeader);
  parts.push(bytes.buffer.slice(0));
  current += bytes.length;
  parts.push(imageFooter);
  current += imageFooter.length;
  pushObject(obj5);

  const xrefOffset = current;
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  parts.push(xref, trailer);
  return new Blob(parts, { type: 'application/pdf' });
};

const renderSchedulePdf = async (
  rows: Array<{ dueDate: Date; amount: number; balance: number }>,
  summary: {
    customerName: string;
    customerId: string;
    loanId: string;
    paymentMode: PaymentMode;
    termMonths: number;
    loanAmount: number;
    totalRepayable: number;
    installmentAmount: number;
    startDate: Date;
    currency: string;
    nextDueDate: string;
  }
) => {
  const width = 1600;
  const rowHeight = 62;
  const height = Math.max(900, 360 + rows.length * rowHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  ctx.fillStyle = '#0b0d10';
  ctx.fillRect(0, 0, width, height);

  const header = ctx.createLinearGradient(0, 0, width, 0);
  header.addColorStop(0, '#f11d2b');
  header.addColorStop(0.5, '#ffcb2f');
  header.addColorStop(1, '#1357d9');
  ctx.fillStyle = header;
  ctx.fillRect(0, 0, width, 18);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px Arial, sans-serif';
  ctx.fillText('Courts Repayment Schedule', 70, 100);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 28px Arial, sans-serif';
  ctx.fillText(`${summary.customerName} | ${summary.loanId} | ${summary.paymentMode === 'monthly' ? 'Monthly' : 'Fortnightly'}`, 70, 150);

  const summaryY = 220;
  const summaryBoxes = [
    { label: 'Loan Amount', value: `${summary.currency}${summary.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Total Repayable', value: `${summary.currency}${summary.totalRepayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Installment', value: `${summary.currency}${summary.installmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Start Date', value: formatReadableDate(summary.startDate) }
  ];

  summaryBoxes.forEach((box, idx) => {
    const x = 70 + idx * 360;
    ctx.fillStyle = idx === 0 ? 'rgba(255,203,47,0.12)' : 'rgba(255,255,255,0.06)';
    drawRoundedRect(ctx, x, summaryY, 320, 110, 26);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 18px Arial, sans-serif';
    ctx.fillText(box.label, x + 26, summaryY + 38);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px Arial, sans-serif';
    ctx.fillText(box.value, x + 26, summaryY + 80);
  });

  const tableTop = 380;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  drawRoundedRect(ctx, 70, tableTop, width - 140, height - tableTop - 80, 30);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  drawRoundedRect(ctx, 90, tableTop + 20, width - 180, 70, 22);
  ctx.fill();

  ctx.fillStyle = '#ffcb2f';
  ctx.font = '800 22px Arial, sans-serif';
  ctx.fillText('Installment', 120, tableTop + 64);
  ctx.fillText('Due Date', 460, tableTop + 64);
  ctx.fillText('Amount', 860, tableTop + 64);
  ctx.fillText('Balance', 1230, tableTop + 64);

  rows.forEach((row, idx) => {
    const y = tableTop + 110 + idx * rowHeight;
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)';
    drawRoundedRect(ctx, 90, y, width - 180, 52, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText(String(idx + 1).padStart(2, '0'), 120, y + 34);
    ctx.fillText(formatReadableDate(row.dueDate), 460, y + 34);
    ctx.fillText(`${summary.currency}${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 860, y + 34);
    ctx.fillText(`${summary.currency}${row.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 1230, y + 34);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillText(`First payment on ${formatReadableDate(summary.startDate)} | Next due ${summary.nextDueDate} | Term ${summary.termMonths} months`, 70, height - 42);

  const jpeg = canvas.toDataURL('image/jpeg', 0.95);
  return buildPdfFromJpeg(jpeg, width, height);
};

const renderCardArtwork = async (
  kind: ExportKind,
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerId: string;
    loanId: string;
    loanAmount: number;
    termMonths: number;
    paymentMode: PaymentMode;
    installmentAmount: number;
    totalRepayable: number;
    nextDueDate: string;
    loanDate: string;
    loyaltyPoints: number;
    currency: string;
    initials: string;
  }
) => {
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  const logo = await loadImage(getAssetUrl('/logo.png'));
  const profile = new Image();
  await new Promise<void>((resolve) => {
    profile.onload = () => resolve();
    profile.onerror = () => resolve();
    profile.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <defs>
          <radialGradient id="g" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#ffcb2f"/>
            <stop offset="65%" stop-color="#f11d2b"/>
            <stop offset="100%" stop-color="#1357d9"/>
          </radialGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#g)"/>
        <circle cx="120" cy="96" r="48" fill="#ffffff" fill-opacity="0.18"/>
        <path d="M46 205c18-42 54-64 74-64s56 22 74 64" fill="#ffffff" fill-opacity="0.18"/>
        <text x="120" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="74" font-weight="700" fill="#ffffff">${data.initials}</text>
      </svg>
    `)}`;
  });

  const gold = '#ffcb2f';
  const red = '#f11d2b';
  const blue = '#1357d9';
  const black = '#090b10';

  ctx.fillStyle = black;
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  gradient.addColorStop(0, 'rgba(255,203,47,0.18)');
  gradient.addColorStop(0.5, 'rgba(241,29,43,0.15)');
  gradient.addColorStop(1, 'rgba(19,87,217,0.18)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-40, 120);
  ctx.lineTo(430, 0);
  ctx.lineTo(620, 170);
  ctx.lineTo(190, 340);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < 420; y += 24) {
    for (let x = 0; x < 520; x += 24) {
      ctx.fillRect(x + (y % 48 === 0 ? 8 : 0), y, 10, 10);
    }
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 18, 18, EXPORT_WIDTH - 36, EXPORT_HEIGHT - 36, 46);
  ctx.stroke();

  ctx.drawImage(logo, EXPORT_WIDTH - 300, 36, 220, 110);

  const profileX = 88;
  const profileY = 150;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.arc(profileX + 70, profileY + 70, 70, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'loan' ? blue : gold;
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(profileX + 70, profileY + 70, 62, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(profileX + 70, profileY + 70, 58, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'loan' ? '#1d2230' : '#111318';
  ctx.fill();
  ctx.drawImage(profile, profileX + 14, profileY + 14, 112, 112);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 92px Arial, sans-serif';
  ctx.fillText(kind === 'loan' ? data.loanId.replace('HP-', '') : data.customerId.replace('CRTS-', ''), 88, 460);

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '700 38px Arial, sans-serif';
  ctx.fillText(kind === 'loan' ? 'Loan Card' : 'Customer ID Card', 90, 520);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '600 28px Arial, sans-serif';
  const leftLabelY = 620;
  const rightLabelY = 620;

  if (kind === 'customer') {
    ctx.fillText('Member Since', 92, leftLabelY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px Arial, sans-serif';
    ctx.fillText('07/23', 92, leftLabelY + 58);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 28px Arial, sans-serif';
    ctx.fillText('Valid Till', 780, rightLabelY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px Arial, sans-serif';
    ctx.fillText('07/53', 780, rightLabelY + 58);
  } else {
    ctx.fillText('Loan Amount', 92, leftLabelY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px Arial, sans-serif';
    ctx.fillText(data.currency + data.loanAmount.toLocaleString('en-US'), 92, leftLabelY + 58);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 28px Arial, sans-serif';
    ctx.fillText('Next Due Date', 780, rightLabelY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px Arial, sans-serif';
    ctx.fillText(data.nextDueDate, 780, rightLabelY + 58);
  }

  const subRowY = 800;
  const cardMetaText =
    kind === 'customer'
      ? `${data.customerName}  |  ${data.customerPhone}`
      : `${data.loanId}  |  ${data.paymentMode === 'monthly' ? 'Monthly' : 'Fortnightly'}  |  ${data.termMonths} months`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '600 22px Arial, sans-serif';
  drawWrappedText(ctx, cardMetaText, 90, subRowY, 860, 28);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px Arial, sans-serif';
  ctx.fillText(kind === 'customer' ? 'CUSTOMER IDENTIFICATION' : 'LOAN DETAILS', 90, 930);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 20px Arial, sans-serif';
  ctx.fillText(kind === 'customer' ? `Member points ${data.loyaltyPoints}` : `Installment ${data.paymentMode === 'monthly' ? data.installmentAmount.toFixed(2) : data.installmentAmount.toFixed(2)}`, 90, 962);

  const qrSeed =
    kind === 'customer'
      ? `${data.customerId}-${data.customerEmail}-${data.customerPhone}`
      : `${data.loanId}-${data.loanAmount}-${data.termMonths}`;
  const matrix = createQrMatrix(qrSeed);
  const qrSize = 290;
  const qrX = EXPORT_WIDTH - 370;
  const qrY = EXPORT_HEIGHT - 370;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 24);
  ctx.fill();
  ctx.save();
  ctx.translate(qrX + 18, qrY + 18);
  const moduleSize = (qrSize - 36) / matrix.length;
  ctx.fillStyle = '#090b10';
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
      }
    });
  });
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillText(kind === 'customer' ? 'SCAN CUSTOMER QR' : 'SCAN LOAN QR', qrX - 8, qrY - 16);

  if (kind === 'customer') {
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText(data.customerName, 160, 260);
    ctx.font = '500 20px Arial, sans-serif';
    ctx.fillText(data.customerEmail, 160, 292);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText(data.loanId, 160, 260);
    ctx.font = '500 20px Arial, sans-serif';
    ctx.fillText(`Repayment ${data.paymentMode} | ${data.termMonths} months`, 160, 292);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 18px Arial, sans-serif';
  ctx.fillText(kind === 'customer' ? 'DEMONSTRATION CARD - NOT ACTIVE' : 'LOAN SUMMARY CARD', 90, 990);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '600 18px Arial, sans-serif';
  ctx.fillText(kind === 'customer' ? 'COURTS IDENTITY' : 'COURTS FINANCE', EXPORT_WIDTH - 380, 990);

  return canvas;
};

const exportCard = async (
  kind: ExportKind,
  format: ExportFormat,
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerId: string;
    loanId: string;
    loanAmount: number;
    termMonths: number;
    paymentMode: PaymentMode;
    installmentAmount: number;
    totalRepayable: number;
    nextDueDate: string;
    loanDate: string;
    loyaltyPoints: number;
    currency: string;
    initials: string;
  }
) => {
  const canvas = await renderCardArtwork(kind, data);
  const baseName = kind === 'customer' ? 'customer-id-card' : 'loan-card';

  if (format === 'png') {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      downloadBlob(blob, `${baseName}.png`);
    }
    return;
  }

  const jpeg = canvas.toDataURL('image/jpeg', 0.95);
  const pdfBlob = buildPdfFromJpeg(jpeg, EXPORT_WIDTH, EXPORT_HEIGHT);
  downloadBlob(pdfBlob, `${baseName}.pdf`);
};

const PseudoQr: React.FC<{ seed: string; className?: string }> = ({ seed, className }) => {
  const size = 29;
  const hash = hashString(seed);

  const isFinder = (x: number, y: number) => {
    const zones = [
      [0, 0],
      [size - 7, 0],
      [0, size - 7]
    ];
    return zones.some(([zx, zy]) => x >= zx && x < zx + 7 && y >= zy && y < zy + 7);
  };

  const cell = (x: number, y: number) => {
    const value = (hash + x * 17 + y * 31 + x * y * 13) % 11;
    return value < 5 || (x + y + hash) % 7 === 0;
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label="QR code" shapeRendering="crispEdges">
      <rect width={size} height={size} rx="3" fill="#f8fafc" />
      <rect x="1" y="1" width={size - 2} height={size - 2} rx="2" fill="#ffffff" />

      {Array.from({ length: size }).map((_, y) =>
        Array.from({ length: size }).map((__, x) => {
          if (isFinder(x, y)) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={cell(x, y) ? '#0b0d10' : 'transparent'}
            />
          );
        })
      )}

      {[
        [0, 0],
        [size - 7, 0],
        [0, size - 7]
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#0b0d10" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0b0d10" />
        </g>
      ))}
    </svg>
  );
};

const FieldRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`rounded-2xl border px-4 py-3 ${accent ? 'border-[#ffcb2f]/25 bg-[#ffcb2f]/10' : 'border-white/10 bg-white/5'}`}>
    <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/50">{label}</span>
    <span className="mt-2 block text-sm font-bold leading-tight text-white break-words">{value}</span>
  </div>
);

const ActionPill: React.FC<{ icon: React.ReactNode; label: string; href?: string; onClick?: () => void }> = ({ icon, label, href, onClick }) => {
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffcb2f]/15 text-[#ffcb2f]">{icon}</span>
      <span>{label}</span>
    </>
  );

  const className =
    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/85 transition-colors hover:bg-white/10';

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export const HirePurchase: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { currency } = useConfigStore();

  const [employeeType, setEmployeeType] = useState<EmployeeType>('private');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('monthly');
  const [termMonths, setTermMonths] = useState<number>(6);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [scheduleStartDate, setScheduleStartDate] = useState<string>(toDateInputValue(addDaysLocal(new Date(), 1)));

  useEffect(() => {
    const nextTerms = TERM_MAP[employeeType];
    if (!nextTerms.includes(termMonths)) {
      setTermMonths(nextTerms[0]);
    }
  }, [employeeType, termMonths]);

  useEffect(() => {
    const loanAmountParam = searchParams.get('loanAmount');
    if (loanAmountParam !== null) {
      const parsed = Number(loanAmountParam);
      if (Number.isFinite(parsed) && parsed >= 0) {
        setLoanAmount(parsed);
      }
    }

    const startDateParam = searchParams.get('startDate');
    if (startDateParam) {
      setScheduleStartDate(startDateParam);
    }
  }, [searchParams]);

  const allowedTerms = TERM_MAP[employeeType];
  const availableTermOptions = paymentMode === 'monthly'
    ? allowedTerms.map((months) => ({ value: months, label: `${months} months` }))
    : allowedTerms.map((months) => {
        const fortnights = FORTNIGHT_MAP[months];
        return { value: fortnights, label: `${fortnights} fortnights` };
      });
  const selectedTermValue = paymentMode === 'monthly' ? termMonths : FORTNIGHT_MAP[termMonths];

  const currentPlan = INTEREST_TABLE.find((row) => row.months === termMonths) ?? INTEREST_TABLE[0];
  const paymentCount = paymentMode === 'monthly' ? termMonths : FORTNIGHT_MAP[termMonths];
  const totalRepayable = loanAmount * (1 + currentPlan.totalInterest / 100);
  const installmentAmount = totalRepayable / paymentCount;
  const scheduleStart = scheduleStartDate ? fromDateInputValue(scheduleStartDate) : addDaysLocal(new Date(), 1);
  const hasLoanAmount = loanAmount > 0;
  const scheduleRows = hasLoanAmount
    ? Array.from({ length: paymentCount }, (_, index) => {
        const dueDate = paymentMode === 'monthly'
          ? addMonthsLocal(scheduleStart, index)
          : addDaysLocal(scheduleStart, index * 14);
        return { dueDate, amount: 0, balance: 0 };
      })
    : [];
  let runningBalance = Number(totalRepayable.toFixed(2));
  const adjustedScheduleRows = scheduleRows.map((row, index) => {
    const amount = index === scheduleRows.length - 1
      ? Number(runningBalance.toFixed(2))
      : Number(installmentAmount.toFixed(2));
    runningBalance = Number((runningBalance - amount).toFixed(2));
    return {
      ...row,
      amount,
      balance: Math.max(0, runningBalance)
    };
  });
  const customerName = user?.name || 'Guest Customer';
  const customerEmail = user?.email || 'customer@courts.com.pg';
  const customerPhone = user?.phone || '+675 7000 0000';
  const initials = customerName.trim().slice(0, 1).toUpperCase() || 'C';
  const customerId = `CRTS-${hashString(`${customerName}-${customerEmail}`).toString(36).toUpperCase().slice(0, 8)}`;
  const loanId = `HP-${hashString(`${customerEmail}-${loanAmount}-${termMonths}`).toString(36).toUpperCase().slice(0, 8)}`;
  const loanDate = '20 Jun 2026';
  const nextDueDate = termMonths === 6 ? '20 Jul 2026' : termMonths === 12 ? '20 Aug 2026' : '20 Sep 2026';
  const exportPayload = {
    customerName,
    customerEmail,
    customerPhone,
    customerId,
    loanId,
    loanAmount,
    termMonths,
    paymentMode,
    installmentAmount,
    totalRepayable,
    nextDueDate,
    loanDate,
    loyaltyPoints: user?.loyaltyPoints ?? 0,
    currency,
    initials
  };

  const exportSchedule = async () => {
    if (!hasLoanAmount) return;
    try {
      const pdfBlob = await renderSchedulePdf(adjustedScheduleRows, {
        customerName,
        customerId,
        loanId,
        paymentMode,
        termMonths,
        loanAmount,
        totalRepayable,
        installmentAmount,
        startDate: scheduleStart,
        currency,
        nextDueDate
      });
      downloadBlob(pdfBlob, 'repayment-schedule.pdf');
    } catch (error) {
      console.error('Failed to export repayment schedule:', error);
    }
  };

  const handleDownload = async (kind: ExportKind, format: ExportFormat) => {
    try {
      await exportCard(kind, format, exportPayload);
    } catch (error) {
      console.error('Failed to export card:', error);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-4 top-0 -z-10 h-40 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(241,29,43,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,203,47,0.22),transparent_24%),linear-gradient(135deg,rgba(9,11,16,0.98),rgba(19,87,217,0.22))]" />

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d10] text-white shadow-[0_24px_80px_rgba(9,11,16,0.45)]">
        <div className="h-1 w-full bg-gradient-to-r from-[#f11d2b] via-[#ffcb2f] to-[#1357d9]" />
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.35fr_0.95fr] xl:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffcb2f]/20 bg-[#ffcb2f]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">
              <Sparkles className="h-3.5 w-3.5" />
              Hire Purchase Dashboard
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black leading-none tracking-tight sm:text-4xl">
                Courts Hire Purchase
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
                Flexible repayment plans for customers who want a clean loan profile, clear instalment schedule, and a branded customer ID and loan card in the Courts theme.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Customer</p>
                <p className="mt-2 text-base font-black">{customerName}</p>
                <p className="mt-1 text-xs text-white/60">{customerEmail}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Loan Offer</p>
                <p className="mt-2 text-base font-black">{formatCurrency(currency, loanAmount)}</p>
                <p className="mt-1 text-xs text-white/60">Editable finance value</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Term</p>
                <p className="mt-2 text-base font-black">{termMonths} months</p>
                <p className="mt-1 text-xs text-white/60">{FORTNIGHT_MAP[termMonths]} fortnights equivalent</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Installment</p>
                <p className="mt-2 text-base font-black">{formatCurrency(currency, installmentAmount)}</p>
                <p className="mt-1 text-xs text-white/60">{paymentMode === 'monthly' ? 'Monthly' : 'Fortnightly'} plan</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-[#1357d9]/25 bg-[#1357d9]/12 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8bb4ff]">Loan Snapshot</p>
                  <p className="mt-2 text-3xl font-black">{formatCurrency(currency, totalRepayable)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-[#ffcb2f]">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-white/70">
                <span>Next due date</span>
                <span className="font-bold text-white">{nextDueDate}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                <span>Plan reference</span>
                <span className="font-bold text-white">{loanId}</span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#f11d2b] p-5 text-white shadow-lg shadow-[#f11d2b]/15">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/75">Schedule</p>
              <p className="mt-2 text-lg font-black">
                {paymentMode === 'monthly' ? `${termMonths} monthly payments` : `${FORTNIGHT_MAP[termMonths]} fortnightly payments`}
              </p>
              <p className="mt-2 text-xs leading-5 text-white/75">
                Both monthly and fortnightly repayment views are available. The term choice respects the employee rules below.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-[#10131a] p-6 text-white shadow-[0_18px_40px_rgba(11,13,16,0.16)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">Loan settings</p>
                <h2 className="mt-2 text-2xl font-black">Repayment controls</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  Adjust the customer profile, payment mode, and eligible term to keep the loan offer aligned with Courts finance policy.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-2">
                {(['monthly', 'fortnightly'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`min-w-[7.5rem] rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors ${
                      paymentMode === mode ? 'bg-[#ffcb2f] text-[#0b0d10]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {mode === 'monthly' ? 'Monthly' : 'Fortnightly'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Employee type</span>
                <select
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value as EmployeeType)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-[#ffcb2f]/40"
                >
                  <option value="government">Government Employee</option>
                  <option value="private">Private Employee</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
                  Term ({paymentMode === 'monthly' ? 'months' : 'fortnights'})
                </span>
                <select
                  value={selectedTermValue}
                  onChange={(e) => {
                    const selected = Number(e.target.value);
                    setTermMonths(paymentMode === 'monthly' ? selected : (FORTNIGHT_TO_MONTHS[selected] ?? termMonths));
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-[#ffcb2f]/40"
                >
                  {availableTermOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Loan amount</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-[#ffcb2f]/40"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-[#ffcb2f]">
                  <BadgePercent className="h-4.5 w-4.5" />
                  <p className="text-xs font-black uppercase tracking-[0.24em]">Payment summary</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FieldRow
                    label={paymentMode === 'monthly' ? 'Monthly installment' : 'Fortnightly installment'}
                    value={formatCurrency(currency, totalRepayable / paymentCount)}
                    accent
                  />
                  <FieldRow
                    label="Equivalent monthly"
                    value={formatCurrency(currency, totalRepayable / termMonths)}
                  />
                  <FieldRow
                    label="Equivalent fortnightly"
                    value={formatCurrency(currency, totalRepayable / FORTNIGHT_MAP[termMonths])}
                  />
                  <FieldRow label="Payment count" value={`${paymentCount} ${paymentMode === 'monthly' ? 'months' : 'fortnights'}`} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-[#ffcb2f]">
                  <ReceiptText className="h-4.5 w-4.5" />
                  <p className="text-xs font-black uppercase tracking-[0.24em]">Rate table</p>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Term</th>
                        <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Monthly rate</th>
                        <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Total interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INTEREST_TABLE.map((row) => (
                        <tr key={row.months} className="border-t border-white/10 bg-[#0b0d10]">
                          <td className="px-3 py-3 font-bold text-white">{String(row.months).padStart(2, '0')} months</td>
                          <td className="px-3 py-3 text-white/80">{row.monthlyRate.toFixed(5)}%</td>
                          <td className="px-3 py-3 text-white/80">{row.totalInterest.toFixed(5)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-[#0b0d10] p-5">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#ffcb2f]">
                    <CalendarDays className="h-4.5 w-4.5" />
                    <p className="text-xs font-black uppercase tracking-[0.24em]">Repayment schedule</p>
                  </div>
                  <p className="mt-2 text-sm text-white/65">
                    {hasLoanAmount
                      ? 'Schedule starts from the selected date. Default is tomorrow.'
                      : 'Enter a loan amount to generate the repayment schedule.'}
                  </p>
                </div>

                <label className="space-y-2 sm:min-w-[220px]">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Schedule from</span>
                  <input
                    type="date"
                    value={scheduleStartDate}
                    min={toDateInputValue(addDaysLocal(new Date(), 1))}
                    onChange={(e) => setScheduleStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-[#ffcb2f]/40"
                  />
                </label>
              </div>

              {hasLoanAmount ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <FieldRow
                      label="First payment"
                      value={formatReadableDate(scheduleStart)}
                      accent
                    />
                    <FieldRow
                      label="Last payment"
                      value={formatReadableDate(adjustedScheduleRows[adjustedScheduleRows.length - 1]?.dueDate || scheduleStart)}
                    />
                    <FieldRow
                      label="Schedule length"
                      value={`${adjustedScheduleRows.length} ${paymentMode === 'monthly' ? 'months' : 'fortnights'}`}
                    />
                    <FieldRow
                      label="Installment amount"
                      value={formatCurrency(currency, installmentAmount)}
                    />
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-white/5 text-white/60">
                        <tr>
                          <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">#</th>
                          <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Due date</th>
                          <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Amount</th>
                          <th className="px-3 py-3 font-black uppercase tracking-[0.18em]">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adjustedScheduleRows.map((row, index) => (
                          <tr key={`${row.dueDate.toISOString()}-${index}`} className="border-t border-white/10 bg-[#11151d]">
                            <td className="px-3 py-3 font-bold text-white">{String(index + 1).padStart(2, '0')}</td>
                            <td className="px-3 py-3 text-white/80">{formatReadableDate(row.dueDate)}</td>
                            <td className="px-3 py-3 text-white/80">{formatCurrency(currency, row.amount)}</td>
                            <td className="px-3 py-3 text-white/80">{formatCurrency(currency, row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionPill
                      icon={<Download className="h-4.5 w-4.5" />}
                      label="Download Schedule PDF"
                      onClick={() => void exportSchedule()}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Once you enter a loan amount, the payment schedule will appear here starting from the selected date.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-[#0b0d10] p-6 text-white shadow-[0_18px_40px_rgba(11,13,16,0.2)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">Terms of payments</p>
                  <h3 className="mt-2 text-xl font-black">Eligibility rules</h3>
                </div>
                <ShieldCheck className="h-6 w-6 text-[#ffcb2f]" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-black text-white">Government Employee</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Minimum 6 months, maximum 12 months.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-black text-white">Private Employee</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Minimum 6 months, maximum 18 months.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#ffcb2f]/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcb2f]">Fortnight mapping</p>
                  <p className="mt-2 text-sm font-bold text-white">6 months = 12 fortnights</p>
                  <p className="mt-1 text-sm font-bold text-white">12 months = 26 fortnights</p>
                  <p className="mt-1 text-sm font-bold text-white">18 months = 36 fortnights</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#10131a] p-6 text-white shadow-[0_18px_40px_rgba(11,13,16,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">Documents</p>
                  <h3 className="mt-2 text-xl font-black">Loan checklist</h3>
                </div>
                <FileText className="h-6 w-6 text-[#ffcb2f]" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                {[
                  'National ID or valid photo identification',
                  'Employment confirmation letter',
                  'Latest 3 payslips',
                  'Recent bank statements',
                  'Customer contact and branch details'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-[#0b0d10] p-6 text-white shadow-[0_18px_40px_rgba(11,13,16,0.2)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">Customer profile</p>
                <h3 className="mt-2 text-2xl font-black">Loan Card</h3>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[#ffcb2f]">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_132px]">
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1357d9] text-lg font-black text-white">
                        {initials}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Status</p>
                        <p className="mt-2 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">Active</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Amount</p>
                      <p className="mt-2 text-2xl font-black">{formatCurrency(currency, loanAmount)}</p>
                    </div>
                  </div>
                </div>

                <FieldRow label="Loan ID" value={loanId} />
                <FieldRow label="Customer ID" value={customerId} />
                <FieldRow label="Payment mode" value={paymentMode === 'monthly' ? 'Monthly' : 'Fortnightly'} />
                <FieldRow label="Employee type" value={employeeType === 'government' ? 'Government Employee' : 'Private Employee'} />
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white p-3">
                <PseudoQr seed={`${loanId}-${loanAmount}-${termMonths}`} className="w-full" />
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                  Scan to open loan profile
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ActionPill icon={<QrCode className="h-4.5 w-4.5" />} label="View Schedule" href="/account?tab=orders" />
              <ActionPill icon={<Download className="h-4.5 w-4.5" />} label="Download PNG" onClick={() => void handleDownload('loan', 'png')} />
              <ActionPill icon={<Download className="h-4.5 w-4.5" />} label="Download PDF" onClick={() => void handleDownload('loan', 'pdf')} />
              <ActionPill icon={<Landmark className="h-4.5 w-4.5" />} label="Branch Info" href="/store-locator" />
              <ActionPill icon={<ChevronRight className="h-4.5 w-4.5" />} label="Account" href="/account" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#1357d9] p-6 text-white shadow-[0_18px_40px_rgba(19,87,217,0.2)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Identity card</p>
                <h3 className="mt-2 text-2xl font-black">Customer ID Card</h3>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <IdCard className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_132px]">
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffcb2f] text-lg font-black text-[#0b0d10]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Customer</p>
                      <p className="truncate text-lg font-black">{customerName}</p>
                      <p className="truncate text-xs text-white/70">{customerEmail}</p>
                    </div>
                  </div>
                </div>

                <FieldRow label="Customer ID" value={customerId} />
                <FieldRow label="Phone" value={customerPhone} />
                <FieldRow label="Member points" value={String(user?.loyaltyPoints ?? 0)} />
                <FieldRow label="Loan date" value={loanDate} />
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white p-3">
                <PseudoQr seed={`${customerId}-${customerEmail}-${customerPhone}`} className="w-full" />
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                  Customer ID QR
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionPill icon={<Phone className="h-4.5 w-4.5" />} label="Call Customer Care" href="/store-locator" />
              <ActionPill icon={<Mail className="h-4.5 w-4.5" />} label="Email Statement" />
              <ActionPill icon={<Fingerprint className="h-4.5 w-4.5" />} label="KYC Check" />
              <ActionPill icon={<Download className="h-4.5 w-4.5" />} label="Download PNG" onClick={() => void handleDownload('customer', 'png')} />
              <ActionPill icon={<Download className="h-4.5 w-4.5" />} label="Download PDF" onClick={() => void handleDownload('customer', 'pdf')} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcb2f]">Relationship view</p>
            <h2 className="mt-2 text-2xl font-black text-white">Your relations</h2>
          </div>
          <Link to="/account" className="text-sm font-black text-[#ffcb2f] hover:text-[#ffe27d]">
            View all
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white p-5 shadow-[0_18px_40px_rgba(11,13,16,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Active</span>
              <span className="text-sm font-black text-slate-400">{customerId}</span>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black text-slate-900">Hire Purchase</p>
                <p className="mt-1 text-sm text-slate-500">Loan amount and repayment schedule</p>
              </div>
              <div className="rounded-2xl bg-[#0b0d10] p-3 text-[#ffcb2f]">
                <WalletCards className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Loan offer amount</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(currency, loanAmount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Payment mode</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{paymentMode === 'monthly' ? 'Monthly' : 'Fortnightly'}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <ActionPill icon={<ChevronRight className="h-4.5 w-4.5" />} label="View Details" href="/account" />
              <ActionPill icon={<Download className="h-4.5 w-4.5" />} label="Download" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-5 shadow-[0_18px_40px_rgba(11,13,16,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-amber-600">Matured</span>
              <span className="text-sm font-black text-slate-400">Loan profile</span>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black text-slate-900">Customer ID Card</p>
                <p className="mt-1 text-sm text-slate-500">Identity and contact details</p>
              </div>
              <div className="rounded-2xl bg-[#1357d9] p-3 text-white">
                <IdCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Customer</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{customerName}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Phone</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{customerPhone}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <ActionPill icon={<QrCode className="h-4.5 w-4.5" />} label="QR Profile" href="/account" />
              <ActionPill icon={<ReceiptText className="h-4.5 w-4.5" />} label="Statement" href="/account?tab=orders" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0b0d10] p-5 text-white shadow-[0_18px_40px_rgba(11,13,16,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#f11d2b]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff9aa3]">Reminder</span>
              <span className="text-sm font-black text-white/50">Keep profile updated</span>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black">Re-KYC and salary validation</p>
                <p className="mt-1 text-sm text-white/60">Aligning with the loan profile checks shown in the reference layout.</p>
              </div>
              <div className="rounded-2xl bg-[#ffcb2f]/15 p-3 text-[#ffcb2f]">
                <Info className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Next statement</p>
                <p className="mt-1 text-sm font-bold text-white">{nextDueDate}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Branch</p>
                <p className="mt-1 text-sm font-bold text-white">Courts PNG Finance Desk</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <ActionPill icon={<CalendarDays className="h-4.5 w-4.5" />} label="Update Now" />
              <ActionPill icon={<Building2 className="h-4.5 w-4.5" />} label="Locate Branch" href="/store-locator" />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/10 bg-[#ffcb2f]/10 px-5 py-4 text-sm text-white/85">
        <p className="leading-6">
          The storefront keeps ERPNext integration intact while the finance section uses the Courts theme and safer HTML rendering.
        </p>
        <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0b0d10] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
          Browse Products
          <ChevronRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    </div>
  );
};
