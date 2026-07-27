// Étendre l'interface HTMLTextAreaElement pour inclure __resizeCleanup__
declare global {
  interface HTMLTextAreaElement {
    __resizeCleanup__?: () => void;
  }
}

const resize = (ta: HTMLTextAreaElement) => {
  ta.style.height = "auto";
  ta.style.height = `${ta.scrollHeight + 2}px`;
};

const autoSize = {
  mounted(ta: HTMLTextAreaElement) {
    const onResize = () => resize(ta);

    // Ajustement initial
    onResize();

    // Ajustement lors du redimensionnement de la fenêtre
    window.addEventListener("resize", onResize);

    // Nettoyage lors du démontage
    ta.__resizeCleanup__ = () => {
      window.removeEventListener("resize", onResize);
    };
  },
  // Le contenu change quand on bascule entre commande complète et simplifiée
  updated(ta: HTMLTextAreaElement) {
    resize(ta);
  },
  unmounted(ta: HTMLTextAreaElement) {
    if (ta.__resizeCleanup__) {
      ta.__resizeCleanup__();
    }
  },
};

export default autoSize;
