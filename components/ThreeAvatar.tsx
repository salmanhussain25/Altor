import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// This is a workaround for environments where tsconfig.json cannot be configured
// to include the react-three-fiber JSX namespace. This manually extends the
// JSX.IntrinsicElements interface to include the R3F components.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ThreeAvatarProps {
  isSpeaking: boolean;
  mouthShape: string;
}

const AvatarModel: React.FC<{ mouthShape: string }> = ({ mouthShape }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftEyeLidTopRef = useRef<THREE.Mesh>(null!);
  const leftEyeLidBottomRef = useRef<THREE.Mesh>(null!);
  const rightEyeLidTopRef = useRef<THREE.Mesh>(null!);
  const rightEyeLidBottomRef = useRef<THREE.Mesh>(null!);
  const leftPupilRef = useRef<THREE.Mesh>(null!);
  const rightPupilRef = useRef<THREE.Mesh>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);
  const animatedMouthProps = useRef({ openV: 0.01, openH: 0.3, curve: 0.02 });

  const mouthGeometry = useMemo(() => new THREE.PlaneGeometry(0.4, 0.1, 10, 1), []);
  
  useEffect(() => {
    if (mouthGeometry) {
      // Store original positions in userData for deformation
      mouthGeometry.userData.originalPositions = mouthGeometry.attributes.position.clone();
    }
  }, [mouthGeometry]);

  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking logic
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Blink duration
    };

    const interval = setInterval(() => {
      blink();
    }, 3000 + Math.random() * 2000); // Blink every 3-5 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Mouth shapes mapped to deformation properties
  const mouthShapes: { [key: string]: { openV: number; openH: number; curve: number } } = {
    X: { openV: 0.01, openH: 0.3, curve: 0.02 },  // Neutral
    A: { openV: 0.2, openH: 0.25, curve: 0.01 },  // "ah"
    B: { openV: 0.05, openH: 0.4, curve: 0.05 },  // "ee" (smile)
    C: { openV: 0.15, openH: 0.15, curve: -0.05 }, // "oh" (puckered)
    D: { openV: 0.08, openH: 0.35, curve: 0.03 }, // "d"
    E: { openV: 0.15, openH: 0.4, curve: 0.04 },  // "eh"
    F: { openV: 0.05, openH: 0.35, curve: 0.01 },  // "f"
    G: { openV: 0.12, openH: 0.1, curve: -0.05 },   // "oo"
    H: { openV: 0.07, openH: 0.25, curve: 0.02 }, // "r"
  };

  useFrame((state, delta) => {
    // Smooth eye blinking animation
    const blinkSpeed = 20 * delta;
    const targetLidScale = isBlinking ? 1 : 0.01;
    [leftEyeLidTopRef, leftEyeLidBottomRef, rightEyeLidTopRef, rightEyeLidBottomRef].forEach(ref => {
      if (ref.current) {
        ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetLidScale, blinkSpeed);
      }
    });
    
    // Character floating animation
    if(groupRef.current) {
        groupRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }

    // Head and pupil tracking mouse
    if (headRef.current && leftPupilRef.current && rightPupilRef.current) {
        const pointer = state.pointer;

        // Head tilt towards pointer
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, pointer.x * 0.4, 0.05);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -pointer.y * 0.4, 0.05);

        // Pupil movement
        const pupilX = pointer.x * 0.04;
        const pupilY = -pointer.y * 0.04; // Inverted Y for natural look
        leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, pupilX, 0.1);
        leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, pupilY, 0.1);
        rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, pupilX, 0.1);
        rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, pupilY, 0.1);
    }
    
    // Mouth animation
    if (mouthRef.current && mouthRef.current.geometry.userData.originalPositions) {
      const targetShape = mouthShapes[mouthShape] || mouthShapes['X'];
      const lerpFactor = 15 * delta;

      // Animate properties towards target
      animatedMouthProps.current.openV = THREE.MathUtils.lerp(animatedMouthProps.current.openV, targetShape.openV, lerpFactor);
      animatedMouthProps.current.openH = THREE.MathUtils.lerp(animatedMouthProps.current.openH, targetShape.openH, lerpFactor);
      animatedMouthProps.current.curve = THREE.MathUtils.lerp(animatedMouthProps.current.curve, targetShape.curve, lerpFactor);
      
      const { openV, openH, curve } = animatedMouthProps.current;
      
      const positions = mouthRef.current.geometry.attributes.position;
      const originalPositions = mouthRef.current.geometry.userData.originalPositions;
      const { width } = mouthGeometry.parameters;

      for (let i = 0; i < positions.count; i++) {
        const originalX = originalPositions.getX(i);
        const originalY = originalPositions.getY(i);
        
        // Horizontal stretch
        const newX = originalX * (openH / width);

        // Vertical opening and curvature
        const xRatio = originalX / (width / 2); // from -1 to 1
        const yCurveOffset = curve * (xRatio * xRatio);
        const sign = Math.sign(originalY); // +1 for top vertices, -1 for bottom
        const newY = sign * (openV / 2) + yCurveOffset;

        // Apply 3D curvature to the mouth, making it bulge out in the center
        const zCurve = (1 - xRatio * xRatio) * openV * 0.5;

        positions.setXYZ(i, newX, newY, zCurve);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} scale={0.85}>
        {/* Body */}
        <mesh position-y={-1.2} castShadow>
            <cylinderGeometry args={[0.8, 1.1, 1.8, 16]} />
            <meshStandardMaterial color="#4a5568" roughness={0.7} />
        </mesh>
        {/* Neck */}
        <mesh position-y={-0.35} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
            <meshStandardMaterial color="#c7a78b" />
        </mesh>
            
        <group ref={headRef}>
            {/* Head */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#e7bc91" roughness={0.6}/>
            </mesh>

            {/* Eyes */}
            <group position={[-0.35, 0.15, 0.9]}>
                <mesh> {/* Eyeball */}
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="white" roughness={0.1} />
                </mesh>
                <mesh ref={leftPupilRef} position={[0, 0, 0.14]}> {/* Pupil */}
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshBasicMaterial color="#3a3a3a" />
                </mesh>
                <mesh ref={leftEyeLidTopRef} position={[0, 0.15, 0.02]} rotation-x={-0.2}>
                    <planeGeometry args={[0.35, 0.3]} />
                    <meshStandardMaterial color="#e7bc91" side={THREE.DoubleSide} />
                </mesh>
                <mesh ref={leftEyeLidBottomRef} position={[0, -0.15, 0.02]} rotation-x={0.2}>
                    <planeGeometry args={[0.35, 0.3]} />
                    <meshStandardMaterial color="#e7bc91" side={THREE.DoubleSide} />
                </mesh>
            </group>
            <group position={[0.35, 0.15, 0.9]}>
                <mesh>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="white" roughness={0.1} />
                </mesh>
                <mesh ref={rightPupilRef} position={[0, 0, 0.14]}>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshBasicMaterial color="#3a3a3a" />
                </mesh>
                <mesh ref={rightEyeLidTopRef} position={[0, 0.15, 0.02]} rotation-x={-0.2}>
                    <planeGeometry args={[0.35, 0.3]} />
                    <meshStandardMaterial color="#e7bc91" side={THREE.DoubleSide} />
                </mesh>
                <mesh ref={rightEyeLidBottomRef} position={[0, -0.15, 0.02]} rotation-x={0.2}>
                    <planeGeometry args={[0.35, 0.3]} />
                    <meshStandardMaterial color="#e7bc91" side={THREE.DoubleSide} />
                </mesh>
            </group>
            
            {/* Hair */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
                <meshStandardMaterial color="#3a3a3a" roughness={0.8}/>
            </mesh>
            
            {/* Mouth */}
            <mesh ref={mouthRef} geometry={mouthGeometry} position={[0, -0.4, 0.92]}>
                <meshBasicMaterial color="#5c2c2c" side={THREE.DoubleSide} />
            </mesh>
        </group>
    </group>
  );
};

export const ThreeAvatar: React.FC<ThreeAvatarProps> = ({ isSpeaking, mouthShape }) => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.6} />
        <hemisphereLight groundColor="black" intensity={0.5}/>
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, 5]} intensity={0.5} color="#cc99ff" /> {/* Rim light */}
        <spotLight position={[0, 10, 0]} intensity={0.3} />
        <AvatarModel mouthShape={isSpeaking ? mouthShape : 'X'} />
    </Canvas>
  );
};