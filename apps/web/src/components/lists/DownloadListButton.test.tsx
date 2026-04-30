import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../api/http';
import { downloadList } from '../../api/listsApi';
import { i18n } from '../../i18n/i18n';
import { starterList } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { triggerBlobDownload } from '../../utils/download';
import { DownloadListButton } from './DownloadListButton';

vi.mock('../../api/listsApi', () => ({
  downloadList: vi.fn(),
}));

vi.mock('../../utils/download', async () => {
  const actual = await vi.importActual<typeof import('../../utils/download')>(
    '../../utils/download',
  );

  return {
    ...actual,
    triggerBlobDownload: vi.fn(),
  };
});

describe('DownloadListButton', () => {
  beforeEach(() => {
    vi.mocked(downloadList).mockResolvedValue(
      new Blob(['{"version":1}'], { type: 'application/json' }),
    );
  });

  it('calls the download API and triggers a browser download', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DownloadListButton listId={starterList.id} listName={starterList.name} />,
    );

    await user.click(screen.getByRole('button', { name: 'Download JSON' }));

    expect(downloadList).toHaveBeenCalledWith(starterList.id);
    expect(triggerBlobDownload).toHaveBeenCalledWith(
      expect.any(Blob),
      'starter-team.json',
    );
  });

  it('shows loading text while the file is downloading', async () => {
    const user = userEvent.setup();
    vi.mocked(downloadList).mockReturnValue(new Promise(() => undefined));

    renderWithProviders(
      <DownloadListButton listId={starterList.id} listName={starterList.name} />,
    );

    await user.click(screen.getByRole('button', { name: 'Download JSON' }));

    expect(screen.getByRole('button', { name: 'Downloading...' })).toBeDisabled();
  });

  it('renders an API error', async () => {
    const user = userEvent.setup();
    vi.mocked(downloadList).mockRejectedValue(
      new ApiError('Download failed.', 500, 'INTERNAL_ERROR', '/api/lists/1/download'),
    );

    renderWithProviders(
      <DownloadListButton listId={starterList.id} listName={starterList.name} />,
    );

    await user.click(screen.getByRole('button', { name: 'Download JSON' }));

    expect(await screen.findByText('Download failed.')).toBeInTheDocument();
  });

  it('renders Russian button text', () => {
    localStorage.setItem('pokemonCollectionsLanguage', 'ru');
    void i18n.changeLanguage('ru');

    renderWithProviders(
      <DownloadListButton listId={starterList.id} listName={starterList.name} />,
    );

    expect(
      screen.getByRole('button', { name: i18n.t('downloadList.download') }),
    ).toBeInTheDocument();
  });
});
