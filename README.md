# Kai - Chatbot Interface for Ollama

Une interface web moderne et élégante pour interagir avec vos modèles Ollama locaux. Kai offre une expérience utilisateur fluide avec gestion de conversations, streaming en temps réel, et support du mode sombre.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## ✨ Fonctionnalités

- 💬 **Interface de chat intuitive** - Design épuré inspiré des meilleures interfaces modernes
- 🔄 **Streaming en temps réel** - Réponses progressives pour une meilleure expérience
- 📚 **Gestion de conversations** - Créez, renommez et organisez vos conversations
- 🎨 **Mode sombre/clair** - Thème adaptatif pour votre confort visuel
- 📝 **Support Markdown** - Formatage riche avec coloration syntaxique du code
- 💾 **Sauvegarde locale** - Vos conversations sont préservées dans le navigateur
- 🤖 **Génération automatique de titres** - Titres intelligents basés sur le contenu
- ⚡ **Léger et rapide** - Architecture optimisée pour des performances maximales

## 📋 Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [Ollama](https://ollama.ai/) installé et en cours d'exécution
- Un modèle Ollama personnalisé nommé "kai" (ou modifiez le nom dans le code)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/seishiiinsan/kai.git
cd kai
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer votre modèle Ollama

Le projet utilise un modèle personnalisé nommé "kai". Créez-le avec votre Modelfile :

```bash
ollama create kai -f Modelfile
```

### 4. Lancer l'application

```bash
node server.js
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
kai-chatbot/
│
├── server.js           # Serveur Express avec API Ollama
├── Modelfile          # Configuration du modèle Ollama
├── package.json       # Dépendances Node.js
│
└── public/
    ├── index.html     # Interface principale
```

## 🔧 Configuration

### Modifier le modèle Ollama

Dans `server.js`, changez le nom du modèle :

```javascript
const stream = await ollama.chat({
    model: 'votre-modele',  // Changez 'kai' par votre modèle
    // ...
});
```

### Ajuster les paramètres de génération

Modifiez les options dans `server.js` :

```javascript
options: {
    temperature: 0.8,     // Créativité (0.0 - 2.0)
    num_predict: 4000     // Longueur maximale de réponse
}
```

### Changer le port

```javascript
const PORT = 3000;  // Modifiez selon vos besoins
```

## 🎯 Utilisation

1. **Démarrer une nouvelle conversation** : Cliquez sur "Nouvelle conversation" dans la barre latérale
2. **Envoyer un message** : Tapez votre message et appuyez sur Entrée (Shift+Entrée pour un saut de ligne)
3. **Renommer une conversation** : Double-cliquez sur le titre en haut
4. **Supprimer une conversation** : Cliquez sur le ✕ à côté de la conversation
5. **Changer de thème** : Utilisez le bouton toggle en haut à droite

## 🛠️ Technologies utilisées

### Backend
- **Express.js** - Framework web minimaliste
- **Ollama JavaScript SDK** - Interface avec Ollama
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **Vanilla JavaScript** - Pas de framework, performances maximales
- **Marked.js** - Parsing Markdown
- **Highlight.js** - Coloration syntaxique du code
- **Tailwind CSS** (via CDN) - Styling utilitaire

## 📡 API Endpoints

### POST `/api/conversation`
Crée ou récupère une conversation

```json
{
  "conversationId": "conv_1234567890",
  "title": "Ma conversation"
}
```

### POST `/api/chat`
Envoie un message et reçoit une réponse en streaming

```json
{
  "message": "Bonjour",
  "conversationId": "conv_1234567890"
}
```

### POST `/api/generate-title`
Génère un titre pour une conversation

```json
{
  "message": "Premier message de la conversation"
}
```

### PATCH `/api/conversation/:id`
Met à jour le titre d'une conversation

### DELETE `/api/conversation/:id`
Supprime une conversation

## 🎨 Personnalisation

### Modifier les couleurs du thème

Dans `styles.css`, ajustez les classes Tailwind ou ajoutez vos propres styles CSS.

### Changer le message d'accueil

Dans `script.js`, modifiez la fonction `loadConversation()` :

```javascript
chatContainer.innerHTML = `
    <div class="message-fade message-container">
        <div class="message-label">Kai</div>
        <div class="message-content">
            Votre message personnalisé ici
        </div>
    </div>
`;
```

## 🐛 Résolution des problèmes

### Ollama ne répond pas
- Vérifiez qu'Ollama est en cours d'exécution : `ollama list`
- Vérifiez que le modèle "kai" existe : `ollama list`
- Vérifiez le port d'Ollama (par défaut 11434)

### Erreur CORS
- Assurez-vous que le serveur Express utilise bien CORS
- Vérifiez que l'URL du serveur correspond dans le code client

### Les conversations ne se sauvegardent pas
- Vérifiez que localStorage est activé dans votre navigateur
- Ouvrez la console développeur pour voir les erreurs éventuelles

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout de fonctionnalité'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Gabin HALLOSSERIE

## 🙏 Remerciements

- [Ollama](https://ollama.ai/) pour l'excellente plateforme de modèles locaux
- [Marked.js](https://marked.js.org/) pour le parsing Markdown
- [Highlight.js](https://highlightjs.org/) pour la coloration syntaxique
- La communauté open source

---

⭐ Si ce projet vous a été utile, n'hésitez pas à lui donner une étoile !
