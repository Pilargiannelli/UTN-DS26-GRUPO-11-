export function useFotoPerfil(foto?: string) {
  if (foto) {
    return {
      className: "user-card__foto user-card__foto--con-imagen",
      style: { backgroundImage: `url(${foto})` },
    };
  }
  return {
    className: "user-card__foto user-card__foto--sin-imagen",
    style: {},
  };
}
