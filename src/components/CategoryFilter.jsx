import React from 'react';
import { Layers, Briefcase, Scale, Users } from 'lucide-react';

export function CategoryFilter({ activeCategory, onSelectCategory, counts }) {
  const categories = [
    { id: 'Todas', label: 'Todas', icon: Layers },
    { id: 'Corporativo', label: 'Corporativo', icon: Briefcase },
    { id: 'Litigio', label: 'Litigio', icon: Scale },
    { id: 'Laboral', label: 'Laboral', icon: Users },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#101626] border border-slate-800 rounded-2xl w-fit">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        const count = counts?.[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isActive
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-rose-800/80 text-rose-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
