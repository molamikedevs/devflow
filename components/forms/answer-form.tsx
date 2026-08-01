'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { AnswerSchema } from '@/lib/validation';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Spinner } from '../ui/spinner';
const Editor = dynamic(() => import('@/components/editor/index'), {
  // Make sure we turn SSR off
  ssr: false,
});

export default function AnswerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: '',
    },
  });

  function onSubmit(data: z.infer<typeof AnswerSchema>) {
    console.log(data);
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2 mb-4">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAISubmitting}
        >
          {isAISubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Generating AI Answer...</span>
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="AI icon"
                width={12}
                height={12}
                className="mr-2 object-contain"
              />
              Generate with AI
            </>
          )}
        </Button>
      </div>
      <Card className="bg-background-light700_dark300">
        <CardContent className="flex w-full flex-col gap-10">
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-col gap-3 w-full"
                  >
                    <Editor
                      editorRef={editorRef}
                      value={field.value}
                      fieldChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Field orientation="horizontal">
            <Button
              type="submit"
              form="form-rhf-demo"
              className="primary-gradient w-fit"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>Submit Answer</>
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
