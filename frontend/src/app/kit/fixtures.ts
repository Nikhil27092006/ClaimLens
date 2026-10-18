// Sample content from the Claim check artboard (fictional papers).

export const KIT_SUPPORTS = [
  {
    n: 1,
    title: 'Low-Rank Adapters at Scale',
    quote:
      'On instruction-following suites, LoRA recovers 98–100% of full fine-tuning accuracy across all model sizes tested.',
    highlight: 'recovers 98–100% of full fine-tuning accuracy',
    page: 7,
    section: '§4.2 Results',
  },
  {
    n: 2,
    title: 'Quantized Adapters for Open Models',
    quote: 'Our 4-bit adapters match 16-bit full fine-tuning on every benchmark in Table 3.',
    highlight: 'match 16-bit full fine-tuning',
    page: 8,
    section: 'Table 3',
  },
  {
    n: 3,
    title: 'Decomposed Weight Updates',
    quote:
      'With magnitude decomposition, the adapter closes the remaining gap on commonsense reasoning.',
    highlight: 'closes the remaining gap',
    page: 6,
    section: '§4.1',
  },
];

export const KIT_CONTRADICTS = [
  {
    n: 4,
    title: 'Adapters Learn Less and Forget Less',
    quote:
      'On code and math, LoRA substantially underperforms full fine-tuning even with long training runs.',
    highlight: 'substantially underperforms full fine-tuning',
    page: 5,
    section: 'Fig. 2',
  },
  {
    n: 5,
    title: 'Where Parameter-Efficient Tuning Breaks',
    quote: 'Pass@1 on HumanEval falls 9 points short of the fully fine-tuned baseline.',
    highlight: 'falls 9 points short',
    page: 9,
    section: 'Table 4',
  },
];

export const KIT_TRACE = [
  { t: 0, message: 'Rewrote the claim into 4 search queries', via: 'nemotron-3-nano' },
  { t: 1.8, message: 'Searched Semantic Scholar — 14 results', via: 'graph/v1/paper/search' },
  { t: 2.4, message: 'Searched arXiv — 9 preprints', via: 'export.arxiv.org' },
  { t: 3.1, message: 'Searched the web — 6 sources', via: 'tavily /search' },
  { t: 6.9, message: 'Downloaded 6 open-access PDFs', via: 'deduped by arXiv id' },
  { t: 12.2, message: 'Parsed and indexed 1,104 chunks', via: 'hybrid: dense + BM25' },
  { t: 19.5, message: 'Judged 31 claim–evidence pairs', via: 'nemotron-3-ultra' },
  { t: 21, message: 'Verified every quote on its page', via: 'deterministic check' },
];
