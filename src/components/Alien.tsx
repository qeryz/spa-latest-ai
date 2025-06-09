import { useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ALIEN_ANIMATION_MAP } from "./utils";

export const Alien = ({ action = "idle" }: { action: string }) => {
  const glbPath = ALIEN_ANIMATION_MAP[action] || ALIEN_ANIMATION_MAP["idle"];
  const { scene, animations } = useGLTF(glbPath);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (!actions) return;
    // Play the first available animation
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.reset().play();
    }
  }, [actions, glbPath]);

  return <primitive object={scene} rotation={[0, -Math.PI / 2.1, 0]} />;
};
