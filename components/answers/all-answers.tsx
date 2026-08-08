import { AnswerFilters } from '@/constants/filters';
import { EMPTY_ANSWERS } from '@/constants/states';
import { ActionResponse, AnswerParams } from '@/types/global';
import AnswerCard from '../cards/answer-card';
import DataRenderer from '../common/data-renderer';
import CommonFilter from '../filters/common-filter';

interface Props extends ActionResponse<AnswerParams[]> {
  totalAnswers: number;
}

export default function AllAnswers({
  data,
  error,
  success,
  totalAnswers,
}: Props) {
  return (
    <div className="mt-11">
      <div className="max-xs:flex-col max-xs:items-start flex justify-between gap-5 sm:items-center">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? 'Answer' : 'Answers'}
        </h3>
        <CommonFilter
          filters={AnswerFilters}
          otherClasses="sm:min-w-32"
          containerClasses="max-xs:w-full"
        />
      </div>

      <DataRenderer
        data={data}
        error={error}
        success={success}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)
        }
      />
    </div>
  );
}
