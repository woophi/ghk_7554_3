import { AmountInput } from '@alfalab/core-components/amount-input/cssm';
import { BottomSheet } from '@alfalab/core-components/bottom-sheet/cssm';
import { Button } from '@alfalab/core-components/button/cssm';
import { PureCell } from '@alfalab/core-components/pure-cell/cssm';
import { Typography } from '@alfalab/core-components/typography/cssm';
import { BankMIcon } from '@alfalab/icons-glyph/BankMIcon';
import { ChevronLeftMIcon } from '@alfalab/icons-glyph/ChevronLeftMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { InformationCircleLineMIcon } from '@alfalab/icons-glyph/InformationCircleLineMIcon';
import { StarMIcon } from '@alfalab/icons-glyph/StarMIcon';
import { UsdMIcon } from '@alfalab/icons-glyph/UsdMIcon';
import { WorldMIcon } from '@alfalab/icons-glyph/WorldMIcon';
import { type ComponentType, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AnswerScreen } from './answer/AnswerScreen';
import { answerSt } from './answer/style.css';
import rubIcon from './assets/rub.png';
import { QuestionGauge } from './components/QuestionGauge';
import { useStocksData } from './hooks/useStocksData';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import type { QuestionItem } from './types';
import { getAnswerTone } from './utils/tone';
const CATEGORY_ALL = 'Все';
const LINK =
  'alfabank://sdui_screen?screenName=InvestmentLongread&fromCurrent=true&shouldUseBottomSafeArea=true&endpoint=v1/invest-main-screen-view/investment-longread/98955%3flocation=AM%26campaignCode=GH';
const categoryIcons = {
  [CATEGORY_ALL]: StarMIcon,
  Финансы: UsdMIcon,
  Политика: WorldMIcon,
  Культура: BankMIcon,
} as const;

const getMultiplierText = (value: number) => `x${value.toFixed(2)}`;

const getAnswerText = (answer: 'yes' | 'no') => {
  return answer === 'yes' ? 'Да' : 'Нет';
};

type CategoryPillProps = {
  category: string;
  isActive: boolean;
  onClick: () => void;
};

const CategoryPill = ({ category, isActive, onClick }: CategoryPillProps) => {
  const Icon = categoryIcons[category as keyof typeof categoryIcons] ?? StarMIcon;

  return (
    <button className={isActive ? appSt.filterButtonActive : appSt.filterButton} type="button" onClick={onClick}>
      <Icon className={isActive ? appSt.filterIconActive : appSt.filterIcon} />
      <Typography.Text tag="span" view="primary-small" color={isActive ? 'primary-inverted' : 'secondary'}>
        {category}
      </Typography.Text>
    </button>
  );
};

type AnswerButtonProps = {
  question: QuestionItem;
  answer: 'yes' | 'no';
  setAnswerData: React.Dispatch<React.SetStateAction<{ question: QuestionItem; answer: 'yes' | 'no' } | null>>;
};

const AnswerButton = ({ question, answer, setAnswerData }: AnswerButtonProps) => {
  const tone = getAnswerTone(question, answer);
  const multiplier = answer === 'yes' ? question.yesX : question.noX;
  const isOnFire = question.onFire === answer;

  return (
    <button
      className={tone === 'positive' ? appSt.answerButtonPositive : appSt.answerButtonNegative}
      type="button"
      onClick={() => {
        window.gtag('event', '7554_answer_click', { question: question.question, answer, var: 'var3' });
        setAnswerData({ question, answer });
      }}
    >
      <Typography.Text tag="span" view="primary-medium" weight="bold" color={tone === 'positive' ? 'positive' : 'negative'}>
        {getAnswerText(answer)}
      </Typography.Text>

      <span className={tone === 'positive' ? appSt.multiplierPositive : appSt.multiplierNegative}>
        <Typography.Text
          tag="span"
          view="secondary-small"
          weight="bold"
          color={tone === 'positive' ? 'positive' : 'negative'}
        >
          {getMultiplierText(multiplier)}
        </Typography.Text>
        {isOnFire ? <FlameMIcon className={appSt.fireIcon} /> : null}
      </span>
    </button>
  );
};

