import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/utils/supabase/admin';

const today = new Date().toISOString().slice(0, 10);

const BookingSchema = z.object({
  client_name: z.string().min(2, 'Минимум 2 символа').max(100),
  client_email: z.string().email('Невалидный email'),
  service_id: z.string().uuid('Выберите услугу'),
  booking_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты')
    .refine((d) => d >= today, 'Дата не может быть в прошлом'),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({ ...parsed.data, status: 'new' })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ error: 'invalid service' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
