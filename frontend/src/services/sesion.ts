const TOKEN_KEY = "token";

export const guardarToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const obtenerToken = () => localStorage.getItem(TOKEN_KEY);
export const borrarToken = () => localStorage.removeItem(TOKEN_KEY);
