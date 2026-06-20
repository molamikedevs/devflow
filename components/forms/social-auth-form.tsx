'use client';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';

const providers = [
  {
    id: 'github',
    label: 'Log in with github',
    icon: '/icons/github.svg',
    invert: true,
  },
  {
    id: 'google',
    label: 'Log in with google',
    icon: '/icons/google.svg',
    invert: false,
  },
] as const;

type Provider = (typeof providers)[number]['id'];

const buttonClass =
  'background-dark400_light900 body-medium text-dark200_light800 min-h-12 rounded-2 flex-1 px-4 py-3.5';

export default function SocialAuthForm() {
  const handleSignIn = async (provider: Provider) => {
    try {
      await signIn(provider, { callbackUrl: siteConfig.ROUTES.HOME });
    } catch (error) {
      console.error('handleSignIn:', error);
      toast.error('There was an error signing in. Please try again.', {
        description: 'If the problem persists, contact support.',
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          className={buttonClass}
          onClick={() => handleSignIn(provider.id)}
        >
          <Image
            src={provider.icon}
            alt={provider.icon}
            width={20}
            height={20}
            className={`mr-2 object-contain ${
              provider.invert ? 'invert-colors' : ''
            }`}
          />
          <span>{provider.label}</span>
        </Button>
      ))}
    </div>
  );
}
