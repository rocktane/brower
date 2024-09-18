import { createI18n } from "vue-i18n";

// Messages de traduction
const messages = {
  en: {
    message: {
      hello: "hello world",
      subtitle: "Install all these apps in one go",
      last_word: "A curated selection of apps by",
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
      descriptions: {
        coteditor: "CotEditor is a lightweight text editor for macOS.",
        iina: "IINA is a modern video player for macOS.",
        visualstudiocode:
          "Visual Studio Code is a free and open-source code editor developed by Microsoft.",
        warp: "Warp is a modern terminal emulator with an integrated AI.",
        zed: "Zed is a lightweight text editor for macOS.",
        arc: "Arc is an alternative web browser.",
        brave: "Brave is a privacy-focused web browser.",
        firefox: "Firefox is a free and open-source web browser.",
        googlechrome:
          "Google Chrome is a free web browser developed by Google.",
        orion: "Orion is an alternative web browser, extensions included.",
        zen: "Zen is a web browser aimed at privacy.",
        discord:
          "Discord is a free voice and text chat app for gamers and communities.",
        beeper: "Beeper is a free and open-source messaging app for macOS.",
        ferdium: "Ferdium is a free and open-source messaging app for macOS.",
        signal: "Signal is a free and open-source secure messaging app.",
        slack: "Slack is a free and open-source messaging app for teams.",
        telegram:
          "Telegram is a free and open-source messaging app focused on speed and security.",
        whatsapp: "WhatsApp is a free and open-source messaging app.",
        sonos: "Sonos is a smart home multimedia system.",
        vlc: "VLC is a free and open-source media player and streamer.",
        alfred: "Alfred is a productivity app for macOS.",
        bitwarden: "Bitwarden is a free and open-source password manager.",
        figma: "Figma is a vector graphics editor for macOS.",
        googledrive:
          "Google Drive is a free and open-source cloud storage service.",
        itsycal: "Itsycal is a calendar app for macOS.",
        notion: "Notion is a free and open-source productivity app.",
        obsidian: "Obsidian is a free and open-source note-taking app.",
        raycast:
          "Raycast is a free and open-source app that makes it easy to control your tools.",
        rectangle:
          "Rectangle is a free and open-source app for managing your windows.",
        setapp:
          "Setapp is a free and open-source app that helps you manage your 2FA.",
        enteauth: "Ente is a two-factor authentication app.",
        aldente: "AlDente is a battery manager for macOS.",
        alttab: "Alt-Tab is a macOS application switcher.",
        balenaetcher:
          "BalenaEtcher is a tool for flashing SD cards and USB keys.",
        battery: "Battery is an application to monitor the battery status.",
        caffeine:
          "Caffeine is an application to prevent the Mac from going to sleep.",
        coconutbattery:
          "CoconutBattery is an application to monitor the battery status.",
        ice: "ICE allows you to hide icons in the menu bar.",
        latest:
          "Latest allows you to view the latest updates of an application.",
        lulu: "LuLu is an open-source firewall for macOS.",
        maccy: "Maccy is a clipboard manager for macOS.",
        scrollreverser:
          "Scroll Reverser is an application to reverse the scrolling direction but not the trackpad.",
        shottr: "Shottr is a fast screenshot application.",
        stats: "Stats is an application to monitor system performance.",
        theunarchiver: "The Unarchiver is a file decompression tool.",
        transmission: "Transmission is a lightweight BitTorrent client.",
      },
    },
  },
  fr: {
    message: {
      subtitle: "Installer toutes ces apps en une fois",
      last_word: "Une sélection d'applications par",
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
      descriptions: {
        arc: "Arc est un navigateur web moderne.",
        bruno: "Bruno est une alternative à Postman.",
        coteditor: "CotEditor est un éditeur de texte léger pour macOS.",
        figma: "Figma est un outil de conception d'interface utilisateur.",
        iTerm: "iTerm est un terminal alternatif.",
        orion: "Orion est une alternative à Safari, les extensions en plus.",
        visual:
          "Visual Studio Code est un éditeur de code développé par Microsoft.",
        warp: "Warp est un terminal moderne avec une IA intégré.",
        zed: "Zed est un éditeur de texte rapide et minimaliste.",
        zen: "Zen est un navigateur web qui vise à la confidentialité.",
        discord:
          "Discord est une application de communication pour les communautés.",
        beeper: "Beeper est un logiciel de messagerie pour macOS.",
        ferdium: "Ferdium est un logiciel de messagerie pour macOS.",
        signal: "Signal est une application de messagerie sécurisée.",
        slack: "Slack est une application de messagerie pour les équipes.",
        telegram: "Telegram est une application de messagerie sécurisée.",
        whatsapp: "WhatsApp est une application de messagerie.",
        sonos: "Sonos est un gestionnaire pour les enceintes Sonos.",
        vlc: "VLC est un lecteur multimédia open-source.",
        alfred: "Alfred est un lanceur de commandes pour macOS.",
        bitwarden:
          "Bitwarden est un gestionnaire de mots de passe gratuit et open-source.",
        googledrive: "Google Drive est un service de stockage en ligne.",
        itsycal: "Itsycal est un calendrier pour la barre de menu de macOS.",
        notion:
          "Notion est une application de prise de notes et de gestion de projet.",
        obsidian: "Obsidian est une alternative à Notion.",
        raycast: "Raycast est un lanceur de commandes pour macOS.",
        rectangle:
          "Rectangle est une application de gestion des fenêtres pour macOS.",
        setapp:
          "Setapp est un service payant regroupant plusieurs applications.",
        ente: "Ente est un gestionnaire de mot de passe à deux facteurs.",
        aldente:
          "AlDente est une application pour gérer la charge de la batterie du Mac.",
        alttab: "Alt-Tab est un switcher d'application pour macOS.",
        balenaetcher:
          "BalenaEtcher est un outil pour flasher des cartes SD et des clés USB.",
        battery:
          "Battery est une application pour surveiller l'état de la batterie.",
        caffeine:
          "Caffeine est une application pour empêcher le Mac de se mettre en veille.",
        coconutbattery:
          "CoconutBattery est une application pour surveiller l'état de la batterie.",
        ice: "ICE permet de masquer les icônes de la barre de menu.",
        latest:
          "Latest permet de visualiser les dernières mises à jour d'une application.",
        lulu: "LuLu est un pare-feu open source pour macOS.",
        maccy: "Maccy est un gestionnaire de presse-papiers pour macOS.",
        scrollreverser:
          "Scroll Reverser est une application pour inverser le sens de défilement d'une souris mais pas du trackpad.",
        shottr: "Shottr est une application de capture d'écran rapide.",
        stats:
          "Stats est une application pour surveiller les performances du système.",
        theunarchiver:
          "The Unarchiver est un outil de décompression de fichiers.",
        transmission: "Transmission est un client BitTorrent léger.",
        brave: "Brave est un navigateur axé sur la confidentialité.",
        firefox: "Firefox est un navigateur web open-source.",
      },
      // Ajoutez d'autres traductions ici
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
