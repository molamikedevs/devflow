import { auth } from '@/auth';

import AuthButton from '@/components/common/auth-button';
import Logout from '@/components/common/logout';
import NavLinks from './navbar/nav-links';

const LeftSidebar = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-24 max-sm:hidden lg:w-[266px] dark:shadow-none">
      {/* TOP: Navigation */}
      <NavLinks userId={userId} />

      {/* BOTTOM: Auth actions */}
      <div className="flex flex-col gap-3">
        {userId ? (
          <Logout />
        ) : (
          <div className="flex flex-col gap-2">
            <AuthButton type="login" />
            <AuthButton type="signup" />
          </div>
        )}
      </div>
    </section>
  );
};

export default LeftSidebar;
