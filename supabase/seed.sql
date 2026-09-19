-- Сиды учебного контента. Пользователей Auth здесь не создаём — это делает
-- только Admin API / Dashboard (см. ROADMAP.md, Фаза 4). Идемпотентно:
-- фиксированные id + on conflict do nothing, можно применять повторно.
--
-- Уроки принадлежат группе, а не глобальному каталогу. Демо-группа нужна,
-- чтобы было куда повесить два примера урока; новые группы создаются пустыми.

insert into public.groups (id, name, level, meeting_url, evening_time)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Демо-группа',
  'A1',
  'https://zoom.us/j/000000000',
  '19:00 МСК'
)
on conflict (id) do nothing;

-- ── Урок 1: Present Simple (группа «Демо-группа») ──────────────────────────

insert into public.lessons (id, group_id, order_index, title, grammar_title, grammar_body, materials)
values (
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  1,
  'Daily Routines',
  'Present Simple',
  'Present Simple используется для регулярных действий, привычек и фактов.' || e'\n\n' ||
  'Утверждение: I/you/we/they + V; he/she/it + Vs/es.' || e'\n' ||
  'Отрицание: I/you/we/they + do not (don''t) + V; he/she/it + does not (doesn''t) + V.' || e'\n' ||
  'Вопрос: Do I/you/we/they + V...? Does he/she/it + V...?' || e'\n\n' ||
  'Маркеры времени: usually, often, sometimes, always, every day, on Mondays.',
  'Примеры: I wake up at 7 am. She works in an office. They don''t drink coffee. Do you go to the gym on weekends?'
)
on conflict (id) do nothing;

insert into public.lesson_plans (lesson_id, body)
values (
  '11111111-1111-1111-1111-111111111111',
  'План урока «Daily Routines» (Present Simple), 60 минут.' || e'\n\n' ||
  '1. Warm-up (5 мин). Спросить у группы: "What time do you usually wake up?" — 2-3 студента отвечают.' || e'\n' ||
  '2. Повторение правила (10 мин). Разобрать структуру Present Simple на доске: утверждение/отрицание/вопрос, окончание -s/-es у he/she/it.' || e'\n' ||
  '3. Работа со словарём (15 мин). Пройти по списку слов урока, каждое студент произносит и составляет свой пример.' || e'\n' ||
  '4. Практика (20 мин). Работа в парах: интервью "A typical day" — задать друг другу 5 вопросов с Do/Does о распорядке дня.' || e'\n' ||
  '5. Обратная связь (10 мин). Разобрать 2-3 частые ошибки, которые встретились в парной работе (обычно пропуск -s у he/she/it).'
)
on conflict (lesson_id) do nothing;

insert into public.vocabulary_items (id, lesson_id, word, translation, example, transcription, order_index)
values
  ('a1111111-1111-1111-1111-000000000001', '11111111-1111-1111-1111-111111111111', 'wake up', 'просыпаться', 'I wake up at 7 am every day.', '/weɪk ʌp/', 1),
  ('a1111111-1111-1111-1111-000000000002', '11111111-1111-1111-1111-111111111111', 'get dressed', 'одеваться', 'She gets dressed after breakfast.', '/get drest/', 2),
  ('a1111111-1111-1111-1111-000000000003', '11111111-1111-1111-1111-111111111111', 'commute', 'ездить на работу', 'He commutes to work by bus.', '/kəˈmjuːt/', 3),
  ('a1111111-1111-1111-1111-000000000004', '11111111-1111-1111-1111-111111111111', 'colleague', 'коллега', 'My colleague sits next to me.', '/ˈkɒliːg/', 4),
  ('a1111111-1111-1111-1111-000000000005', '11111111-1111-1111-1111-111111111111', 'schedule', 'расписание', 'What is your schedule for tomorrow?', '/ˈʃedjuːl/', 5),
  ('a1111111-1111-1111-1111-000000000006', '11111111-1111-1111-1111-111111111111', 'exhausted', 'изнурённый', 'I am exhausted after work.', '/ɪgˈzɔːstɪd/', 6),
  ('a1111111-1111-1111-1111-000000000007', '11111111-1111-1111-1111-111111111111', 'errand', 'поручение, дело', 'She runs errands on Saturdays.', '/ˈerənd/', 7),
  ('a1111111-1111-1111-1111-000000000008', '11111111-1111-1111-1111-111111111111', 'take a break', 'делать перерыв', 'We take a break at noon.', '/teɪk ə breɪk/', 8),
  ('a1111111-1111-1111-1111-000000000009', '11111111-1111-1111-1111-111111111111', 'household chores', 'домашние дела', 'He does household chores in the evening.', '/ˈhaʊshəʊld tʃɔːz/', 9),
  ('a1111111-1111-1111-1111-000000000010', '11111111-1111-1111-1111-111111111111', 'routine', 'распорядок', 'My morning routine never changes.', '/ruːˈtiːn/', 10),
  ('a1111111-1111-1111-1111-000000000011', '11111111-1111-1111-1111-111111111111', 'occasionally', 'иногда, время от времени', 'They occasionally work late.', '/əˈkeɪʒnəli/', 11)
