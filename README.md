# 📚 Biblo

Biblo est un site web pour faire des **listes de tout** : films, séries, animes,
livres, mangas, jeux vidéo… vus, lus ou joués. Chaque utilisateur note ses
éléments, suit son avancement, classe ses listes et consulte celles de ses amis.

Le site fonctionne sur **ordinateur et téléphone** (le design s'adapte
automatiquement).

---

## 🚀 Démarrer le site sur ton ordinateur

Tu as besoin de **Node.js** (déjà installé sur ta machine). Ouvre un terminal
dans le dossier `biblo` puis :

```bash
# 1. Installer les dépendances (à faire une seule fois)
npm install

# 2. Préparer la base de données + données d'exemple (une seule fois)
npx prisma migrate dev
npm run db:seed

# 3. Lancer le site
npm run dev
```

Puis ouvre ton navigateur sur **http://localhost:3000** 🎉

> Pour relancer le site plus tard, seule la commande `npm run dev` est nécessaire.

### Comptes de démonstration déjà créés

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Administrateur | `admin` | `admin123` |
| Utilisateur | `alice` | `password123` |
| Utilisateur | `bob` | `password123` |

Tu peux aussi créer ton propre compte depuis le bouton **Se connecter → Créer un compte**.

---

## 🧭 Comment ça marche (visite guidée)

- **Catalogue (page d'accueil)** : tous les éléments validés. Tu peux **filtrer**
  par type et par note, **rechercher** par nom, et **créer un élément** s'il manque.
  Un élément créé par un utilisateur passe en attente de validation par un admin.
- **Mes Listes** : tes listes perso. Bouton **Modifier** pour en créer, renommer,
  supprimer ou **masquer** (une liste masquée n'est pas visible par tes amis).
- **Une liste** : tes éléments triés par note. Tu peux classer finement les
  éléments qui ont la **même note** par **glisser-déposer** (poignée ⠿) ou avec
  les flèches **▲▼**. Pour chaque élément tu
  règles ta **note**, ton **état d'avancement** et, si « en cours », ta progression
  (ex : *Tome 105*, *Saison 2 Épisode 4*…).
- **Profil** : changer ton nom/mot de passe, et gérer tes **amis** (demandes
  envoyées/reçues, accepter/refuser, consulter le profil d'un ami).
- **Espace admin** (compte admin) : valider/rejeter les propositions d'éléments
  (avec possibilité de les corriger avant validation) et gérer les utilisateurs.

### Les types d'éléments et l'avancement

Chaque élément a un **type** (Manga, Livre, Série, Film, Anime, Jeu Vidéo, ou un
type que tu crées). Le type définit les 3 états d'avancement (ex : *À lire / En
cours / Lu*) et la façon de préciser où on en est. En créant un **nouveau type**,
tu décris toi-même ces réglages, et le type devient réutilisable par tout le monde.

---

## 🎨 Apparence : thème, style d'interface et logo

Dans **Profil → Apparence** vous pouvez choisir :
- le **thème** : Clair ☀️ ou Sombre 🌙 ;
- le **style d'interface** : **Moderne (iOS 26)** ✨ — translucide façon « Liquid
  Glass » — ou **Classique** 🗂️ (l'ancien design). Le réglage est mémorisé sur
  votre compte.

### Changer le logo

Le logo affiché en haut à gauche est le fichier **`public/logo.png`**.
Pour mettre le vôtre : placez simplement votre image dans le dossier `public/`
en la nommant **`logo.png`**. Tant qu'il n'existe pas, un hibou de secours
(`public/logo.svg`) est affiché. Aucune autre manipulation n'est nécessaire.

## 🗄️ La base de données, expliquée simplement

Une **base de données**, c'est le « cahier » où le site range tout : les comptes,
les éléments du catalogue, les listes, les notes, les amitiés… Sans elle, tout
serait oublié à chaque redémarrage.

Biblo utilise **SQLite** : la base est un **simple fichier** sur ton ordinateur,
situé dans `prisma/dev.db`. Avantages : zéro installation, zéro serveur à gérer.
C'est parfait pour développer et tester sur ton PC.

Pour décrire et manipuler la base, on utilise **Prisma** (un outil qui parle à la
base à notre place). La structure des données est décrite dans
[`prisma/schema.prisma`](prisma/schema.prisma) — c'est le plan de la base.

Commandes utiles :

```bash
npm run db:seed     # (re)remplit la base avec les données d'exemple
npm run db:reset    # efface tout et recrée une base vierge puis re-seede
npx prisma studio   # ouvre une interface web pour voir/éditer la base
```

---

## 🌍 Mettre Biblo en ligne (quand tu seras prêt)

Aujourd'hui le site tourne **uniquement sur ton ordinateur**. Pour que tes amis y
accèdent depuis internet, il faut deux choses : un **hébergeur** (qui fait tourner
le site 24h/24) et une **base de données en ligne** (le fichier local ne convient
plus pour plusieurs utilisateurs simultanés).

La voie la plus simple, **gratuite pour commencer** :

1. **Héberger le code sur Vercel** (le créateur de Next.js). Tu mets ton code sur
   GitHub, tu connectes Vercel, et il publie le site automatiquement. Vercel te
   donne une adresse du type `https://biblo.vercel.app`.
2. **Une base de données PostgreSQL en ligne** (ex : *Neon*, *Supabase* ou la base
   intégrée de Vercel — toutes ont une offre gratuite). PostgreSQL est une « grande
   sœur » de SQLite, conçue pour plusieurs utilisateurs en même temps.

Côté code, le passage SQLite → PostgreSQL est prévu :

- Dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par
  `provider = "postgresql"`.
- Mettre l'adresse fournie par l'hébergeur de base dans la variable
  `DATABASE_URL` (fichier `.env` en local, ou les « Environment Variables » sur Vercel).
- Définir aussi `BIBLO_SECRET` (une longue phrase secrète au hasard) sur Vercel,
  pour sécuriser les connexions.
- Lancer `npx prisma migrate deploy` pour créer les tables dans la base en ligne.

> Quand tu voudras franchir cette étape, dis-le moi : je te guide pas à pas.

---

## 🧱 Sous le capot (pour info)

- **Next.js 16** (React 19) — interface **et** serveur dans un seul projet.
- **Prisma + SQLite** — base de données.
- **Tailwind CSS v4** — mise en forme (design épuré).
- Authentification maison (mot de passe chiffré avec **bcrypt**, session signée
  dans un cookie sécurisé avec **jose**).

Structure principale :

```
src/
  app/            → les pages (catalogue, listes, profil, admin…) et les actions serveur
  components/     → les morceaux d'interface réutilisables
  lib/            → base de données, sessions, logique d'avancement
prisma/
  schema.prisma   → le plan de la base de données
  seed.ts         → les données d'exemple
```
