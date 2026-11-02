import type { ReactNode } from "react";

// Íconos de línea de cada especialidad (un mismo trazo para toda la grilla)
const ICONOS: Record<string, ReactNode> = {
  "Nutrición": (
    <>
      <path d="M24 15c-3-4-13-4-13 7 0 8 5 17 10 17 2 0 2-1 3-1s1 1 3 1c5 0 10-9 10-17 0-11-10-11-13-7z" />
      <path d="M24 15c0-4 2-7 5-8" />
    </>
  ),
  "Cardiología": (
    <>
      <path d="M24 41S7 31 7 19a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22z" />
      <path d="M13 25h7l3-6 4 11 3-5h5" />
    </>
  ),
  "Cirugía": (
    <>
      <path d="M38 8c2 2 2 5 0 7L23 30l-7 1 1-7L32 9c2-2 5-2 6-1z" />
      <path d="M15 33L8 40" />
    </>
  ),
  "Otorrinolaringología": (
    <>
      <path d="M16 27c0-9 3-15 10-15 5 0 9 4 9 9 0 6-6 7-6 12 0 4-3 7-7 7-3 0-5-2-5-5" />
      <path d="M22 22c0-3 3-4 5-2s0 5-2 6" />
    </>
  ),
  "Ecografías": (
    <>
      <rect x="9" y="11" width="30" height="21" rx="2.5" />
      <path d="M5 37h38l-3 4H8z" />
      <path d="M16 28l8-10 8 10z" />
    </>
  ),
  "Traumatología": (
    <path d="M15 11a4.5 4.5 0 0 0-6 5.5 4.5 4.5 0 0 0 5.5 4L27 33a4.5 4.5 0 0 0 4 5.5 4.5 4.5 0 0 0 5.5-6.5 4.5 4.5 0 0 0-5.5-3L20 16.500A4.500 4.500 0 0 0 15 11z" />
  ),
  "Odontología": (
    <path d="M24 13c-4-4-12-3-13 4-1 5 2 8 3 13 1 5 2 11 5 11 3 0 3-8 5-8s2 8 5 8c3 0 4-6 5-11 1-5 4-8 3-13-1-7-9-8-13-4z" />
  ),
  "Ortodoncia y Ortopedia": (
    <>
      <path d="M5 24h38" />
      <rect x="9" y="16" width="11" height="16" rx="3" />
      <rect x="28" y="16" width="11" height="16" rx="3" />
      <path d="M14.500 21v6M33.500 21v6" />
    </>
  ),
  "Oftalmología": (
    <>
      <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z" />
      <circle cx="24" cy="24" r="6" />
    </>
  ),
  "Psiquiatría": (
    <>
      <path d="M14 34c-4-3-6-8-5-13 1-7 7-12 15-12 8 0 14 5 14 12 0 5-3 7-6 9v7H22v-5" />
      <path d="M24 17a5.500 5.500 0 0 1 5.500 5.500A5.500 5.500 0 0 1 24 28" />
    </>
  ),
  "Ginecología": (
    <>
      <circle cx="24" cy="17" r="9" />
      <path d="M24 26v15M17 34h14" />
    </>
  ),
  "Reumatología": (
    <>
      <path d="M17 6c4 6 3 12 5 17" />
      <circle cx="24" cy="25" r="5" />
      <path d="M26 30c2 5 2 8 6 12" />
      <path d="M34 7l-6 11" />
    </>
  ),
  "Pediatría": (
    <>
      <circle cx="24" cy="26" r="15" />
      <path d="M24 11c-3-4 2-6 5-3" />
      <circle cx="18" cy="24" r="1.200" />
      <circle cx="30" cy="24" r="1.200" />
      <path d="M18 31c3 4 9 4 12 0" />
    </>
  ),
  "Fonoaudiología": <path d="M6 24h3M12 17v14M18 11v26M24 16v16M30 8v32M36 18v12M42 24h-3" />,
  "Medicina General": (
    <>
      <rect x="8" y="17" width="32" height="23" rx="3.500" />
      <path d="M18 17v-5h12v5" />
      <path d="M24 22v13M17.500 28.500h13" />
    </>
  ),
};

export function IconoEspecialidad({ nombre }: { nombre: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[nombre]}
    </svg>
  );
}
