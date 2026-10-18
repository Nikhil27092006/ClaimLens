import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { apiUrl } from '@/api/client';
import { addDocument } from '@/mocks/db';
import { server } from '@/mocks/node';
import { renderApp } from '@/test/render';

/**
 * jsdom's XMLHttpRequest + FormData never complete against MSW's Node interceptor, so the upload
 * test swaps in an XHR that reports progress and sends through fetch. (The browser uses real XHR.)
 */
class FetchXhr {
  status = 0;
  responseText = '';
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private method = 'GET';
  private url = '';

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  send() {
    this.upload.onprogress?.(
      new ProgressEvent('progress', { lengthComputable: true, loaded: 1, total: 2 }),
    );
    void fetch(this.url, { method: this.method }).then(
      async (response) => {
        this.status = response.status;
        this.responseText = await response.text();
        this.onload?.();
      },
      () => this.onerror?.(),
    );
  }
}

describe('LibraryPage', () => {
  it('lists the papers with source, pages and status', async () => {
    renderApp('/library');

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Low-Rank Adapters at Scale')).toBeInTheDocument();
    expect(within(table).getByText('Rao, Lindqvist et al. · 2025')).toBeInTheDocument();
    expect(within(table).getByText('Quantized Adapters for Open Models')).toBeInTheDocument();
    expect(within(table).getAllByText('arXiv').length).toBeGreaterThan(0);
    expect(within(table).getByText('Ready · 184 chunks')).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'retry with OCR' })).toBeInTheDocument();
  });

  it('selects every ready paper by default and keeps changes in the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/library');

    const ask = await screen.findByRole('link', { name: /Ask across 4 papers/ });
    expect(ask).toHaveAttribute('href', '/ask?docs=DOC001,DOC002,DOC003,DOC004');
    expect(screen.getByRole('button', { name: 'Compare 4 selected' })).toBeEnabled();
    expect(
      screen.getByRole('checkbox', { name: /Where Parameter-Efficient Tuning Breaks/ }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('checkbox', { name: 'Select Quantized Adapters for Open Models' }),
    );
    expect(router.state.location.search).toBe('?sel=DOC001%2CDOC003%2CDOC004');
    expect(await screen.findByRole('link', { name: /Ask across 3 papers/ })).toBeInTheDocument();
  });

  it('disables Compare and Ask with fewer than two ready papers', async () => {
    renderApp('/library?sel=DOC001');

    expect(await screen.findByRole('button', { name: 'Compare 1 selected' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Ask across 1 papers/ })).toBeDisabled();
  });

  it('announces files that fail the upload checks', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderApp('/library');

    const input = await screen.findByLabelText(/browse for PDFs to upload/);
    await user.upload(input, new File(['hello'], 'notes.txt', { type: 'text/plain' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('notes.txt is not a PDF.');
  });

  it('uploads PDFs and shows them in the table', async () => {
    vi.stubGlobal('XMLHttpRequest', FetchXhr);
    server.use(
      http.post(apiUrl('/upload'), () => {
        addDocument({
          document_id: 'DOC007',
          title: 'My new paper',
          filename: 'my-new-paper.pdf',
          pages: 12,
          status: 'processing',
          source: 'upload',
          uploaded_at: new Date().toISOString(),
        });
        return HttpResponse.json(
          [{ document_id: 'DOC007', filename: 'my-new-paper.pdf', status: 'processing' }],
          { status: 202 },
        );
      }),
    );
    const user = userEvent.setup();
    renderApp('/library');

    const input = await screen.findByLabelText(/browse for PDFs to upload/);
    await user.upload(
      input,
      new File(['%PDF-1.4'], 'my-new-paper.pdf', { type: 'application/pdf' }),
    );

    expect(await screen.findByText('My new paper')).toBeInTheDocument();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('deletes a paper after confirming in a dialog', async () => {
    const user = userEvent.setup();
    renderApp('/library');

    await user.click(
      await screen.findByRole('button', { name: 'Delete Decomposed Weight Updates' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Delete “Decomposed Weight Updates”?' });
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Delete paper' }));
    await screen.findByRole('link', { name: /Ask across 3 papers/ });
    expect(screen.queryByText('Decomposed Weight Updates')).not.toBeInTheDocument();
  });
});
