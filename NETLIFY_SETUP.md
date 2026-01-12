# Guide de configuration Netlify

Ce guide vous explique comment déployer l'application HPy Route Analyser sur Netlify.

## 📋 Prérequis

- Un compte Netlify (gratuit) : https://www.netlify.com
- Votre code dans un dépôt Git (GitHub, GitLab, ou Bitbucket)

## 🚀 Méthode 1 : Déploiement via l'interface Netlify (Recommandé)

### Étape 1 : Connecter votre dépôt

1. Connectez-vous à [Netlify](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez votre plateforme Git (GitHub, GitLab, ou Bitbucket)
4. Autorisez Netlify à accéder à vos dépôts
5. Sélectionnez le dépôt contenant votre application

### Étape 2 : Configurer les paramètres de build

Netlify devrait détecter automatiquement la configuration depuis `netlify.toml`, mais vérifiez que les paramètres suivants sont corrects :

- **Build command** : `npm run build`
- **Publish directory** : `dist`
- **Node version** : `22` (ou laissez Netlify utiliser la version par défaut)

### Étape 3 : Variables d'environnement (optionnel)

Si vous avez besoin de variables d'environnement :
1. Allez dans **Site settings** → **Environment variables**
2. Ajoutez vos variables si nécessaire

Pour cette application statique, aucune variable d'environnement n'est nécessaire.

### Étape 4 : Déployer

1. Cliquez sur **"Deploy site"**
2. Attendez que le build se termine (environ 2-3 minutes)
3. Votre site sera disponible sur une URL Netlify (ex: `https://random-name-123.netlify.app`)

## 🔧 Méthode 2 : Déploiement via Netlify CLI

### Installation de Netlify CLI

```bash
npm install -g netlify-cli
```

### Connexion

```bash
netlify login
```

### Déploiement

```bash
# Build local
npm run build

# Déploiement
netlify deploy --prod
```

## ⚙️ Configuration actuelle

Le fichier `netlify.toml` contient :

- **Build command** : `npm run build`
- **Publish directory** : `dist`
- **Redirects SPA** : Toutes les routes redirigent vers `/index.html` (nécessaire pour React Router)
- **Headers de sécurité** : Configuration des en-têtes HTTP pour la sécurité
- **Cache** : Optimisation du cache pour les assets statiques

## 🐛 Résolution de problèmes

### Erreur : "Build failed"

1. Vérifiez les logs de build dans Netlify
2. Assurez-vous que `package.json` est valide (pas de virgule en trop)
3. Vérifiez que toutes les dépendances sont dans `package.json`

### Erreur : "Page not found" sur les routes

- Vérifiez que la section `[[redirects]]` est présente dans `netlify.toml`
- Toutes les routes doivent rediriger vers `/index.html` avec un status 200

### Erreur : "Module not found"

- Vérifiez que tous les imports utilisent les alias configurés (`@/`, `@shared/`, `@assets/`)
- Assurez-vous que le build local fonctionne avant de déployer

### Build trop lent

- Netlify utilise un cache pour `node_modules`
- Les builds suivants seront plus rapides
- Vous pouvez aussi utiliser Netlify Build Plugins pour optimiser

## 📝 Vérification locale avant déploiement

Avant de déployer, testez localement :

```bash
# Build de production
npm run build

# Prévisualisation
npm run preview
```

Ouvrez `http://localhost:4173` et vérifiez que tout fonctionne.

## 🔄 Déploiements automatiques

Une fois configuré, Netlify déploiera automatiquement :
- À chaque push sur la branche principale (généralement `main` ou `master`)
- Pour les autres branches, Netlify créera des "Deploy previews"

## 🌐 Domaine personnalisé (optionnel)

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Suivez les instructions pour configurer votre DNS

## 📊 Monitoring

Netlify fournit :
- **Analytics** : Statistiques de visite (payant)
- **Build logs** : Logs détaillés de chaque build
- **Deploy notifications** : Notifications par email/Slack

## ✅ Checklist de déploiement

- [ ] Code poussé sur Git
- [ ] `netlify.toml` présent et correct
- [ ] `package.json` valide (JSON correct)
- [ ] Build local fonctionne (`npm run build`)
- [ ] Prévisualisation fonctionne (`npm run preview`)
- [ ] Site déployé sur Netlify
- [ ] Routes fonctionnent correctement
- [ ] Upload de fichiers GPX fonctionne

## 🎉 C'est tout !

Votre application devrait maintenant être en ligne sur Netlify !
