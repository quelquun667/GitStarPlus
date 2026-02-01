# GitStar+ ⭐

> Une deuxième étoile GitHub, personnelle et ultra flexible

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-MV3-orange)
![Firefox](https://img.shields.io/badge/firefox-compatible-red)

Extension navigateur qui ajoute un bouton **GitStar+** sur chaque dépôt GitHub pour gérer vos favoris personnels, indépendamment des étoiles officielles.

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| 🌟 **Double étoile** | Bouton GitStar+ sur chaque page de dépôt |
| 💾 **Stockage local** | Favoris persistants dans le navigateur |
| 📤 **Export JSON** | Sauvegardez vos favoris en un clic |
| 📥 **Import JSON** | Restaurez facilement vos données |
| 🔍 **Recherche** | Trouvez rapidement un favori |
| 🌙 **Dark Mode** | S'adapte automatiquement au thème GitHub |

## 🚀 Installation

### Chrome / Edge / Brave

1. Téléchargez ou clonez ce dépôt
2. Ouvrez `chrome://extensions/` (ou `edge://extensions/`)
3. Activez le **"Mode développeur"** (en haut à droite)
4. Cliquez **"Charger l'extension non empaquetée"**
5. Sélectionnez le dossier **`extension`**

### Firefox

1. Ouvrez `about:debugging#/runtime/this-firefox`
2. Cliquez **"Charger un module complémentaire temporaire"**
3. Sélectionnez le fichier **`extension/manifest.json`**

## 📖 Utilisation

### Ajouter un favori
1. Allez sur n'importe quel dépôt GitHub
2. Cliquez sur le bouton **GitStar+** (à côté du bouton Star)
3. L'étoile devient dorée ✓

### Gérer vos favoris
1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Recherchez, parcourez ou supprimez vos favoris
3. Exportez/Importez vos données via les boutons dédiés

## 📁 Structure du projet

```
GitStar+/
├── README.md               # Ce fichier
├── CHANGELOG.md            # Historique des versions
├── LICENSE                 # Licence MIT
├── .gitignore
└── extension/              # ← Dossier à charger dans le navigateur
    ├── manifest.json
    ├── icons/
    └── src/
        ├── background/     # Service worker
        ├── content/        # Script & styles injectés sur GitHub
        ├── pages/          # Page de désinstallation
        ├── popup/          # Interface popup
        └── utils/          # Module de stockage
```

## 🔒 Permissions

| Permission | Raison |
|------------|--------|
| `storage` | Stocker les favoris localement |
| `github.com` | Injecter le bouton sur les pages GitHub |

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 License

[MIT](LICENSE) © 2026
