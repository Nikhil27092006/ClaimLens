import { useId } from 'react';
import { DarkPanel } from '@/components/DarkPanel';
import { Overlay } from '@/components/Overlay';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { EvidenceViewer, type PaperMeta } from './EvidenceViewer';
import { useEvidenceViewer } from './useEvidenceViewer';

/**
 * The Evidence viewer as a right-side drawer (full-screen sheet on phones), opened by the
 * ?doc=&page=&chunk= params. Used on Check, Compare and Conflicts.
 */
export function EvidenceDrawer({ papers }: { papers: Record<string, PaperMeta> }) {
  const { target, close, setPage } = useEvidenceViewer();
  const narrow = useMediaQuery('(max-width: 767px)');
  const titleId = useId();
  if (!target) return null;

  return (
    <Overlay variant={narrow ? 'sheet' : 'drawer'} labelledBy={titleId} onClose={close}>
      <DarkPanel padding="lg" className="min-h-full">
        <EvidenceViewer
          target={target}
          meta={papers[target.doc]}
          titleId={titleId}
          onClose={close}
          onPageChange={setPage}
        />
      </DarkPanel>
    </Overlay>
  );
}
