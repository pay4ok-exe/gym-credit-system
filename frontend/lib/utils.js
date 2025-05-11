import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address) {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function formatTokenBalance(balance) {
  if (!balance) return "0.00"
  return parseFloat(balance).toFixed(2)
}