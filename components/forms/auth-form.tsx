'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { ZodType } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AuthSwitch from '../common/auth-switch';

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T, T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean }>;
  formType: 'SIGN_IN' | 'SIGN_UP';
}

export default function AuthForm<T extends FieldValues>({
  formType,
  schema,
  defaultValues,
  onSubmit,
}: AuthFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const buttonText = formType === 'SIGN_IN' ? 'Sign In' : 'Sign Up';

  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full sm:max-w-md bg-background-light900_dark300 mt-4 border-red">
      <CardContent>
        <form
          id="auth-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-4 space-y-6"
        >
          <FieldGroup>
            {Object.keys(defaultValues).map((field) => (
              <Controller
                key={field}
                name={field as Path<T>}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex w-full flex-col gap-2.5"
                  >
                    <FieldLabel
                      className="paragraph-medium text-dark400_light700"
                      htmlFor={field.name === 'email' ? 'email' : field.name}
                    >
                      {field.name === 'email'
                        ? 'Email Address'
                        : field.name.charAt(0).toUpperCase() +
                          field.name.slice(1)}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name === 'email' ? 'email' : field.name}
                      aria-invalid={fieldState.invalid}
                      type={field.name === 'password' ? 'password' : 'text'}
                      placeholder={
                        field.name === 'email'
                          ? 'johndoe@gmail.com'
                          : field.name
                      }
                      className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 min-h-12 border"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="auth-form"
            disabled={form.formState.isSubmitting}
            className="primary-gradient paragraph-medium rounded-2 font-inter text-light-900! min-h-12 px-4 py-3 w-full"
          >
            {form.formState.isSubmitting
              ? buttonText === 'Sign In'
                ? 'Sign In...'
                : 'Sign Up...'
              : buttonText}
          </Button>
        </Field>
      </CardFooter>
      <div className="text-center">
        <AuthSwitch formType={formType} />
      </div>
    </Card>
  );
}
