import { useEffect } from "react";

export default function SparkleCursor() {
  useEffect(() => {
    const createSparkle = (e) => {
      const sparkle = document.createElement("div");

      sparkle.style.position = "fixed";
      sparkle.style.left = e.clientX + "px";
      sparkle.style.top = e.clientY + "px";
      sparkle.style.width = "6px";
      sparkle.style.height = "6px";
      sparkle.style.borderRadius = "50%";
      sparkle.style.background = "#c77dff";
      sparkle.style.pointerEvents = "none";
      sparkle.style.zIndex = 999;
      sparkle.style.boxShadow = "0 0 10px #c77dff";

      document.body.appendChild(sparkle);

      setTimeout(() => {
        sparkle.remove();
      }, 500);
    };

    window.addEventListener("mousemove", createSparkle);

    return () => {
      window.removeEventListener("mousemove", createSparkle);
    };
  }, []);

  return null;
}