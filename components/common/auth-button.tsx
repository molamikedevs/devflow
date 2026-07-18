import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

type AuthButtonProps = {
  type: 'login' | 'signup';
};

const config = {
  login: {
    href: siteConfig.ROUTES.SIGN_IN,
    label: 'Log In',
    icon: '/icons/account.svg',
    buttonClass:
      'small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none',
    textClass: 'primary-text-gradient',
  },
  signup: {
    href: siteConfig.ROUTES.SIGN_UP,
    label: 'Sign Up',
    icon: '/icons/sign-up.svg',
    buttonClass:
      'small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none',
    textClass: '',
  },
};

export default function AuthButton({ type }: AuthButtonProps) {
  const button = config[type];

  return (
    <Button className={button.buttonClass} asChild>
      <Link href={button.href}>
        <Image
          src={button.icon}
          alt={button.label}
          width={20}
          height={20}
          className="invert-colors lg:hidden"
        />

        <span className={`${button.textClass} max-lg:hidden`}>
          {button.label}
        </span>
      </Link>
    </Button>
  );
}
