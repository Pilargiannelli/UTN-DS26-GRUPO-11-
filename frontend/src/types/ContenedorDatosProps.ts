interface ItemDato {
  label: string;
  valor: string | React.ReactNode;
}

interface ContenedorDatosProps {
  datos?: ItemDato[];
  children?: React.ReactNode;
}

export type { ItemDato, ContenedorDatosProps };