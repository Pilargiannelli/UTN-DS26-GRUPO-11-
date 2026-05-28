import { Pupila } from "./Pupila";
interface OjoProps {
  centerX: number;
  centerY: number;
  radius: number;
  mouseX: number;
  mouseY: number;
}

export function Ojo({ centerX, centerY, radius, mouseX, mouseY }: OjoProps) {
  return (
    <>
      <circle cx={centerX} cy={centerY} r={radius} fill="white" stroke="black" strokeWidth={2} />
      <Pupila mouseX={mouseX} mouseY={mouseY} eyeCenterX={centerX} eyeCenterY={centerY} radius={radius} />
    </>
  );
}