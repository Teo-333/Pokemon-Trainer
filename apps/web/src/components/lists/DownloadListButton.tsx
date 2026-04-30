import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/http';
import { downloadList } from '../../api/listsApi';
import { buildJsonFilename, triggerBlobDownload } from '../../utils/download';

type DownloadListButtonProps = {
  listId: string;
  listName: string;
};

export function DownloadListButton({ listId, listName }: DownloadListButtonProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDownload() {
    setStatus('loading');
    setErrorMessage('');

    try {
      const blob = await downloadList(listId);
      triggerBlobDownload(blob, buildJsonFilename(listName));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : t('downloadList.error'),
      );
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div>
      <button
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
        disabled={status === 'loading'}
        onClick={handleDownload}
        type="button"
      >
        {status === 'loading'
          ? t('downloadList.downloading')
          : t('downloadList.download')}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
      ) : null}
    </div>
  );
}
