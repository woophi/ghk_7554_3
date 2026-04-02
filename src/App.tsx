import { AmountInput } from '@alfalab/core-components/amount-input/cssm';
import { Button } from '@alfalab/core-components/button/cssm';
import { Collapse } from '@alfalab/core-components/collapse/cssm';
import { Gap } from '@alfalab/core-components/gap/cssm';
import { PureCell } from '@alfalab/core-components/pure-cell/cssm';
import { Status } from '@alfalab/core-components/status/cssm';
import { Steps } from '@alfalab/core-components/steps/cssm';
import { Typography } from '@alfalab/core-components/typography/cssm';
import { BankMIcon } from '@alfalab/icons-glyph/BankMIcon';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import { ChevronLeftMIcon } from '@alfalab/icons-glyph/ChevronLeftMIcon';
import { ChevronUpMIcon } from '@alfalab/icons-glyph/ChevronUpMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { StarMIcon } from '@alfalab/icons-glyph/StarMIcon';
import { UsdMIcon } from '@alfalab/icons-glyph/UsdMIcon';
import { WorldMIcon } from '@alfalab/icons-glyph/WorldMIcon';
import { type ComponentType, useEffect, useState } from 'react';
import { answerSt } from './answer/style.css';
import hbImg from './assets/hb.png';
import pack1Img from './assets/pack1.png';
import pack2Img from './assets/pack2.png';
import pack3Img from './assets/pack3.png';
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

const hiw = [
  {
    title: 'Купи кэшбэк',
    desc: 'Выбери сумму и оплати картой. Баллы — мгновенно на счёт.',
  },
  {
    title: 'Выбери событие',
    desc: 'Финансы, политика, крипто. Поставь на исход.',
  },
  {
    title: 'Забери выигрыш',
    desc: 'Угадал — баллы умножились. Трать или ставь снова.',
  },
];

const faqs = [
  {
    question: 'Это реальные деньги?',
    answers: [
      'Баллы — это не рубли, но их можно вывести. Курс фиксированный: 1 балл = 0,8 ₽. Минимальная сумма вывода — от 300 баллов.',
    ],
  },
  {
    question: 'Когда поступят баллы?',
    answers: ['Сразу после оплаты — ещё до того, как закроешь экран. Никаких задержек и подтверждений.'],
  },
  {
    question: 'Это законно?',
    answers: [
      'Да. Баллы — это бонусная программа, а не ставки на деньги. Юридически это работает как кэшбэк: ты покупаешь баллы и тратишь их внутри сервиса. Никаких лицензий на азартные игры не требуется',
    ],
  },
];

const getMultiplierText = (value: number) => `x${value.toFixed(2)}`;

