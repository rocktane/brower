// Étendre l'interface HTMLTextAreaElement pour inclure __resizeCleanup__
declare global {
  interface HTMLTextAreaElement {
    __resizeCleanup__?: () => void;
  }
}

const autoSize = {
  mounted(ta: HTMLTextAreaElement) {
    const resize = () => {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight + 2}px`;
    };

    // Ajustement initial
    resize();

    // Ajustement lors du redimensionnement de la fenêtre
    window.addEventListener("resize", resize);

    // Nettoyage lors du démontage
    ta.__resizeCleanup__ = () => {
      window.removeEventListener("resize", resize);
    };
  },
  unmounted(ta: HTMLTextAreaElement) {
    if (ta.__resizeCleanup__) {
      ta.__resizeCleanup__();
    }
  },
};

export default autoSize;
