interface PdfPagePlaceholderProps {
  page: number;
  /** Running head at the top of the page, e.g. "4 RESULTS". */
  runningHead?: string;
  /** The cited sentence, drawn highlighted on the page. */
  highlight?: string;
  /** Caption of a figure/table box, e.g. "Table 3". */
  figureLabel?: string;
}

function Lines({ widths }: { widths: number[] }) {
  return (
    <>
      {widths.map((width, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="block h-[7px] bg-pdf-line"
          style={{ width: `${width}%` }}
        />
      ))}
    </>
  );
}

/**
 * Stand-in for a rendered PDF page (Ask artboard), used before the real page loads and in the kit.
 * Text lines are grey bars; the cited sentence is marked with a 2px ink outline.
 */
export function PdfPagePlaceholder({
  page,
  runningHead,
  highlight,
  figureLabel,
}: PdfPagePlaceholderProps) {
  return (
    <figure
      aria-label={`Page ${page}`}
      className="flex flex-col gap-2.5 bg-sheet px-10 py-9 text-ink shadow-page"
    >
      <div
        aria-hidden="true"
        className="flex justify-between font-quote text-[12px] italic text-insufficient"
      >
        <span>{runningHead}</span>
        <span>{page}</span>
      </div>
      <Lines widths={[100, 96, 99, 62]} />
      {highlight && (
        <p className="my-1.5 bg-marker px-2 py-1.5 font-quote text-[15px] italic leading-[1.55] outline outline-2 outline-ink">
          {highlight}
        </p>
      )}
      <Lines widths={[98, 100, 91]} />
      {figureLabel && (
        <div
          aria-hidden="true"
          className="my-1.5 flex h-[60px] items-center justify-center border border-pdf-line font-quote text-[12px] italic text-insufficient"
        >
          {figureLabel}
        </div>
      )}
      <Lines widths={[97, 74]} />
    </figure>
  );
}
