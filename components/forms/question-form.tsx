'use client';

import { AskQuestionSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const Editor = dynamic(() => import('@/components/editor/index'), {
  // Make sure we turn SSR off
  ssr: false,
});

export default function QuestionForm() {
  const editorRef = useRef<MDXEditorMethods>(null);
  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema as never),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  function handleCreateQuestion(data: z.infer<typeof AskQuestionSchema>) {
    console.log(data);
  }

  return (
    <Card className="flex w-full flex-col gap-10 bg-background-light700_dark300">
      <CardContent>
        <form
          id="question-form"
          onSubmit={form.handleSubmit(handleCreateQuestion)}
        >
          <FieldGroup>
            {/* Title input */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex w-full flex-col"
                >
                  <FieldLabel
                    htmlFor="question-form-title"
                    className="paragraph-semibold text-dark400_light800"
                  >
                    Question Title <span className="text-primary-500">*</span>
                  </FieldLabel>
                  <Input
                    id="question-form-title"
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 min-h-14 border"
                  />
                  <FieldDescription className="body-regular text-light-500 mt-2.5">
                    Be specific and imagine you’re asking a question to another
                    person.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Content filed */}
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex w-full flex-col"
                >
                  <FieldLabel
                    htmlFor="question-form-content"
                    className="paragraph-semibold text-dark400_light800"
                  >
                    Detailed explanation of your question{' '}
                    <span className="text-primary-500">*</span>
                  </FieldLabel>
                  <Editor
                    editorRef={editorRef}
                    value={field.value}
                    fieldChange={field.onChange}
                  />
                  <FieldDescription className="body-regular text-light-500 mt-2.5">
                    Introduce the question and expand on what you put in the
                    tile
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="tags"
              control={form.control}
              render={({ fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex w-full flex-col"
                >
                  <FieldLabel
                    htmlFor="question-form-tags"
                    className="paragraph-semibold text-dark400_light800"
                  >
                    Tags <span className="text-primary-500">*</span>
                  </FieldLabel>
                  <div>
                    <Input
                      id="question-form-tags"
                      placeholder="Add tags..."
                      className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 min-h-14 border"
                    />
                    Tags
                  </div>
                  <FieldDescription className="body-regular text-light-500 mt-2.5">
                    Add up to 5 tags to describe what your question is about.
                    You need to press enter to add a tag.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <div className="flex justify-end">
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="question-form"
              className="primary-gradient rounded-2 text-light-900!"
            >
              Submit
            </Button>
          </Field>
        </CardFooter>
      </div>
    </Card>
  );
}
