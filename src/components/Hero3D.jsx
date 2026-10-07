import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Lienzo 3D interactivo con Three.js que renderiza una red nodal poligonal
 * en dark mode corporativo y responde al movimiento del cursor del ratón.
 * 
 * Cumple rigurosamente con el Principio III de la Constitución:
 * Control estricto del ciclo de vida WebGL con renderer.dispose(), geometrías,
 * materiales y eliminación de event listeners en el desmontaje.
 */
export function Hero3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Configuración de dimensiones
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 2. Escena, Cámara y Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b11, 0.002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x080b11, 0); // Fondo transparente para acoplarse al diseño
    container.appendChild(renderer.domElement);

    // 3. Creación de la Red Nodal Poligonal (Icosaedro complejo)
    const group = new THREE.Group();
    scene.add(group);

    // Esfera exterior de nodos conectores
    const geometry = new THREE.IcosahedronGeometry(110, 2);
    
    // Malla alámbrica (Líneas y aristas)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xbe123c, // Rose 700 corporativo
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    group.add(wireframeMesh);

    // Nodos en los vértices (Puntos de luz)
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xf43f5e, // Rose 500
      size: 4,
      transparent: true,
      opacity: 0.85,
    });
    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    group.add(pointsMesh);

    // Núcleo geométrico interior de seguridad
    const innerGeometry = new THREE.OctahedronGeometry(55, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6, // Azul corporativo de contraste
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    group.add(innerMesh);

    // 4. Interacción del ratón
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = width / 2;
    const windowHalfY = height / 2;

    const onPointerMove = (event) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // 5. Redimensionamiento responsivo
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    // 6. Loop de Animación
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Suavizado cinemático
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotación autónoma combinada con desplazamiento del cursor
      group.rotation.x += 0.0015;
      group.rotation.y += 0.002;
      group.rotation.y += targetX * 0.0002;
      group.rotation.x += targetY * 0.0002;

      innerMesh.rotation.x -= 0.002;
      innerMesh.rotation.y -= 0.003;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Limpieza estricta del ciclo de vida WebGL (Principio III)
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);

      // Liberar geometrías
      geometry.dispose();
      innerGeometry.dispose();

      // Liberar materiales
      wireframeMaterial.dispose();
      pointsMaterial.dispose();
      innerMaterial.dispose();

      // Liberar renderer y DOM
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
