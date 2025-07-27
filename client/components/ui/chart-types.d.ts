// Temporary type fixes for Recharts v3 compatibility
declare module 'recharts' {
  interface TooltipProps<TValue, TName> {
    payload?: any;
    label?: any;
  }
}
