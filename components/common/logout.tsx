import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Logout() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <Button
        type="submit"
        className="base-medium w-fit cursor-pointer bg-transparent px-4 py-3"
      >
        <LogOut className="mr-2 size-5 text-black dark:text-white" />
        <span className="text-dark300_light900">Logout</span>
      </Button>
    </form>
  );
}
