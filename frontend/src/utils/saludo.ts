// "Buenos días", "Buenas tardes" o "Buenas noches" según la hora del día
export function saludoSegunHora(fecha = new Date()) {
  const hora = fecha.getHours();
  if (hora >= 6 && hora < 13) return "Buenos días";
  if (hora >= 13 && hora < 20) return "Buenas tardes";
  return "Buenas noches";
}
