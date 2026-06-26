import { type ChangeEvent } from "react";

export const useMayus = () => {
    const handleMayus = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
  };
  return handleMayus;
}