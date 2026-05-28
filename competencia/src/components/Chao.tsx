import { useState, useRef, useEffect } from 'react';
import { Ojo } from './Ojo.tsx';
import chao from '../img/chao.png';
import Image from 'react-bootstrap/Image';
import '../App.css'

export function Chao() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState({ width: 500, height: 500 });
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const updateBox = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        setBox({ width: rect.width, height: rect.height });
      }
    };
    updateBox();
    window.addEventListener("resize", updateBox);
    return () => window.removeEventListener("resize", updateBox);
  }, []);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = box.width / rect.width;
    const scaleY = box.height / rect.height;
    setMouse({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
  };
  // Coordenadas proporcionales dentro del área visible
  const eyeLeftX = box.width * 0.38;
  const eyeRightX = box.width * 0.62;
  const eyeY = box.height * 0.50;
  const eyeRadius = box.width * 0.075;
  return (
    <div onMouseMove={handleMouseMove} className='chao-container'>
      <div className='chao-wrapper'>
        <Image ref={imgRef} src={chao} alt="Chao" fluid className='chao-img' />
        <svg width={`${box.width}`} height={`${box.height}`} className='chao-ojos'>
          <Ojo centerX={eyeLeftX} centerY={eyeY} radius={eyeRadius} mouseX={mouse.x} mouseY={mouse.y} />
          <Ojo centerX={eyeRightX} centerY={eyeY} radius={eyeRadius} mouseX={mouse.x} mouseY={mouse.y} />
        </svg>
      </div>
    </div>
  );
}
