import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const bookingNumber = id
    ? String(parseInt(id.split('-')[0], 16) % 1_000_000).padStart(6, '0')
    : '——';

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center rounded-3xl ring-0 border-0 shadow-sm">
        <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
          <CheckCircle className="text-green-500 w-14 h-14" strokeWidth={1.5} />

          <h1 className="text-2xl font-bold text-slate-700">Заявка принята!</h1>

          <p className="text-slate-500 leading-relaxed">
            Заявка №<span className="font-mono font-semibold text-slate-600">{bookingNumber}</span> принята.
            <br />
            Мы свяжемся с вами на указанный email в течение 24 часов.
          </p>

          <Link
            href="/"
            className="mt-2 inline-flex w-full h-12 items-center justify-center rounded-full text-base font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'rgb(74,93,117)' }}
          >
            Записаться ещё раз
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
