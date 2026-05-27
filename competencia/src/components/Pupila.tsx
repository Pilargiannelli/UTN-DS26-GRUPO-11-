interface PupilaProps {
  mouseX: number;
  mouseY: number;
  eyeCenterX: number;
  eyeCenterY: number;
  radius: number;
}

export function Pupila({ mouseX, mouseY, eyeCenterX, eyeCenterY, radius }: PupilaProps) {
  // Vector desde el centro del ojo hacia el cursor
  const dx = mouseX - eyeCenterX;
  const dy = mouseY - eyeCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = radius * 0.4;
  const scale = dist > maxDist ? maxDist / dist : 1;
  const newX = eyeCenterX + dx * scale;
  const newY = eyeCenterY + dy * scale;
  return <circle cx={newX} cy={newY} r={radius * 0.25} fill="black" />;
}