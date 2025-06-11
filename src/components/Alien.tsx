import { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ALIEN_ANIMATION_MAP } from "../utils/utils";

const Alien = ({ action = "idle" }: { action: string }) => {
  const [debouncedAction, setDebouncedAction] = useState(action);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (action === "idle" && debouncedAction !== "idle") {
      // Debounce switching to idle
      timeoutRef.current = setTimeout(() => {
        setDebouncedAction("idle");
      }, 1500);
    } else if (action !== debouncedAction) {
      // Immediate switch to other actions
      setDebouncedAction(action);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [action, debouncedAction]);

  const glbPath =
    ALIEN_ANIMATION_MAP[debouncedAction] || ALIEN_ANIMATION_MAP["idle"];
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

  return (
    <primitive
      object={scene}
      rotation={[
        debouncedAction === "talk" ? -0.2 : 0,
        -Math.PI / (debouncedAction === "talk" ? 2.3 : 2),
        0,
      ]}
    />
  );
};

export default Alien;
