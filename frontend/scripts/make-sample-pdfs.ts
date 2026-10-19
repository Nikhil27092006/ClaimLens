// Generates the fictional sample PDFs the mock API serves (src/mocks/pdfs/<id>.pdf).
// Every cited passage in src/mocks/papers.ts is written verbatim onto its page, so the
// evidence viewer can find and highlight it. Run: npm run mocks:pdfs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { CHUNKS, PAPERS, sectionHead, type MockPaper } from '../src/mocks/papers.ts';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'mocks', 'pdfs');

const PAGE_W = 612;
const PAGE_H = 792;
const LEFT = 72;
const RIGHT = PAGE_W - 72;
const BODY_SIZE = 10.5;
const LEADING = 14.5;
const CHARS_PER_LINE = 108;

const FILLER = [
  'We follow the standard training recipe and report the mean over three seeds.',
  'All runs share the same learning-rate schedule with a short linear warmup.',
  'Unless noted otherwise, hyperparameters are tuned on a held-out validation split.',
  'We keep the tokenizer and context length fixed across every configuration.',
  'Results for individual tasks appear in the appendix.',
  'Each configuration is trained for the same number of optimizer steps.',
  'We evaluate the final checkpoint rather than the best one seen during training.',
  'Variance across seeds is small compared with the differences we report.',
  'The comparison holds the data and the evaluation harness constant.',
  'We release the evaluation scripts so that every number can be reproduced.',
  'Training uses mixed precision with gradient clipping at a norm of one.',
  'We report wall-clock time on a single node of eight accelerators.',
  'Prior work reached similar conclusions on smaller models.',
  'This setting matches the one most often used in practice.',
  'We discuss the limitations of this protocol in the final section.',
  'Ablations in the appendix vary one factor at a time.',
];

// WinAnsiEncoding bytes for the few non-ASCII characters the passages use.
const WIN_ANSI: Record<string, number> = {
  '–': 0x96,
  '—': 0x97,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '§': 0xa7,
  '×': 0xd7,
};

function pdfString(text: string): Buffer {
  const bytes: number[] = [0x28];
  for (const ch of text) {
    const code = WIN_ANSI[ch] ?? ch.charCodeAt(0);
    if (code > 0xff) throw new Error(`Cannot encode "${ch}" in WinAnsi`);
    if (ch === '(' || ch === ')' || ch === '\\') bytes.push(0x5c);
    bytes.push(code);
  }
  bytes.push(0x29);
  return Buffer.from(bytes);
}

function wrap(text: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > CHARS_PER_LINE) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function filler(seed: number, count: number): string {
  return Array.from(
    { length: count },
    (_, i) => FILLER[(seed * 7 + i * 5) % FILLER.length] ?? FILLER[0],
  ).join(' ');
}

class Page {
  private parts: Buffer[] = [];

