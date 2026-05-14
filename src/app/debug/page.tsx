import { supabase } from '@/utils/supabase/client';

export default async function DebugPage() {
  const { data: services, error } = await supabase
    .from('services')
    .select('id, title, duration_min, price_rub');

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-red-600 font-bold">Supabase error</h1>
        <pre className="mt-4 text-sm bg-red-50 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase sanity check ✓</h1>
      <p className="text-gray-500 mb-6">Список услуг из таблицы services:</p>
      <ul className="space-y-3">
        {services?.map((s) => (
          <li key={s.id} className="border rounded p-4">
            <p className="font-semibold">{s.title}</p>
            <p className="text-sm text-gray-500">
              {s.duration_min} мин · {s.price_rub === 0 ? 'Бесплатно' : `${s.price_rub} ₽`}
            </p>
          </li>
        ))}
      </ul>
      {(!services || services.length === 0) && (
        <p className="text-yellow-600">Таблица пуста или RLS блокирует SELECT</p>
      )}
    </main>
  );
}
