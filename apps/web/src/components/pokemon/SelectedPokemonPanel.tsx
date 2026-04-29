import { useTranslation } from 'react-i18next';
import { Pokemon } from '../../types/pokemon';

type SelectedPokemonPanelProps = {
  selectedPokemon: Pokemon[];
  onRemove: (pokemonId: number) => void;
};

export function SelectedPokemonPanel({
  selectedPokemon,
  onRemove,
}: SelectedPokemonPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">{t('createList.selectedTitle')}</h2>
      {selectedPokemon.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {t('createList.selectedEmpty')}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {selectedPokemon.map((pokemon) => (
            <li
              className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800"
              key={pokemon.id}
            >
              <span className="font-medium capitalize">{pokemon.name}</span>
              <button
                className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                onClick={() => onRemove(pokemon.id)}
                type="button"
              >
                {t('createList.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
