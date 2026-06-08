import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import AccountSettings from "@/components/AccountSettings";
import FriendsManager from "@/components/FriendsManager";
import ThemeSelector from "@/components/ThemeSelector";

export default async function ProfilePage() {
  const me = await requireUser();
  const isAdmin = me.role === "ADMIN";

  // Pour un admin, on n'affiche que les paramètres du compte (pas d'amis).
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <AccountSettings username={me.username} />
        <ThemeSelector theme={me.theme} uiStyle={me.uiStyle} />
      </div>
    );
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: me.id }, { addresseeId: me.id }],
    },
    include: {
      requester: { select: { id: true, username: true } },
      addressee: { select: { id: true, username: true } },
    },
  });

  const friends = friendships
    .filter((f) => f.status === "ACCEPTED")
    .map((f) => {
      const other = f.requesterId === me.id ? f.addressee : f.requester;
      return { friendshipId: f.id, id: other.id, username: other.username };
    });

  const received = friendships
    .filter((f) => f.status === "PENDING" && f.addresseeId === me.id)
    .map((f) => ({ friendshipId: f.id, username: f.requester.username }));

  const sent = friendships
    .filter((f) => f.status === "PENDING" && f.requesterId === me.id)
    .map((f) => ({ friendshipId: f.id, username: f.addressee.username }));

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Profil</h1>
        <AccountSettings username={me.username} />
      </section>

      <section>
        <ThemeSelector theme={me.theme} uiStyle={me.uiStyle} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Amis</h2>
        <FriendsManager friends={friends} received={received} sent={sent} />
      </section>
    </div>
  );
}