  text(font: string, size: number, x: number, y: number, value: string) {
    this.parts.push(
      Buffer.from(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td `),
      pdfString(value),
      Buffer.from(' Tj ET\n'),
    );
  }

  rect(x: number, y: number, w: number, h: number) {
    this.parts.push(Buffer.from(`0.6 G 0.8 w ${x} ${y} ${w} ${h} re S 0 G\n`));
  }

  content(): Buffer {
    return Buffer.concat(this.parts);
  }
}

function renderPage(paper: MockPaper, pageNumber: number, seed: number): Buffer {
  const page = new Page();
  const head = sectionHead(paper, pageNumber);
  page.text('F2', 9, LEFT, PAGE_H - 48, head);
  page.text('F2', 9, RIGHT - String(pageNumber).length * 4.5, PAGE_H - 48, String(pageNumber));

  let y = PAGE_H - 84;
  if (pageNumber === 1) {
    page.text('F3', 18, LEFT, y, paper.title);
    page.text('F4', 11, LEFT, y - 22, `${paper.authors ?? ''}  ·  ${paper.year ?? ''}`);
    page.text('F2', 9, LEFT, y - 38, 'Fictional sample paper generated for the ClaimLens demo.');
    y -= 70;
  }

  const passages = CHUNKS.filter(
    (c) => c.document_id === paper.document_id && c.page === pageNumber,
  );
  // One paragraph per passage (filler around it), then filler paragraphs to fill the page.
  const paragraphs = passages.map((c, i) => ({
    text: `${filler(seed + i, 2)} ${c.text} ${filler(seed + i + 3, 2)}`,
    figure: /^(Table|Fig\.)/.test(c.section) ? c.section : undefined,
  }));
  for (let i = 0; paragraphs.length < 6; i += 1) {
    paragraphs.push({ text: filler(seed + 11 + i, 4), figure: undefined });
  }

  const drawnFigures = new Set<string>();
  for (const paragraph of paragraphs) {
    for (const line of wrap(paragraph.text)) {
      if (y < 84) return page.content();
      page.text('F1', BODY_SIZE, LEFT, y, line);
      y -= LEADING;
    }
    y -= LEADING * 0.6;
    if (paragraph.figure && !drawnFigures.has(paragraph.figure) && y > 170) {
      drawnFigures.add(paragraph.figure);
      page.rect(LEFT, y - 70, RIGHT - LEFT, 70);
      page.text('F2', 9, PAGE_W / 2 - paragraph.figure.length * 2.2, y - 38, paragraph.figure);
      y -= 70 + LEADING * 1.4;
    }
  }
  return page.content();
}

function buildPdf(paper: MockPaper): Buffer {
  const objects: Buffer[] = [];
  const pageIds: number[] = [];
  const firstPageObject = 8;
  for (let p = 0; p < paper.pages; p += 1) pageIds.push(firstPageObject + p * 2);

  objects[1] = Buffer.from('<< /Type /Catalog /Pages 2 0 R >>');
  objects[2] = Buffer.from(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${paper.pages} >>`,
  );
  const font = (base: string) =>
    Buffer.from(`<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`);
  objects[3] = font('Times-Roman');
  objects[4] = font('Times-Italic');
  objects[5] = font('Helvetica-Bold');
  objects[6] = font('Helvetica');
  objects[7] = Buffer.concat([
    Buffer.from('<< /Title '),
    pdfString(paper.title),
    Buffer.from(' /Author '),
    pdfString(paper.authors ?? ''),
    Buffer.from(' /Producer (ClaimLens mock generator) >>'),
  ]);

  const seed = Number(paper.document_id.slice(3));
  for (let p = 0; p < paper.pages; p += 1) {
    const pageId = firstPageObject + p * 2;
    const stream = deflateSync(renderPage(paper, p + 1, seed * 31 + p));
    objects[pageId] = Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${pageId + 1} 0 R >>`,
    );
    objects[pageId + 1] = Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`),
      stream,
      Buffer.from('\nendstream'),
    ]);
  }

  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets: number[] = [];
  let length = parts[0]?.length ?? 0;
  for (let id = 1; id < objects.length; id += 1) {
    const body = objects[id];
    if (!body) continue;
    offsets[id] = length;
    const obj = Buffer.concat([Buffer.from(`${id} 0 obj\n`), body, Buffer.from('\nendobj\n')]);
    parts.push(obj);
    length += obj.length;
  }
  const xref = [
    'xref',
    `0 ${objects.length}`,
    '0000000000 65535 f ',
    ...Array.from(
      { length: objects.length - 1 },
      (_, i) => `${String(offsets[i + 1] ?? 0).padStart(10, '0')} 00000 n `,
    ),
    'trailer',
    `<< /Size ${objects.length} /Root 1 0 R /Info 7 0 R >>`,
    'startxref',
    String(length),
    '%%EOF',
    '',
  ].join('\n');
  parts.push(Buffer.from(xref));
  return Buffer.concat(parts);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const paper of PAPERS) {
  const pdf = buildPdf(paper);
  writeFileSync(join(OUT_DIR, `${paper.document_id}.pdf`), pdf);
  console.log(
    `${paper.document_id}.pdf  ${paper.pages} pages  ${(pdf.length / 1024).toFixed(1)} KB`,
  );
}
