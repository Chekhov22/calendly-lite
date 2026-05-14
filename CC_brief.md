# Бриф для Claude Code: MVP «Запись на консультацию»

> Это технический бриф для запуска Claude Code в параллельной сессии.
> Скопируй его как первый промпт. Цель — задеплоить рабочий MVP за ~80 минут.

---

## Контекст в одном абзаце

Делаем мини-MVP «упрощённый Calendly» для теста на роль автора курса по вайбкодингу.
Главная страница с описанием услуги и формой записи → страница подтверждения → admin-страница со списком записей.
Backend: Supabase (PostgreSQL + auto-REST). Frontend: Next.js 14 (App Router) + Tailwind + shadcn/ui.
Деплой: Vercel.
**Никакой авторизации, никаких слотов, никаких email-уведомлений** — сознательно вне MVP.

---

## Стек (финальный)

| Слой | Инструмент | Зачем |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Один из самых частых стеков курсов, легко деплоится на Vercel |
| Forms / валидация | react-hook-form + zod | Стандарт, чистая клиент+серверная валидация |
| Backend | Next.js Route Handlers (`app/api/*`) | Не плодим отдельный сервис, всё в одном репо |
| БД | Supabase Postgres | Бесплатный тариф, web-консоль, REST из коробки |
| Хостинг | Vercel | 1-click deploy из GitHub |

---

## Схема БД (Supabase SQL)

Запусти этот SQL в Supabase SQL Editor **до** старта кодинга:

```sql
-- 1. services (справочник, 3 строки)
create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration_min int not null,
  price_rub int
);

insert into services (title, duration_min, price_rub) values
  ('Карьерная консультация', 60, 5000),
  ('Стратегическая сессия', 90, 8000),
  ('Короткий созвон-знакомство', 30, 0);

-- 2. bookings (основная)
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_name text not null check (char_length(client_name) >= 2),
  client_email text not null check (client_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  service_id uuid not null references services(id) on delete restrict,
  booking_date date not null check (booking_date >= current_date),
  status text default 'new' check (status in ('new','confirmed','cancelled'))
);

create index bookings_created_at_idx on bookings (created_at desc);

-- 3. RLS: anon может только INSERT в bookings и SELECT из services
alter table bookings enable row level security;
alter table services enable row level security;

create policy "anon can insert bookings"
  on bookings for insert to anon
  with check (status = 'new');

create policy "anyone reads services"
  on services for select to anon, authenticated
  using (true);

-- SELECT по bookings оставляем только для service_role (используется на /admin с прямым ключом)
```

---

## API-эндпоинты

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/api/services` | Список услуг (`id`, `title`, `duration_min`, `price_rub`) |
| POST | `/api/bookings` | Создание заявки. Body: `{client_name, client_email, service_id, booking_date}`. Серверная валидация zod-схемой. Возвращает `{id}` или `{error}` |
| GET | `/api/bookings` | Список всех заявок для админ-страницы. Авторизация — header `x-admin-token` сверяется с `ADMIN_TOKEN` из env |

**Валидация (zod):**
```ts
const BookingSchema = z.object({
  client_name: z.string().min(2).max(100),
  client_email: z.string().email(),
  service_id: z.string().uuid(),
  booking_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(d => d >= new Date().toISOString().slice(0, 10), {
      message: "Date must be today or later",
    }),
});
```

---

## Страницы

1. **`/` — главная**
   - Заголовок: «Запишитесь на консультацию»
   - Подзаголовок: 2–3 предложения о ценности
   - Карточка-форма: ФИО, email, селект услуги (грузится с `/api/services`), дата (input type=date, min=today)
   - Кнопка «Записаться» (disabled при невалидной форме)
   - На submit: POST на `/api/bookings`, при успехе — redirect на `/thanks?id=...`

2. **`/thanks` — подтверждение**
   - Чек-mark / иконка
   - «Заявка №XXX принята. Мы свяжемся с вами на указанный email в течение 24 часов.»
   - Кнопка «Записаться ещё раз» → ведёт на `/`

3. **`/admin` — список заявок** *(опционально, но сделаем)*
   - Поле для ввода admin-токена (хранится в localStorage)
   - Таблица: дата создания, имя, email, услуга, желаемая дата, статус
   - Свежие сверху

---

## Переменные окружения (`.env.local` + Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # только на сервере, для GET /api/bookings
ADMIN_TOKEN=...                    # любая случайная строка ≥ 16 символов
```

---

## Acceptance Criteria (чек-лист на финал)

- [ ] На публичной ссылке открывается главная страница
- [ ] Форма требует валидный email и имя ≥ 2 символов (и на фронте, и на бэке)
- [ ] Дата не может быть в прошлом
- [ ] После submit → редирект на `/thanks` с номером заявки
- [ ] В Supabase в таблице `bookings` появилась новая строка
- [ ] `/admin` с правильным токеном показывает список
- [ ] `/admin` без токена / с неверным токеном — 401
- [ ] Лежит на Vercel, ссылка вида `*.vercel.app`
- [ ] Lighthouse mobile ≥ 80 по производительности (не критично, но хорошо иметь)

---

## Пошаговый план для Claude Code

1. `npx create-next-app@latest calendly-lite --typescript --tailwind --app --eslint --src-dir`
2. Установить shadcn/ui, react-hook-form, zod, @supabase/supabase-js
3. Сгенерировать страницы `/`, `/thanks`, `/admin`
4. Реализовать API routes
5. Поднять Supabase-проект, прогнать SQL выше
6. Прокинуть env-переменные локально
7. `vercel deploy` (или через GitHub)

---

## Серверная логика POST /api/bookings

Оберни вызов Supabase в try/catch. Если ошибка содержит код `23503` (foreign key violation) — возвращай `{error: "invalid service"}` со статусом 400, не пробрасывая текст ошибки Postgres.

```ts
try {
  const { data, error } = await supabase.from('bookings').insert(validated).select('id').single();
  if (error) {
    if (error.code === '23503') return Response.json({ error: 'invalid service' }, { status: 400 });
    throw error;
  }
  return Response.json({ id: data.id });
} catch {
  return Response.json({ error: 'internal error' }, { status: 500 });
}
```

---

## Известные подводные камни (предупредить CC сразу)

1. **Тип `date` в Postgres vs ISO-строка в JS** — на клиенте `input type=date` отдаёт `YYYY-MM-DD`, supabase-js принимает строкой, но если будешь форматировать через `new Date()`, получишь UTC-сдвиг. Хранить и передавать как строку `YYYY-MM-DD`.
2. **RLS на Supabase** — если забыл политики, anon-роль получит 401 на POST. Проверять `policies` в Supabase Dashboard.
3. **CORS в Vercel** — `app/api/*` сам по себе с одного origin, CORS не нужен. Если делаешь публичное API — нужны заголовки.
4. **Service role key — НИКОГДА в `NEXT_PUBLIC_*`**. Только серверные route handlers.
