/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentProps } from 'react';
import React from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  id?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
}

export default function Input({ label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-zinc-400 font-medium">
        {label}
      </label>
      <input
        id={id}
        className="bg-gray-800 border border-purple-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-shadow duration-200"
        {...props}
      />
    </div>
  );
}
