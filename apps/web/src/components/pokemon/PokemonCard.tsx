import { useTranslation } from 'react-i18next';
import { Pokemon } from '../../types/pokemon';

type PokemonCardProps = {
  pokemon: Pokemon;
  isSelected: boolean;
  onToggle: (pokemon: Pokemon) => void;
};

export function PokemonCard({ pokemon, isSelected, onToggle }: PokemonCardProps) {
  const { t } = useTranslation();

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
          {pokemon.spriteUrl ? (
            <img alt="" className="h-14 w-14" src={pokemon.spriteUrl} />
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">#{pokemon.id}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold capitalize">{pokemon.name}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('createList.weightValue', { count: pokemon.weight })}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {pokemon.types.join(', ')}
          </p>
        </div>
      </div>
      <button
        className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        onClick={() => onToggle(pokemon)}
        type="button"
      >
        {isSelected ? t('createList.unselect') : t('createList.select')}
      </button>
    </article>
  );
}
