import { ObraSocialModel } from "../generated/prisma/models";

// El schema.prisma es la única fuente de verdad para la forma de ObraSocial.
// Acá sólo le ponemos el nombre corto que usan services y controllers.
export type ObraSocial = ObraSocialModel;