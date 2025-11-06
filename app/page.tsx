import { auth, signIn, signOut } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <h1 className="text-3xl font-bold text-gray-900">
        Next-auth v5 X (Twitter) Login
      </h1>

      {session?.user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-gray-900">
            Welcome, {session.user.name}!
          </p>
          {session.user.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
          )}
          <p className="text-sm text-gray-600">{session.user.email}</p>

          <div className="flex gap-3 mt-4">
            <Link href="/tweets">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition">
                트윗 검색 →
              </button>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-sm transition"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("twitter");
          }}
        >
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition"
          >
            Sign in with X (Twitter)
          </button>
        </form>
      )}
    </div>
  );
}
