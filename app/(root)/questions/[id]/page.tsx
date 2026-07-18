import { RouteParams } from '@/types/global';

export const metadata = {
  title: 'Question Details',
};

export default async function QuestionDetails({ params }: RouteParams) {
  const { id } = await params;

  return <div>Question details ID: {id}</div>;
}
