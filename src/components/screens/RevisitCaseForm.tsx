'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormData = {
  caseId: string;
  employeeId: string;
};

export default function RevisitCaseForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      caseId: '',
      employeeId: '',
    },
  });

  const onSubmit = async ({ caseId, employeeId }: FormData) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/report/add-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: caseId,
          employeeId: parseInt(employeeId, 10),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.statusText}`);
      }

      const { conversationId } = await res.json();
      router.push(`/report/${caseId}/conversation/${conversationId}`);
    } catch (err) {
      console.error(err);
      // You can swap this for a toast if you have one
      alert('Failed to create conversation. Please check the Case ID and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-bgCanvas text-textPrimary p-8 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <h2 className="text-lg font-bold text-center">Revisit an Existing Case</h2>

        <FormField
          name="caseId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-textMuted">Case ID</FormLabel>
              <FormControl>
                <Input id="caseId" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="employeeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-textMuted">Your Employee ID</FormLabel>
              <FormControl>
                <Input id="employeeId" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-brand text-buttonText"
          disabled={submitting}
        >
          {submitting ? 'Starting…' : 'Start Conversation'}
        </Button>
      </form>
    </Form>
  );
}
