// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
