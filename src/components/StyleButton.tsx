/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentProps } from 'react';

interface StyleButtonProps extends ComponentProps<'button'> {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  key?: string;
  onClick?: () => void;
}

export default function StyleButton({ number, title, description, isActive, ...props }: StyleButtonProps) {
  return (
    <button
      className={`text-left p-4 border rounded-lg transition-all duration-300 flex items-start gap-4 ${isActive ? 'bg-yellow-900/50 border-yellow-500 ring-2 ring-yellow-500' : 'bg-gray-800/50 border-purple-700 hover:border-purple-500'}`}
      {...props}
    >
      <div className={`text-xl font-bold ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
        {number}️⃣
      </div>
      <div>
        <h3 className={`font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
        <p className="text-sm text-zinc-400 mt-1">{description}</p>
      </div>
    </button>
  );
}
