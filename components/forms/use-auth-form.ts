import { siteConfig } from '@/config/site';
import { ActionResponse } from '@/types/global';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';
import { ZodType } from 'zod';

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T, T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: 'SIGN_IN' | 'SIGN_UP';
}

export function useAuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const router = useRouter();

  const buttonText = formType === 'SIGN_IN' ? 'Sign In' : 'Sign Up';

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (result?.success) {
      toast.success(
        formType === 'SIGN_UP' ? 'Signup successfully' : 'Signin successfully',
      );

      router.push(siteConfig.ROUTES.HOME);
    } else {
      toast.error(result?.status, {
        description: result?.error?.message,
      });
    }
  };

  return { form, buttonText, handleSubmit };
}
