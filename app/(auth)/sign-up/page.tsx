'use client';

import AuthForm from '@/components/forms/auth-form';
import { signUpWithCredentials } from '@/lib/actions/auth.action';
import { SignUpSchema } from '@/lib/validation';

export default function SignUp() {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ name: '', username: '', email: '', password: '' }}
      onSubmit={signUpWithCredentials}
    />
  );
}
