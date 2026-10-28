// Error de regla de negocio o de titularidad que lanza un service. El
// errorHandler lo traduce a `res.status(status).json({ error: message })`, así
// los controllers solo hacen next(error) (C17: regla de negocio → service).
export class ErrorNegocio extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ErrorNegocio";
  }
}
