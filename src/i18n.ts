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
      already_brew: "I already have brew!",
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
      already_brew: "J'ai déjà brew !",
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
