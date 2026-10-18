import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <PageContainer>
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-label uppercase text-muted">404</p>
        <h1 className="font-display text-claim font-extrabold md:text-h1">Page not found</h1>
      </div>
      <Link
        to="/"
        className="inline-flex min-h-[44px] items-center self-start border-1.5 border-ink bg-ink px-5 text-[15px] font-semibold text-marker no-underline hover:text-marker"
      >
        Back to Check →
      </Link>
    </PageContainer>
  );
}
