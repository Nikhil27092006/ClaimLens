// Fictional papers and passages for the mock API, taken from the design artboards.
// Shared by the MSW handlers and scripts/make-sample-pdfs.ts, which writes each passage onto
// its cited page of a generated sample PDF. Relative imports only: the script runs under Node.

import type { Chunk, Document } from '../api/types';

export interface MockPaper extends Omit<Document, 'uploaded_at' | 'status' | 'progress'> {
  /** Running heads by first page; a section runs until the next one starts. */
  sections: { from: number; head: string }[];
}

export const PAPERS: MockPaper[] = [
  {
    document_id: 'DOC001',
    title: 'Low-Rank Adapters at Scale',
    filename: 'low-rank-adapters-at-scale.pdf',
    authors: 'Rao, Lindqvist et al.',
    year: 2025,
    pages: 26,
    chunks: 184,
    source: 'upload',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 2, head: '2 METHOD' },
      { from: 4, head: '3 EXPERIMENTAL SETUP' },
      { from: 6, head: '4 RESULTS' },
      { from: 10, head: '5 ANALYSIS' },
      { from: 14, head: '6 RELATED WORK' },
      { from: 16, head: '7 CONCLUSION' },
      { from: 17, head: 'APPENDIX' },
    ],
  },
  {
    document_id: 'DOC002',
    title: 'Quantized Adapters for Open Models',
    filename: 'quantized-adapters-for-open-models.pdf',
    authors: 'Okafor, Chen et al.',
    year: 2024,
    pages: 26,
    chunks: 171,
    source: 'search',
    url: 'https://arxiv.org/abs/2405.11873',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 3, head: '2 BACKGROUND' },
      { from: 4, head: '3 METHOD' },
      { from: 6, head: '4 RESULTS' },
      { from: 10, head: '5 ANALYSIS' },
      { from: 11, head: '6 LIMITATIONS' },
      { from: 12, head: '7 CONCLUSION' },
      { from: 13, head: 'APPENDIX' },
    ],
  },
  {
    document_id: 'DOC003',
    title: 'Decomposed Weight Updates',
    filename: 'decomposed-weight-updates.pdf',
    authors: 'Varga, Iyer et al.',
    year: 2025,
    pages: 21,
    chunks: 143,
    source: 'search',
    url: 'https://www.semanticscholar.org/paper/decomposed-weight-updates',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 3, head: '3 METHOD' },
      { from: 5, head: '4 RESULTS' },
      { from: 8, head: '5 FORGETTING' },
      { from: 12, head: '6 CONCLUSION' },
      { from: 13, head: 'APPENDIX' },
    ],
  },
  {
    document_id: 'DOC004',
    title: 'Adapters Learn Less and Forget Less',
    filename: 'adapters-learn-less-and-forget-less.pdf',
    authors: 'Moreau, Patel et al.',
    year: 2024,
    pages: 38,
    chunks: 212,
    source: 'search',
    url: 'https://arxiv.org/abs/2405.09673',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 3, head: '2 SETUP' },
      { from: 5, head: '3 LEARNING' },
      { from: 8, head: '4 FORGETTING' },
      { from: 14, head: '5 DISCUSSION' },
      { from: 18, head: 'APPENDIX' },
    ],
  },
  {
    document_id: 'DOC005',
    title: 'Where Parameter-Efficient Tuning Breaks',
    filename: 'where-parameter-efficient-tuning-breaks.pdf',
    authors: 'Sato, Brennan et al.',
    year: 2025,
    pages: 19,
    chunks: 128,
    source: 'upload',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 3, head: '2 METHOD' },
      { from: 6, head: '3 RESULTS' },
      { from: 12, head: '4 CONCLUSION' },
    ],
  },
  {
    document_id: 'DOC006',
    title: 'Rank Matters More Than You Think',
    filename: 'rank-matters-more-than-you-think.pdf',
    authors: 'Haddad, Nguyen et al.',
    year: 2025,
    pages: 24,
    chunks: 156,
    source: 'search',
    url: 'https://arxiv.org/abs/2502.04411',
    sections: [
      { from: 1, head: '1 INTRODUCTION' },
      { from: 3, head: '2 METHOD' },
      { from: 5, head: '3 RESULTS' },
      { from: 10, head: '5 ABLATIONS' },
      { from: 14, head: '6 CONCLUSION' },
      { from: 15, head: 'APPENDIX' },
    ],
  },
];

const chunk = (chunk_id: string, page: number, section: string, text: string): Chunk => ({
  chunk_id,
  document_id: chunk_id.slice(0, 6),
  page,
  section,
  text,
});

