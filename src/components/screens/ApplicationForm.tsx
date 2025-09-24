// src/components/screens/ApplicationForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormData = {
  claimantEmployeeId: string;
  defendantEmployeeId: string;
  witnessEmployeeId?: string;
};

export default function ApplicationForm() {
  const router = useRouter();
  const form = useForm<FormData>({
    defaultValues: {
      claimantEmployeeId: '',
      defendantEmployeeId: '',
      witnessEmployeeId: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/report/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          claimantEmployeeId: parseInt(data.claimantEmployeeId, 10),
          defendantEmployeeId: parseInt(data.defendantEmployeeId, 10),
          witnessEmployeeId: data.witnessEmployeeId
            ? parseInt(data.witnessEmployeeId, 10)
            : undefined,
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);

      const { reportId, conversationId } = await res.json();
      router.push(`/report/${reportId}/conversation/${conversationId}`);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-bgCanvas text-textPrimary p-8 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <h2 className="text-lg font-bold text-center">Start a New Case</h2>

        <FormField
          name="claimantEmployeeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-textMuted">
                Your Employee ID
              </FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="defendantEmployeeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-textMuted">
                Other Party's Employee ID
              </FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="witnessEmployeeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-textMuted">
                Witness' Employee ID (Optional)
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-brand text-buttonText">
          Start New Case
        </Button>
      </form>
    </Form>
  );
}
