/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentProps } from 'react';
import React from 'react';

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function Textarea({ label, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-zinc-400 font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className="bg-gray-800 border border-purple-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-shadow duration-200 min-h-[120px] resize-y"
        {...props}
      />
    </div>
  );
}
