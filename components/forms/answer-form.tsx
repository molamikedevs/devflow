'use client';

import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRef, useState, useTransition, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { createAnswer } from '@/lib/actions/answer.action';
import { AnswerSchema } from '@/lib/validation';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Spinner } from '../ui/spinner';
const Editor = dynamic(() => import('@/components/editor/index'), {
  // Make sure we turn SSR off
  ssr: false,
});

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

export default function AnswerForm({
  questionId,
  questionTitle,
  questionContent,
}: Props) {
  const [isAnswering, startTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const session = useSession();
  const editorRef = useRef<MDXEditorMethods>(null);
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof AnswerSchema>) => {
    startTransition(async () => {
      const result = await createAnswer({ questionId, content: data.content });
      if (result.success) {
        form.reset();
        toast.success('Your answer has been posted successfully');

        if (editorRef.current) {
          editorRef.current.setMarkdown('');
        }
      } else {
        toast.error('Failed to post answer', {
          description: result.error?.message,
        });
      }
    });
  };

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    void form.handleSubmit(onSubmit)(event);
  };

  const handleAIGenerate = async () => {
    if (session.status !== 'authenticated') {
      toast.error('You must be logged in to use AI generation.');
      return;
    }

    setIsAISubmitting(true);
    const userAnswer = editorRef.current?.getMarkdown() || '';

    try {
      const { success, data, error } = await api.ai.getAnswer(
        questionTitle,
        questionContent,
        userAnswer,
      );
      if (!success) {
        toast.error('Failed to generate AI answer.', {
          description:
            error?.message || 'An error occurred during AI generation.',
        });
        return;
      }

      const formattedData = data?.replace(/<br>/g, ' ').toString().trim();
      if (editorRef.current && formattedData) {
        editorRef.current.setMarkdown(formattedData);
        form.setValue('content', formattedData || '');
        form.trigger('content');
      }

      toast.success('AI answer generated successfully!', {
        description: 'The answer has been generated and filled in the editor.',
      });
    } catch (error) {
      toast.error('Failed to generate AI answer.', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred during AI generation.',
      });
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2 mb-4">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAISubmitting}
          onClick={handleAIGenerate}
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
          <form id="form-rhf-demo" onSubmit={handleFormSubmit}>
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
              {isAnswering ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Answering...</span>
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
