import React from "react";

export const useDateInput = (maxLength: number) => {
  return {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Bloquea letras, espacios y caracteres especiales
      e.target.value = e.target.value.replace(/\D/g, "");
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Rellena con ceros a la izquierda según el tamaño máximo indicado
      if (val) e.target.value = val.padStart(maxLength, "0");
    }
  };
};