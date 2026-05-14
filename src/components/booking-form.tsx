'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Service = {
  id: string;
  title: string;
  duration_min: number;
  price_rub: number | null;
};

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

type BookingFormValues = z.infer<typeof BookingSchema>;

export function BookingForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      client_name: '',
      client_email: '',
      service_id: '',
      booking_date: '',
    },
    mode: 'onTouched',
  });

  async function onSubmit(values: BookingFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Ошибка при отправке');
        return;
      }

      router.push(`/thanks?id=${json.id}`);
    } catch {
      toast.error('Нет соединения с сервером');
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatServiceLabel = (s: Service) => {
    const price = !s.price_rub ? 'Бесплатно' : `${s.price_rub} ₽`;
    return `${s.title} · ${s.duration_min} мин · ${price}`;
  };

  const isFormValid = form.formState.isValid;

  return (
    <Card className="w-full max-w-md mx-auto rounded-3xl ring-0 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Заполните заявку</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ivan@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Услуга</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) => {
                            if (!value)
                              return <span className="text-muted-foreground">Выберите формат</span>;
                            const s = services.find((srv) => srv.id === value);
                            return s ? formatServiceLabel(s) : value;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} label={formatServiceLabel(s)}>
                          {formatServiceLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="booking_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата</FormLabel>
                  <FormControl>
                    <Input type="date" min={today} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              style={{
                backgroundColor: isFormValid && !isSubmitting ? 'rgb(74,93,117)' : 'rgb(147,167,196)',
                color: '#ffffff',
              }}
              className="w-full rounded-full h-12 text-base font-semibold transition-colors disabled:opacity-100 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Отправка…
                </span>
              ) : (
                'Записаться'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
