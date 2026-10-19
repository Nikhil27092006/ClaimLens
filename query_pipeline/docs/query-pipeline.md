# Query pipeline

The orchestrator validates input, classifies and rewrites the question,
embeds it, performs dense and optional sparse retrieval, fuses and deduplicates
results, reranks and balances evidence, compresses context, assigns controlled
source IDs, generates a structured answer, and maps citations from retrieved
metadata. The model cannot invent page numbers or citation text.