const QuestionCard = ({
  question,
  index,
  GaugeChartComponent,
  setAnswerData,
}: {
  question: QuestionItem;
  index: number;
  GaugeChartComponent: ComponentType<Record<string, unknown>> | null;
  setAnswerData: React.Dispatch<React.SetStateAction<{ question: QuestionItem; answer: 'yes' | 'no' } | null>>;
}) => {
  const Icon = categoryIcons[question.category as keyof typeof categoryIcons] ?? StarMIcon;

  return (
    <article className={appSt.card}>
      <div className={appSt.cardHead}>
        <div className={appSt.categoryTag}>
          <Icon className={appSt.categoryTagIcon} />
          <Typography.Text tag="span" view="secondary-small" weight="medium">
            {question.category}
          </Typography.Text>
        </div>

        <div className={appSt.questionRow}>
          <Typography.Text tag="div" view="primary-medium" weight="medium" className={appSt.questionTitle}>
            {question.question}
          </Typography.Text>

          <QuestionGauge
            id={`gauge-${index}`}
            percentage={question.graphData.percentage}
            type={question.graphData.type}
            GaugeChartComponent={GaugeChartComponent}
          />
        </div>
      </div>

      <div className={appSt.answersRow}>
        <AnswerButton question={question} answer="yes" setAnswerData={setAnswerData} />
        <AnswerButton question={question} answer="no" setAnswerData={setAnswerData} />
      </div>
    </article>
  );
};

