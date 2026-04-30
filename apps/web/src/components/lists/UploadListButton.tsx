import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListFile } from '../../types/list';
import { ListFileError, parseListFile } from '../../utils/listFile';

type UploadListButtonProps = {
  onUpload: (listFile: ListFile) => Promise<void>;
};

export function UploadListButton({ onUpload }: UploadListButtonProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const listFile = await parseListFile(file);
      await onUpload(listFile);
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setStatus('idle');
    }
  }

  function resolveErrorMessage(error: unknown) {
    if (error instanceof ListFileError) {
      return t(`uploadList.errors.${error.code}`);
    }

    return error instanceof Error ? error.message : t('uploadList.errors.UNKNOWN');
  }

  return (
    <div>
      <input
        accept="application/json,.json"
        className="sr-only"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <button
        className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        disabled={status === 'loading'}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {status === 'loading' ? t('uploadList.uploading') : t('uploadList.upload')}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
      ) : null}
    </div>
  );
}
