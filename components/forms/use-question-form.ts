import { siteConfig } from '@/config/site';
import { createQuestion, editQuestion } from '@/lib/actions/question.action';
import { AskQuestionSchema } from '@/lib/validation';
import { QuestionParams } from '@/types/global';
import { zodResolver } from '@hookform/resolvers/zod';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useRouter } from 'next/navigation';
import React, { useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

interface Props {
  question?: QuestionParams;
  isEdit?: boolean;
}

export function useQuestionForm({ question, isEdit = false }: Props) {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema as never),
    defaultValues: {
      title: question?.title || '',
      content: question?.content || '',
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  function handleInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] },
  ) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();

      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue('tags', [...field.value, tagInput]);
        e.currentTarget.value = '';
        form.clearErrors('tags');
      } else if (tagInput.length > 15) {
        form.setError('tags', {
          type: 'manual',
          message: 'Tag should be less than 15 characters',
        });
      } else if (field.value.includes(tagInput)) {
        form.setError('tags', {
          type: 'manual',
          message: 'Tag already exists',
        });
      }
    }
  }

  async function handleTagRemove(tag: string, field: { value: string[] }) {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue('tags', newTags);

    if (newTags.length === 0) {
      form.setError('tags', {
        type: 'manual',
        message: 'Tags are required',
      });
    }
  }

  async function handleCreateQuestion(data: z.infer<typeof AskQuestionSchema>) {
    startTransition(async () => {
      // 1. Determine which server action to call
      const action =
        isEdit && question
          ? editQuestion({ questionId: question._id, ...data })
          : createQuestion(data);

      // 2. Execute the action
      const result = await action;

      // 3. Handle Error
      if (!result.success) {
        toast.error(`Error ${isEdit ? 'updating' : 'creating'} question`, {
          description:
            result.error?.message || 'Something went wrong. Please try again.',
        });
        return;
      }

      // 4. Handle Success
      toast.success('Success!', {
        description: `Your question has been ${isEdit ? 'updated' : 'posted'} successfully.`,
      });

      if (result.data) {
        router.push(siteConfig.ROUTES.QUESTION(result.data._id.toString()));
      }
    });
  }

  return {
    editorRef,
    isPending,
    form,
    handleInputKeyDown,
    handleTagRemove,
    handleCreateQuestion,
  };
}
