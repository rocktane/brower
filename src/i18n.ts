import { createI18n } from "vue-i18n";

// Messages de traduction
const messages = {
  en: {
    _locale: "en",
    og: {
      title: "brower ~ Get Mac apps automatically (like Ninite for Mac)",
      url: "https://brower.yohan.one/",
      type: "website",
      description: "One command to get all your apps.",
      image: "https://brower.yohan.one/src/assets/icons/share.png",
      logo: "https://brower.yohan.one/src/assets/icons/logo.png",
    },
    message: {
      hello: "hello world",
      subtitle: "Install all these apps in one go",
      last_word: "A curated selection of apps by",
      loading: "Loading apps...",
      error: "Error loading apps",
      footer: {
        homebrew: {
          before: "So I decided to make my own version using the great",
          after: "package manager.",
        },
        idea: {
          before: "I have been using",
          after: "for years, but it hasn't been updated in quite some time.",
        },
        suggestion: "A suggestion or a bug report? Contact me on twitter",
        made: "Made with ♥ by",
        also_check: "Found me",
        thanks: {
          before: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          here: "here",
          and: "but also",
          there: "there",
        },
      },
      at_least_one_app: "At least one app must be selected",
      install: "Install",
      last_step: "Last step",
      install_macos:
        "On macOS → <kbd>⌘</kbd> + <kbd>Space</kbd> then type <code>terminal</code> and <kbd>⮐</kbd>",
      instructions:
        "Copy then paste the following command in the terminal and press <kbd>⮐</kbd> to make magic happen",
      copy: "Copy the command",
      copied: "Command copied!",
      already_brew: "I already have brew!",
      full_command: "Show the full command",
      // Comments injected into the generated shell script itself.
      // Keep them short: they are read in a terminal-width textarea.
      script: {
        macos: "Stop right away if macOS is too old for Homebrew",
        disk: "Stop right away if less than 10 GB are free",
        xcode:
          "Homebrew needs Apple's Command Line Tools: install them if missing",
        brew: "Install Homebrew, unless it is already there",
        path: "Make the brew command available (Apple Silicon or Intel)",
        bundle:
          "Install everything below in one go (already-installed apps are skipped)",
        // Messages printed by the script while it runs.
        err_macos: "❌ macOS 11.0+ required",
        err_disk: "❌ Insufficient disk space (<10 GB)",
        log_xcode: "📦 Installing Xcode Command Line Tools...",
        prompt_xcode: "⏳ Press Enter once the installation completes... ",
      },
      warnings: {
        interactive:
          "📝 The installation will ask you to: <strong>1.</strong> Press Enter to confirm <strong>2.</strong> Enter your admin password (sudo)",
        gatekeeper:
          "🔒 If an app is blocked by Gatekeeper, go to System Preferences > Security and click \"Open Anyway\".",
      },
      legend: {
        star: "Essentials",
        new: "Latest arrivals",
        heart: "Favorites",
      },
      categories: {
        internet: "Internet",
        messaging: "Messaging",
        productivity: "Productivity",
        tools: "Tools",
        multimedia: "Multimedia",
        developer: "Developer",
        security: "Security",
      },
    },
  },
  fr: {
    _locale: "fr",
    message: {
      subtitle: "Installer toutes ces apps en une fois",
      last_word: "Une sélection d'applications par",
      loading: "Chargement des applications...",
      error: "Erreur lors du chargement des applications",
      footer: {
        homebrew: {
          before: "J'ai donc décidé de faire ma propre version en utilisant",
          after: "le fameux gestionnaire de paquets.",
        },
        idea: {
          before: "J'ai longtemps utilisé",
          after: ", mais il n'a pas été mis à jour depuis quelques temps.",
        },
        suggestion:
          "Une suggestion ou un bug à rapporter ? Contactez-moi sur twitter",
        made: "Fait avec ♥ par",
        also_check: "Trouvez-moi aussi",
        thanks: {
          before: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          here: "ici",
          and: "et",
          there: "là",
        },
      },
      at_least_one_app: "Il faut au moins sélectionner une application",
      install: "Installer",
      last_step: "Dernière étape",
      install_macos:
        "Sur macOS → <kbd>⌘</kbd> + <kbd>Espace</kbd> puis tapez <code>terminal</code> et <kbd>⮐</kbd>",
      instructions:
        "Copiez puis collez le code suivant dans le terminal et appuyez sur <kbd>⮐</kbd> pour que la magie opère",
      copy: "Copier la commande",
      copied: "Commande copiée !",
      already_brew: "J'ai déjà brew !",
      full_command: "Voir la commande complète",
      // Commentaires injectés dans le script shell généré.
      // À garder courts : ils sont lus dans un textarea étroit.
      script: {
        macos: "On s'arrête tout de suite si macOS est trop ancien pour Homebrew",
        disk: "On s'arrête tout de suite s'il reste moins de 10 Go",
        xcode:
          "Homebrew a besoin des Command Line Tools d'Apple : on les installe si besoin",
        brew: "Installe Homebrew, sauf s'il est déjà là",
        path: "Rend la commande brew accessible (Apple Silicon ou Intel)",
        bundle:
          "Installe tout ce qui suit d'un coup (les apps déjà présentes sont ignorées)",
        // Messages affichés par le script pendant son exécution.
        err_macos: "❌ macOS 11.0+ requis",
        err_disk: "❌ Espace disque insuffisant (moins de 10 Go)",
        log_xcode: "📦 Installation des Xcode Command Line Tools...",
        prompt_xcode: "⏳ Appuyez sur Entrée une fois l'installation terminée... ",
      },
      warnings: {
        interactive:
          "📝 L'installation vous demandera de : <strong>1.</strong> Appuyer sur Entrée pour confirmer <strong>2.</strong> Entrer votre mot de passe administrateur (sudo)",
        gatekeeper:
          "🔒 Si une app est bloquée par Gatekeeper, allez dans Préférences Système > Sécurité et cliquez sur « Ouvrir quand même ».",
      },
      legend: {
        star: "Incontournables",
        new: "Dernières arrivées",
        heart: "Coups de cœur",
      },
      categories: {
        internet: "Internet",
        messaging: "Messagerie",
        productivity: "Productivité",
        tools: "Outils",
        multimedia: "Multimédia",
        developer: "Développeur",
        security: "Sécurité",
      },
    },
  },
};

// Configuration de vue-i18n
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "fr",
  messages,
});

export default i18n;
