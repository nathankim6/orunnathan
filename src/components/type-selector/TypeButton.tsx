import React from 'react';
import { Lock, Check } from "lucide-react";
import { QuestionType } from "@/types/question";

interface TypeButtonProps {
  type: QuestionType;
  isSelected: boolean;
  hasAccess: boolean;
  onClick: () => void;
  logos: string[];
}

export const TypeButton = ({ type, isSelected, hasAccess, onClick, logos }: TypeButtonProps) => {
  return (
    <button
      key={type.id}
      onClick={onClick}
      disabled={!hasAccess}
      className={`
        relative group flex items-center w-full gap-2.5 pl-3 pr-2.5 py-[7px] rounded-[5px] text-left
        transition-[background,box-shadow,border-color] duration-150 ease-out
        border
        ${isSelected
          ? 'bg-slate-900 border-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(15,23,42,0.18)]'
          : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
        }
        ${!hasAccess
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
    >
      {/* Left accent rail (selected only) */}
      <span
        aria-hidden
        className={`absolute left-0 top-1 bottom-1 w-[2px] rounded-r-sm bg-indigo-400 transition-opacity duration-150 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Custom checkbox */}
      <span
        className={`
          flex items-center justify-center flex-shrink-0 w-[14px] h-[14px] rounded-[3px] border
          transition-colors duration-150
          ${isSelected
            ? 'bg-indigo-400 border-indigo-300'
            : 'bg-white border-slate-300 group-hover:border-slate-400'
          }
        `}
      >
        <Check
          className={`w-[10px] h-[10px] text-slate-900 transition-opacity duration-150 ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
          strokeWidth={3.5}
        />
      </span>

      {/* Logos */}
      {logos.length > 0 && (
        <div className="flex -space-x-1 flex-shrink-0">
          {logos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Logo ${index + 1}`}
              className={`w-[15px] h-[15px] object-contain rounded-full bg-white ring-1 ${
                isSelected ? 'ring-slate-700' : 'ring-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Type name */}
      <span className={`
        flex-1 text-[12px] tracking-[-0.005em] leading-tight
        transition-colors duration-150
        ${isSelected
          ? 'text-slate-50 font-medium'
          : 'text-slate-700 font-medium group-hover:text-slate-900'
        }
        ${!hasAccess ? 'text-slate-300' : ''}
      `}>
        {type.name}
        {type.isNew && (
          <span className={`ml-1.5 inline-flex items-center px-1 py-px text-[8px] font-bold tracking-[0.12em] rounded-[2px] leading-none font-mono ${
            isSelected ? 'text-indigo-300' : 'text-indigo-600'
          }`}>
            NEW
          </span>
        )}
      </span>

      {!hasAccess && <Lock className="w-3 h-3 text-slate-300 flex-shrink-0" />}
    </button>
  );
};