on conflict (id) do nothing;

-- ── Урок 2: Present Continuous (группа «Демо-группа») ───────────────────────

insert into public.lessons (id, group_id, order_index, title, grammar_title, grammar_body, materials)
values (
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  2,
  'Right Now',
  'Present Continuous',
  'Present Continuous описывает действия, происходящие в момент речи, или временные ситуации.' || e'\n\n' ||
  'Структура: am/is/are + V-ing.' || e'\n' ||
  'Отрицание: am/is/are + not + V-ing.' || e'\n' ||
  'Вопрос: Am/Is/Are + подлежащее + V-ing...?' || e'\n\n' ||
  'Маркеры времени: now, right now, at the moment, currently, these days.' || e'\n' ||
  'Отличие от Present Simple: Present Simple — привычка/факт, Present Continuous — процесс сейчас.',
  'Примеры: I am writing an email right now. She is not listening to music. Are they working at the moment?'
)
on conflict (id) do nothing;

insert into public.lesson_plans (lesson_id, body)
values (
  '22222222-2222-2222-2222-222222222222',
  'План урока «Right Now» (Present Continuous), 60 минут.' || e'\n\n' ||
  '1. Warm-up (5 мин). Мимикой/жестом показать действие, группа угадывает и говорит: "You are cooking."' || e'\n' ||
  '2. Повторение правила (10 мин). Структура am/is/are + V-ing, сравнить с Present Simple из прошлого урока на конкретных парах примеров.' || e'\n' ||
  '3. Работа со словарём (15 мин). Каждое слово — студент составляет пример именно в Present Continuous.' || e'\n' ||
  '4. Практика (20 мин). Ролевая игра "Video call": один студент описывает, что происходит вокруг него прямо сейчас, партнёр задаёт уточняющие вопросы (Are you...? What is she doing?).' || e'\n' ||
  '5. Обратная связь (10 мин). Разобрать типичную ошибку — использование Present Continuous со статичными глаголами (know, like, want).'
)
on conflict (lesson_id) do nothing;

