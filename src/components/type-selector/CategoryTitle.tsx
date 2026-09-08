
import React from 'react';

interface CategoryTitleProps {
  children: React.ReactNode;
}

export const CategoryTitle = ({ children }: CategoryTitleProps) => {
  return (
    <span className="text-slate-700 font-medium text-[13px] tracking-tight">
      {children}
    </span>
  );
};
