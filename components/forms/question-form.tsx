'use client';

import { AskQuestionSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function QuestionForm() {
  const form = useForm({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  function handleCreateQuestion(values) {
    console.log(values);
  }
  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(handleCreateQuestion)}>
      Question Form
    </form>
  );
}