const getAnswerText = (answer: 'yes' | 'no') => {
  return answer === 'yes' ? 'Да' : 'Нет';
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
  const [view, setView] = useState<'feed' | 'buy'>('feed');
  const [GaugeChartComponent, setGaugeChartComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [sum, setSum] = useState(100);
  const [error, setError] = useState('');
  const [collapsedItems, setCollapsedItem] = useState<string[]>([]);

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

  const filteredQuestions = questions.filter(v => v.category === 'Финансы').slice(0, 3);

  if (view === 'buy') {
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
              setView('feed');
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

  return (
    <div className={appSt.page}>
      <div className={appSt.hero}>
        <Typography.Text tag="div" className={appSt.heroTitle}>
          Ставь кэшбэк на реальные события
        </Typography.Text>
        <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
          Нет кэшбэка? Купи прямо сейчас — и угадывай события. Угадал — получаешь больше баллов.
        </Typography.Text>
        <img src={hbImg} alt="Кэшбэк" height={219} width="100%" style={{ objectFit: 'contain' }} />
      </div>

      <section className={appSt.feedSection}>
        <div className={appSt.cardsList}>
          <Typography.Title tag="h2" view="small" weight="semibold" font="system">
            Активные события
          </Typography.Title>
          {filteredQuestions.map((question, index) => (
            <QuestionCard
              key={`${question.category}-${question.question}`}
              question={question}
              index={index}
              GaugeChartComponent={GaugeChartComponent}
              setAnswerData={() => {}}
            />
          ))}
        </div>
      </section>

      <div className={appSt.container}>
        <Typography.Title tag="h2" view="small" weight="semibold" font="system">
          Доступные пакеты
        </Typography.Title>
        <PureCell className={appSt.box}>
          <PureCell.Graphics verticalAlign="top">
            <img src={pack1Img} alt="pack1" width={32} height={40} />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small">Старт</Typography.Text>
              <Typography.Title tag="h3" view="medium" weight="medium" font="system">
                500 ₽
              </Typography.Title>
              <Typography.Text view="primary-small" color="positive">
                500 баллов
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>
        <PureCell className={appSt.box}>
          <PureCell.Graphics verticalAlign="top">
            <img src={pack2Img} alt="pack2" width={32} height={40} />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography.Text view="primary-small">Базовый</Typography.Text>

                <Status view="contrast" color="green" size={20} shape="rounded">
                  ⚡ Популярный
                </Status>
              </div>

              <Typography.Title tag="h3" view="medium" weight="medium" font="system">
                2 000 ₽
              </Typography.Title>
              <Typography.Text view="primary-small" color="positive">
                2 200 баллов (+200 бонус)
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>
        <PureCell className={appSt.box}>
          <PureCell.Graphics verticalAlign="top">
            <img src={pack3Img} alt="pack3" width={32} height={40} />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small">Про</Typography.Text>
              <Typography.Title tag="h3" view="medium" weight="medium" font="system">
                5 000 ₽
              </Typography.Title>
              <Typography.Text view="primary-small" color="positive">
                5 750 баллов (+750 бонус)
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>

        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h2" view="small" font="system" weight="medium">
          Как это работает
        </Typography.TitleResponsive>

        <Steps isVerticalAlign={true} interactive={false} className={appSt.stepStyle}>
          {hiw.map(item => (
            <span key={item.title}>
              <Typography.Text tag="p" defaultMargins={false} view="component-primary">
                {item.title}
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                {item.desc}
              </Typography.Text>
            </span>
          ))}
        </Steps>

        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h2" view="small" font="system" weight="medium">
          Дополнительные вопросы
        </Typography.TitleResponsive>

        {faqs.map((faq, index) => (
          <div key={index}>
            <div
              onClick={() => {
                window.gtag('event', '7554_bundle_faq', { faq: String(index + 1), var: 'var3' });

                setCollapsedItem(items =>
                  items.includes(String(index + 1))
                    ? items.filter(item => item !== String(index + 1))
                    : [...items, String(index + 1)],
                );
              }}
              className={appSt.rowSb}
            >
              <Typography.Text view="primary-medium" weight="medium">
                {faq.question}
              </Typography.Text>
              {collapsedItems.includes(String(index + 1)) ? (
                <div style={{ flexShrink: 0 }}>
                  <ChevronUpMIcon />
                </div>
              ) : (
                <div style={{ flexShrink: 0 }}>
                  <ChevronDownMIcon />
                </div>
              )}
            </div>
            <Collapse expanded={collapsedItems.includes(String(index + 1))}>
              {faq.answers.map((answerPart, answerIndex) => (
                <Typography.Text key={answerIndex} tag="p" defaultMargins={false} view="primary-medium">
                  {answerPart}
                </Typography.Text>
              ))}
            </Collapse>
          </div>
        ))}
      </div>
      <Gap size={96} />
      <div className={appSt.bottomBtn}>
        <Button
          view="primary"
          block
          onClick={() => {
            setView('buy');
          }}
        >
          Купить
        </Button>
      </div>
    </div>
  );
};
