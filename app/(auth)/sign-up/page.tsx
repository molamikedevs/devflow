'use client';

import AuthForm from '@/components/forms/auth-form';
import { SignUpSchema } from '@/lib/validation';

export default function SignUp() {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ name: '', username: '', email: '', password: '' }}
      onSubmit={(data) => Promise.resolve({ success: true, data })}
    />
  );
}
