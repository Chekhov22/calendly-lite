import { supabase } from '@/utils/supabase/client';
import { BookingForm, type Service } from '@/components/booking-form';

async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, title, duration_min, price_rub');
  if (error) {
    console.error('Failed to load services:', error.message);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-700">
          Запишитесь на консультацию
        </h1>
        <p className="mt-3 text-slate-500 leading-relaxed">
          Выберите формат и удобную дату.
          <br />
          Свяжемся с вами в течение 24 часов для подтверждения времени.
        </p>
      </div>

      <BookingForm services={services} />
    </main>
  );
}
