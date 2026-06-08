# 🚀 Mettre Biblo en ligne — Vercel + PostgreSQL (Neon)

Ce guide décrit, étape par étape, comment publier Biblo sur Internet avec une
adresse personnalisée. Tout ce qui est marqué **[Toi]** est une action de ta part
(créer un compte, cliquer) ; ce qui est marqué **[Claude]** je m'en charge dans le
code.

> Vue d'ensemble : ton code va vivre sur **GitHub**, être publié par **Vercel**
> (l'hébergeur), et stocker ses données dans une base **PostgreSQL** chez **Neon**.
> Les images uploadées iront dans **Vercel Blob** (stockage de fichiers).

---

## Étape 1 — Créer les comptes (gratuits) **[Toi]**

1. **GitHub** → https://github.com (pour héberger le code).
2. **Vercel** → https://vercel.com → « Sign up » **avec GitHub**.
3. **Neon** → https://neon.tech → « Sign up » **avec GitHub** (base PostgreSQL).

## Étape 2 — Créer la base de données **[Toi → me donner 1 info]**

1. Sur Neon : « Create project » (nom : `biblo`, région : Europe, ex : Frankfurt).
2. Neon affiche une **« Connection string »** qui ressemble à :
   `postgresql://user:motdepasse@ep-xxxx.eu-central-1.aws.neon.tech/biblo?sslmode=require`
3. **Copie-la et donne-la moi.** C'est la seule information sensible dont j'ai
   besoin pour brancher le site sur la base.

## Étape 3 — Adapter le code pour la production **[Claude]**

Une fois la « connection string » reçue, je fais :

- Bascule de la base **SQLite → PostgreSQL** (et génération des tables).
- Stockage des images uploadées vers **Vercel Blob** (au lieu du disque local).
- Création des **6 types natifs** et du **compte Admin** dans la nouvelle base.

(Tu n'as rien à faire pendant cette étape.)

## Étape 4 — Mettre le code sur GitHub **[Toi, je te guide]**

Deux options :
- **Simple** : installer **GitHub Desktop** (appli avec boutons), « Add existing
  repository » → dossier `biblo` → « Publish repository » (en **privé**).
- **Terminal** : créer un dépôt vide sur GitHub puis :
  ```bash
  cd ~/biblo
  git add -A && git commit -m "Biblo"
  git remote add origin https://github.com/TON_PSEUDO/biblo.git
  git push -u origin main
  ```

> ⚠️ Le fichier `.env` (qui contient des secrets) **n'est pas** envoyé sur GitHub :
> c'est volontaire et déjà configuré.

## Étape 5 — Publier sur Vercel **[Toi, je te guide]**

1. Sur Vercel : « Add New… → Project » → importe ton dépôt `biblo`.
2. Avant de déployer, ouvre **« Environment Variables »** et ajoute (voir tableau
   plus bas) : `DATABASE_URL`, `BIBLO_SECRET`, `BLOB_READ_WRITE_TOKEN`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
3. Clique **Deploy**. Au bout d'1-2 minutes, Vercel te donne une adresse du type
   `https://biblo-xxxx.vercel.app`. Le site est en ligne ! 🎉

## Étape 6 — Initialiser la base en ligne **[Claude]**

Je lance une seule fois la création des tables + du compte Admin dans la base Neon
(les types natifs et l'unique compte `Admin`).

## Étape 7 — L'adresse personnalisée (ex : biblo.fr) **[Toi, je te guide]**

1. Achète le domaine chez **OVH** (https://www.ovhcloud.com) — spécialiste du
   `.fr`, ~7-15 €/an. Vérifie la disponibilité (sinon `biblo-app.fr`, `monbiblo.fr`…).
2. Sur Vercel : projet → **Settings → Domains → Add** → saisis `biblo.fr`.
3. Vercel affiche 1-2 lignes « DNS » (un enregistrement **A** et/ou **CNAME**).
   Copie-les dans la zone DNS de ton domaine chez OVH.
4. En quelques minutes à quelques heures, `biblo.fr` pointe sur ton site, avec le
   **cadenas HTTPS automatique**.

---

## 🔐 Les variables d'environnement (Étape 5)

| Nom | À quoi ça sert | Valeur |
|-----|----------------|--------|
| `DATABASE_URL` | Adresse de la base PostgreSQL | La « connection string » de Neon |
| `BIBLO_SECRET` | Sécurise les sessions (connexions) | Une longue phrase aléatoire (je peux la générer) |
| `BLOB_READ_WRITE_TOKEN` | Stockage des images | Donné par Vercel (onglet **Storage → Blob**) |
| `ADMIN_USERNAME` | Identifiant de l'admin initial | `Admin` |
| `ADMIN_PASSWORD` | Mot de passe de l'admin initial | (ton mot de passe) |

> Ces variables ne sont **pas** dans le code : elles se saisissent dans Vercel, et
> restent secrètes.

---

## ✅ Ce dont j'ai besoin de toi pour démarrer

1. Crée les comptes **GitHub**, **Vercel**, **Neon** (Étape 1).
2. Crée le projet Neon et **donne-moi la « connection string »** (Étape 2).

Dès que j'ai ça, j'adapte le code et on enchaîne les étapes ensemble.
