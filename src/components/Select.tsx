/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentProps } from 'react';
import React from 'react';

interface SelectProps extends ComponentProps<'select'> {
  label: string;
  id?: string;
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select({ label, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-zinc-400 font-medium">
        {label}
      </label>
      <select
        id={id}
        className="bg-gray-800 border border-purple-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-shadow duration-200 appearance-none bg-chevron-down bg-no-repeat bg-right pr-8"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