insert into public.vocabulary_items (id, lesson_id, word, translation, example, transcription, order_index)
values
  ('b2222222-2222-2222-2222-000000000001', '22222222-2222-2222-2222-222222222222', 'currently', 'в настоящее время', 'I am currently studying English.', '/ˈkʌrəntli/', 1),
  ('b2222222-2222-2222-2222-000000000002', '22222222-2222-2222-2222-222222222222', 'meanwhile', 'между тем, в это время', 'Meanwhile, she is preparing dinner.', '/ˈmiːnwaɪl/', 2),
  ('b2222222-2222-2222-2222-000000000003', '22222222-2222-2222-2222-222222222222', 'to interrupt', 'прерывать', 'Sorry to interrupt, are you busy right now?', '/ˌɪntəˈrʌpt/', 3),
  ('b2222222-2222-2222-2222-000000000004', '22222222-2222-2222-2222-222222222222', 'temporarily', 'временно', 'The office is temporarily closed.', '/ˈtemprərəli/', 4),
  ('b2222222-2222-2222-2222-000000000005', '22222222-2222-2222-2222-222222222222', 'to figure out', 'разбираться, выяснять', 'We are figuring out the schedule.', '/ˈfɪgər aʊt/', 5),
  ('b2222222-2222-2222-2222-000000000006', '22222222-2222-2222-2222-222222222222', 'in progress', 'в процессе', 'The project is still in progress.', '/ɪn ˈprəʊgres/', 6),
  ('b2222222-2222-2222-2222-000000000007', '22222222-2222-2222-2222-222222222222', 'to get used to', 'привыкать', 'I am getting used to the new schedule.', '/get juːzd tuː/', 7),
  ('b2222222-2222-2222-2222-000000000008', '22222222-2222-2222-2222-222222222222', 'nowadays', 'в наши дни', 'Nowadays, more people are working remotely.', '/ˈnaʊədeɪz/', 8),
  ('b2222222-2222-2222-2222-000000000009', '22222222-2222-2222-2222-222222222222', 'to keep doing', 'продолжать делать', 'She keeps interrupting the lesson.', '/kiːp ˈduːɪŋ/', 9),
  ('b2222222-2222-2222-2222-000000000010', '22222222-2222-2222-2222-222222222222', 'at the moment', 'в данный момент', 'He is not available at the moment.', '/æt ðə ˈməʊmənt/', 10)
on conflict (id) do nothing;

-- Текущий урок демо-группы — первый, только если этот урок действительно
-- принадлежит демо-группе (на уже заполненной базе уроки могли быть
-- привязаны миграцией к другой группе).
update public.groups
set current_lesson_id = '11111111-1111-1111-1111-111111111111'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and current_lesson_id is null
  and exists (
    select 1 from public.lessons l
    where l.id = '11111111-1111-1111-1111-111111111111'
      and l.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  );

-- ── Публичный тест на определение уровня ───────────────────────────────────

insert into public.placement_questions (id, order_index, question, options, level_hint)
values
  ('c0000000-0000-0000-0000-000000000001', 1, 'I ___ from Russia.', '{"choices": ["am", "is", "are", "be"], "correct": 0}', 'A1'),
  ('c0000000-0000-0000-0000-000000000002', 2, 'She ___ to work every day.', '{"choices": ["go", "goes", "going", "gone"], "correct": 1}', 'A1'),
  ('c0000000-0000-0000-0000-000000000003', 3, 'They ___ TV right now.', '{"choices": ["watch", "watches", "are watching", "watched"], "correct": 2}', 'A1'),
  ('c0000000-0000-0000-0000-000000000004', 4, 'There ___ a lot of books on the shelf.', '{"choices": ["is", "are", "be", "was"], "correct": 1}', 'A2'),
  ('c0000000-0000-0000-0000-000000000005', 5, 'I ___ my homework yesterday.', '{"choices": ["do", "did", "does", "done"], "correct": 1}', 'A2'),
  ('c0000000-0000-0000-0000-000000000006', 6, 'She has ___ this movie before.', '{"choices": ["see", "saw", "seen", "seeing"], "correct": 2}', 'A2'),
  ('c0000000-0000-0000-0000-000000000007', 7, 'If it rains, we ___ at home.', '{"choices": ["stay", "will stay", "stayed", "staying"], "correct": 1}', 'B1'),
  ('c0000000-0000-0000-0000-000000000008', 8, 'By next year, I ___ here for five years.', '{"choices": ["work", "will work", "will have worked", "worked"], "correct": 2}', 'B1'),
  ('c0000000-0000-0000-0000-000000000009', 9, 'She speaks English ___ than her brother.', '{"choices": ["good", "well", "better", "best"], "correct": 2}', 'B1'),
  ('c0000000-0000-0000-0000-000000000010', 10, 'I wish I ___ more time to travel.', '{"choices": ["have", "had", "will have", "having"], "correct": 1}', 'B2'),
  ('c0000000-0000-0000-0000-000000000011', 11, 'The report ___ by the team before the deadline.', '{"choices": ["finished", "was finished", "has finished", "finishes"], "correct": 1}', 'B2'),
  ('c0000000-0000-0000-0000-000000000012', 12, 'Hardly ___ he arrived when the phone rang.', '{"choices": ["had", "did", "has", "does"], "correct": 0}', 'B2')
on conflict (id) do nothing;