export const App = () => {
  const { questions } = useStocksData();
  const [openBs, setOpenBs] = useState(false);
  const [view, setView] = useState<'feed' | 'answer' | 'buy' | 'buy-fast'>('feed');
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);
  const [GaugeChartComponent, setGaugeChartComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [answerData, setAnswerData] = useState<{
    question: QuestionItem;
    answer: 'yes' | 'no';
  } | null>(null);
  const [sum, setSum] = useState(100);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }

    window.gtag('event', '7554_selection_impression', { var: 'var3' });
  }, []);

  useEffect(() => {
    let isMounted = true;

    import('react-gauge-chart')
      .then(module => {
        const candidate =
          typeof module === 'function'
            ? module
            : typeof module.default === 'function'
              ? module.default
              : typeof (module.default as { default?: unknown } | undefined)?.default === 'function'
                ? (module.default as unknown as { default: ComponentType<Record<string, unknown>> }).default
                : null;

        if (!candidate) {
          console.error('GaugeChart module has unsupported shape', module);
          return;
        }

        if (isMounted) {
          setGaugeChartComponent(() => candidate as ComponentType<Record<string, unknown>>);
        }
      })
      .catch(error => {
        console.error('Failed to load react-gauge-chart', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeInput = (_: React.ChangeEvent<HTMLInputElement> | null, { value }: { value: number | null }) => {
    if (error) {
      setError('');
    }
    setSum(value ?? 0);
  };

  const submit = () => {
    window.location.replace(LINK);
  };

  const categories = [CATEGORY_ALL, ...new Set(questions.map(({ category }) => category))];
  const filteredQuestions =
    activeCategory === CATEGORY_ALL ? questions : questions.filter(({ category }) => category === activeCategory);

  if (view === 'buy-fast' || view === 'buy') {
    return (
      <div>
        <div className={appSt.container}>
          <Typography.Title
            tag="h1"
            view="medium"
            weight="semibold"
            font="system"
            style={{
              marginTop: '1rem',
            }}
          >
            Покупка кэшбека
          </Typography.Title>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Счёт списания
            </Typography.Text>

            <div className={appSt.bannerAccount}>
              <img src={rubIcon} width={48} height={48} alt="rubIcon" />

              <Typography.Text view="primary-small" weight="medium">
                Текущий счёт
              </Typography.Text>
            </div>
          </div>

          <div>
            <AmountInput
              label="Введите сумму кэшбека"
              labelView="outer"
              value={sum}
              error={error}
              onChange={handleChangeInput}
              block
              minority={1}
              bold={false}
              hint="1 кэшбек = 1 ₽"
              // @ts-ignore
              currency="123"
            />
          </div>
        </div>

        <div className={appSt.bottomBtn}>
          <button
            type="button"
            className={answerSt.backButton}
            onClick={() => {
              if (view === 'buy-fast') {
                setView('feed');
              } else {
                setView('answer');
              }
            }}
          >
            <ChevronLeftMIcon className={answerSt.backIcon} />
          </button>
          <Button
            type="button"
            block
            className={answerSt.actionButton}
            view="primary"
            hint={
              <Typography.Text tag="span" view="secondary-large" color="primary-inverted">
                {sum.toLocaleString('ru-RU')} кешбэка = {sum.toLocaleString('ru-RU')} ₽
              </Typography.Text>
            }
            onClick={submit}
          >
            <Typography.Text tag="span" view="primary-medium" color="primary-inverted" weight="medium">
              Купить
            </Typography.Text>
          </Button>
        </div>
      </div>
    );
  }

  if (answerData) {
    return (
      <>
        <AnswerScreen
          question={answerData.question}
          answer={answerData.answer}
          GaugeChartComponent={GaugeChartComponent}
          onBack={() => setAnswerData(null)}
          setAnswerData={setAnswerData}
          onSubmit={() => {
            setOpenBs(true);
          }}
        />
        <BottomSheet
          open={openBs}
          onClose={() => {
            setOpenBs(false);
          }}
          contentClassName={appSt.btmContent}
          actionButton={
            <Button
              view="secondary"
              block
              onClick={() => {
                setOpenBs(false);
                setView('buy');
              }}
            >
              Купить кешбэк
            </Button>
          }
        >
          <div className={appSt.container}>
            <Typography.Title tag="h3" view="small" weight="semibold" font="system">
              Недостаточно кешбэка
            </Typography.Title>
            <Typography.Text view="primary-medium">
              Для ставки 100 кешбэка не хватает. Докупите кешбэк, чтобы продолжить.
            </Typography.Text>
          </div>
        </BottomSheet>
      </>
    );
  }

  return (
    <div className={appSt.page}>
      <div className={appSt.hero}>
        <Typography.Text tag="div" className={appSt.heroTitle}>
          Используй свой кешбэк
        </Typography.Text>
        <Typography.Text tag="p" view="primary-medium" defaultMargins={false} className={appSt.heroText}>
          Ставь кешбэк на реальные события. Угадал — получаешь больше баллов.
        </Typography.Text>

        <PureCell className={appSt.box}>
          <PureCell.Graphics verticalAlign="top">
            <InformationCircleLineMIcon color="#BD6A0F" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Title
                tag="h5"
                view="xsmall"
                weight="medium"
                font="system"
                style={{
                  color: '#BD6A0F',
                }}
              >
                Недостаточно кешбэка
              </Typography.Title>
              <Typography.Text
                style={{ color: '#EA8313', margin: '8px 0 12px' }}
                view="secondary-large"
                tag="p"
                defaultMargins={false}
              >
                Для ставки 100 кешбэка не хватает. Докупите кешбэк, чтобы продолжить.
              </Typography.Text>
              <Button
                size={32}
                block
                style={{ backgroundColor: '#BD6A0F', color: '#FFFFFF' }}
                onClick={() => {
                  setView('buy-fast');
                }}
              >
                Купить кешбэк
              </Button>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>
      </div>

      <section className={appSt.feedSection}>
        <div className={appSt.filtersWrap}>
          <Swiper slidesPerView="auto" spaceBetween={8}>
            {categories.map(category => (
              <SwiperSlide key={category} className={appSt.filterSlide}>
                <CategoryPill
                  category={category}
                  isActive={category === activeCategory}
                  onClick={() => setActiveCategory(category)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={appSt.cardsList}>
          {filteredQuestions.map((question, index) => (
            <QuestionCard
              key={`${question.category}-${question.question}`}
              question={question}
              index={index}
              GaugeChartComponent={GaugeChartComponent}
              setAnswerData={setAnswerData}
            />
          ))}

          {filteredQuestions.length === 0 ? (
            <div className={appSt.emptyState}>
              <Typography.Text tag="p" view="primary-medium" defaultMargins={false} color="secondary">
                Загружаем вопросы...
              </Typography.Text>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
