import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default async function Home() {
  const session = await auth();
  console.log(session);
  return (
    <>
      <h1 className="h1-bold">Welcome into the world of next.js</h1>
      <form
        className="px-10 pt-25"
        action={async () => {
          'use server';

          await signOut({ redirectTo: siteConfig.ROUTES.SIGN_IN });
        }}
      >
        <Button>Log out</Button>
      </form>
    </>
  );
}