/** Every passage the mock results cite. Each appears verbatim on its page of the sample PDF. */
export const CHUNKS: Chunk[] = [
  // DOC001 Low-Rank Adapters at Scale
  chunk('DOC001_CH003', 1, 'footnote', 'Code and checkpoints are released under an open licence.'),
  chunk(
    'DOC001_CH012',
    3,
    '§2',
    'We apply LoRA with rank 16 to every attention and MLP projection.',
  ),
  chunk('DOC001_CH027', 5, '§4', 'We adapt base models with 7B and 13B parameters.'),
  chunk(
    'DOC001_CH041',
    6,
    'Table 2',
    'Table 2 reports accuracy on our instruction-following suite.',
  ),
  chunk('DOC001_CH042', 6, '', 'Accuracy is the fraction of exactly matched answers.'),
  chunk(
    'DOC001_CH051',
    7,
    '§4.2 Results',
    'On instruction-following suites, LoRA recovers 98–100% of full fine-tuning accuracy across all model sizes tested.',
  ),
  chunk(
    'DOC001_CH052',
    7,
    '§4.2',
    'LoRA recovers nearly all of full fine-tuning accuracy across our evaluation suite.',
  ),
  chunk(
    'DOC001_CH053',
    7,
    '§4.2',
    'Across all model sizes, LoRA stays within one point of full fine-tuning.',
  ),

  // DOC002 Quantized Adapters for Open Models
  chunk('DOC002_CH002', 1, '', 'Our code and quantized checkpoints are publicly available.'),
  chunk(
    'DOC002_CH018',
    4,
    '§3',
    'We train LoRA adapters on top of a frozen 4-bit quantized base model.',
  ),
  chunk('DOC002_CH035', 6, '§4', 'We adapt base models from 7B to 65B parameters.'),
  chunk(
    'DOC002_CH042',
    8,
    '§4 Results',
    'Across all eight benchmarks in Table 3, our 4-bit adapters match 16-bit full fine-tuning to within run-to-run variance.',
  ),
  chunk('DOC002_CH043', 8, 'Table 3', 'Table 3 lists results on an eight-task benchmark suite.'),
  chunk('DOC002_CH044', 8, '', 'We report accuracy for every task.'),
  chunk(
    'DOC002_CH058',
    8,
    'Table 3',
    'Our 4-bit adapters match 16-bit full fine-tuning on every benchmark in Table 3.',
  ),
  chunk(
    'DOC002_CH063',
    9,
    '§4.3',
    'Rank has little effect on final quality once all layers are adapted.',
  ),
  chunk(
    'DOC002_CH070',
    11,
    '§6 Limitations',
    'We leave mathematical reasoning benchmarks to future work.',
  ),

  // DOC003 Decomposed Weight Updates
  chunk('DOC003_CH004', 2, '', 'Our implementation is available online.'),
  chunk(
    'DOC003_CH014',
    3,
    '§3',
    'We decompose each weight update into a magnitude and a direction component.',
  ),
  chunk('DOC003_CH025', 5, '§4', 'All experiments use a 7B base model.'),
  chunk('DOC003_CH033', 6, 'Table 1', 'Table 1 reports accuracy on a commonsense reasoning suite.'),
  chunk('DOC003_CH034', 6, '', 'Accuracy is averaged over the eight commonsense tasks.'),
  chunk(
    'DOC003_CH040',
    6,
    '§4.1',
    'With magnitude decomposition, the adapter closes the remaining gap on commonsense reasoning.',
  ),
  chunk(
    'DOC003_CH041',
    6,
    '§4.1',
    'Decomposition improves average accuracy by 1.1 points over LoRA.',
  ),
  chunk(
    'DOC003_CH061',
    10,
    '§5.2',
    'Forgetting is comparable to full fine-tuning at matched learning rates.',
  ),

  // DOC004 Adapters Learn Less and Forget Less
  chunk('DOC004_CH002', 1, '', 'Training code is released with the paper.'),
  chunk('DOC004_CH010', 3, '§2', 'We compare LoRA against full fine-tuning on the same data.'),
  chunk('DOC004_CH020', 4, '§2', 'All models start from the same 7B base model.'),
  chunk('DOC004_CH029', 5, '§3', 'We report pass@1 for code tasks and accuracy for math.'),
  chunk('DOC004_CH030', 5, 'Fig. 2', 'Figure 2 covers the code and math benchmarks.'),
  chunk(
    'DOC004_CH031',
    5,
    'Fig. 2',
    'On code and math, LoRA substantially underperforms full fine-tuning even with long training runs.',
  ),
  chunk(
    'DOC004_CH032',
    5,
    '§3',
    'On code generation, LoRA substantially underperforms full fine-tuning.',
  ),
  chunk(
    'DOC004_CH044',
    8,
    '§4',
    'LoRA better preserves performance on tasks outside the fine-tuning domain.',
  ),

  // DOC005 Where Parameter-Efficient Tuning Breaks
  chunk(
    'DOC005_CH066',
    9,
    'Table 4',
    'Pass@1 on HumanEval falls 9 points short of the fully fine-tuned baseline.',
  ),

  // DOC006 Rank Matters More Than You Think
  chunk('DOC006_CH005', 1, '', 'Code will be released after review.'),
  chunk('DOC006_CH015', 3, '§2', 'We sweep the LoRA rank from 8 to 512.'),
  chunk('DOC006_CH022', 4, '§2', 'We use a single 7B base model throughout.'),
  chunk('DOC006_CH030', 6, 'Table 2', 'Table 2 lists the code benchmarks we evaluate.'),
  chunk('DOC006_CH031', 6, '', 'We report pass@1 on every code benchmark.'),
  chunk(
    'DOC006_CH077',
    11,
    '§5.1 Ablations',
    'On code, LoRA matches full fine-tuning only at rank 256 and above.',
  ),
  chunk('DOC006_CH078', 11, '§5.1', 'Below rank 64, code accuracy drops sharply.'),
];

export function findChunk(chunkId: string): Chunk | undefined {
  return CHUNKS.find((c) => c.chunk_id === chunkId);
}

export function findPaper(documentId: string): MockPaper | undefined {
  return PAPERS.find((p) => p.document_id === documentId);
}

export function sectionHead(paper: MockPaper, page: number): string {
  let head = paper.sections[0]?.head ?? '';
  for (const section of paper.sections) if (section.from <= page) head = section.head;
  return head;
}
