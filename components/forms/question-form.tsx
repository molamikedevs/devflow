'use client';

import { QuestionParams } from '@/types/global';
import '@mdxeditor/editor/style.css';
import dynamic from 'next/dynamic';
import { Controller } from 'react-hook-form';
import { useQuestionForm } from './use-question-form';

import TagCard from '@/components/cards/Tag-card';
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
import { Spinner } from '@/components/ui/spinner';

const Editor = dynamic(() => import('@/components/editor/index'), {
  // Make sure we turn SSR off
  ssr: false,
});

interface Props {
  question?: QuestionParams;
  isEdit?: boolean;
}

export default function QuestionForm({ question, isEdit = false }: Props) {
  const {
    editorRef,
    isPending,
    form,
    handleInputKeyDown,
    handleTagRemove,
    handleCreateQuestion,
  } = useQuestionForm({ question, isEdit });

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
              render={({ field, fieldState }) => (
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
                      onKeyDown={(e) => handleInputKeyDown(e, field)}
                      className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 min-h-14 border"
                    />
                    {field.value.length > 0 && (
                      <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                        {field?.value?.map((tag: string) => (
                          <TagCard
                            key={tag}
                            _id={tag}
                            name={tag}
                            compact
                            remove
                            isButton
                            handleRemove={() => handleTagRemove(tag, field)}
                          />
                        ))}
                      </div>
                    )}
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
              disabled={isPending}
              className="primary-gradient rounded-2 text-light-900!"
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>{isEdit ? 'Edit question' : 'Ask a question'}</>
              )}
            </Button>
          </Field>
        </CardFooter>
      </div>
    </Card>
  );
}
