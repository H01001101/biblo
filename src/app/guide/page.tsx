import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Guide · Biblo",
  description: "Découvre tout ce que tu peux faire sur Biblo.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--color-ink)]">
        {children}
      </div>
    </section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-1 text-[var(--color-accent)]">›</span>
      <p>{children}</p>
    </div>
  );
}

export default async function GuidePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* En-tête / présentation */}
      <div className="card overflow-hidden p-6 text-center">
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Bienvenue sur Biblo
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[var(--color-muted)]">
          Biblo permet de faire des <strong>listes de tout</strong> :
          films, séries, animes, livres, mangas, jeux vidéo… vus, lus ou joués etc...
        </p>
        {!user && (
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/register" className="btn-primary">
              Créer un compte
            </Link>
            <Link href="/login" className="btn-secondary">
              Se connecter
            </Link>
          </div>
        )}
      </div>

      <Section title="Premiers pas">
        <Item>
          Clique sur <strong>Se connecter</strong> en haut à droite pour te
          connecter ou <strong>créer un compte </strong> (il faut juste renseigner un nom d&apos;utilisateur
          et un mot de passe)
        </Item>
        <Item>
          Une fois connecté, le bouton en haut à droite avec ton username permet
          d&apos;accéder à ton profil ou de te déconnecter
        </Item>
        <Item>
          Normalement le site fonctionne sur <strong>ordinateur</strong> et
          <strong> téléphone</strong>
        </Item>
      </Section>

      <Section title="Le Catalogue (page d'accueil)">
        <Item>
          Le catalogue rassemble <strong>tous les éléments</strong> disponibles. Pour
          chacun, tu peux voir son nom, sa couverture et la <strong>note moyenne</strong>
          des autres utilisateurs
        </Item>
        <Item>
          <strong>Filtre</strong> par type (Manga, Film, Jeu Vidéo…) ou par note
          moyenne, ou <strong>cherche</strong> un élément par son nom
        </Item>
        <Item>
          Clique sur un élément pour ouvrir sa <strong>page détaillée </strong>
          (description complète, note moyenne) et l&apos;<strong>ajouter à une de
          tes listes</strong> si tu veux
        </Item>
        <Item>
          Tu trouves pas ce que tu cherches ? Clique sur <strong>"Créer un élément" </strong> :
          renseigne son nom, une image (depuis ton ordinateur), une description et
          son type. Ta proposition sera vérifiée par l'admin avant
          d&apos;apparaître dans le catalogue
        </Item>
      </Section>

      <Section title="Mes Listes">
        <Item>
          Crée autant de listes que tu veux (ex : "Mangas", "Films",
          "Recettes de cuisine"…)
        </Item>
        <Item>
          Le bouton <strong>Modifier</strong> permet de créer, renommer ou supprimer
          une liste
        </Item>
        <Item>
          Tu peux <strong>masquer </strong> une liste pour qu'elle ne soit plus visible par tes amis
        </Item>
      </Section>

      <Section title="Dans une liste">
        <Item>
          Pour chaque élément, donne ta <strong>note personnelle</strong> et indique ton <strong>état
          d&apos;avancement</strong> : à voir / en cours / vu (les états d'avancement
          s&apos;adaptent au type d'élément)
        </Item>
        <Item>
          Quand un élément est <strong>"en cours"</strong>, précise où tu en es
          (ex : <em>Tome 105</em>, <em>Saison 2 Épisode 4</em>, <em>1h30</em>…)
        </Item>
        <Item>
          Les éléments sont <strong>triés par note</strong>. Pour départager ceux qui
          ont la <strong>même note</strong>, fais ton classement précis par
          <strong> glisser-déposer</strong> (poignée à gauche de chaque élément)
        </Item>
        <Item>
          <strong>Filtre </strong> ta liste par état d&apos;avancement (ex : ne voir
          que les "en cours")
        </Item>
        <Item>
          Clique sur un élément pour voir son détail dans la liste : ta note
          <strong> et</strong> la note moyenne, et ton avancement
        </Item>
      </Section>

      <Section title="Les amis">
        <Item>
          Depuis ton <strong>Profil</strong>, ajoute un ami en saisissant son nom
          d&apos;utilisateur : une demande lui est envoyée
        </Item>
        <Item>
          Tu y retrouves les <strong>demandes reçues</strong> (à accepter ou
          refuser) et tes demandes en attente
        </Item>
        <Item>
          Consulte le <strong>profil d&apos;un ami </strong> pour voir ses listes
          (sauf celles qu&apos;il a masquées) et clique sur une liste pour voir
          le détail
        </Item>
      </Section>

      <Section title="Personnaliser l'apparence">
        <Item>
          Dans <strong>Profil → Apparence</strong>, choisis le <strong>thème</strong>
          (clair ou sombre).
        </Item>
        <Item>
          Choisis aussi le <strong>style d&apos;interface</strong> : <strong>Moderne </strong>
          ou <strong>Classique</strong>
        </Item>
        <Item>
          Tu peux aussi modifier ton <strong>nom d&apos;utilisateur </strong>
          et ton <strong>mot de passe</strong> si besoin
        </Item>
      </Section>

      <Section title="Bon à savoir">
        <Item>
          Les éléments que tu proposes passent par une <strong>validation </strong>
          de l'admin pour modérer un minimum le contenu du site
        </Item>
        <Item>
          La <strong>note moyenne </strong> d&apos;un élément est calculée à partir des
          notes de tous les utilisateurs
        </Item>
        <Item>
          Supprimer une liste de ton onglet ne la supprime que <strong>pour
          toi</strong> : les autres utilisateurs gardent les leurs
        </Item>
        <Item>
          Chaque proposition d&apos;élément <strong>acceptée</strong> compte comme une
          contribution. Les <strong>3 plus gros contributeurs</strong> sont affichés
          en bas de page
        </Item>
        <Item>
          Si tu rencontres un problème ou un bug envoie un mail à martin.hamelle@dauphine.eu. Pas sûr que je le règle mais on sait jamais
        </Item>
      </Section>

      <div className="card p-5 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Prêt à commencer ?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">
            Explorer le catalogue
          </Link>
          {user && user.role !== "ADMIN" && (
            <Link href="/lists" className="btn-secondary">
              Mes listes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
