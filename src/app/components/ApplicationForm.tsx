'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

type FormData = {
  claimantEmployeeId: string;
  defendantEmployeeId: string;
  witnessEmployeeId?: string;
};

function ApplicationForm() {
  const form = useForm<FormData>({
    defaultValues: {
      claimantEmployeeId: '',
      defendantEmployeeId: '',
      witnessEmployeeId: '',
    },
  });

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/report/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          claimantEmployeeId: parseInt(data.claimantEmployeeId, 10),
          defendantEmployeeId: parseInt(data.defendantEmployeeId, 10),
          witnessEmployeeId: data.witnessEmployeeId ? parseInt(data.witnessEmployeeId, 10) : undefined,
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to start Report: ${res.statusText}`);
      }

      const { reportId, conversationId } = await res.json();
      router.push(`/report/${reportId}/conversation/${conversationId}`);
    } catch (error) {
      console.error('Error submitting form and starting the report:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Start a New Case
        </h2>
        <FormField
          name="claimantEmployeeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Employee ID</FormLabel>
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
              <FormLabel>Other Party's Employee ID</FormLabel>
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
              <FormLabel>Witness' Employee ID (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Start New Case
        </Button>
      </form>
    </Form>
  );
}

export default ApplicationForm;
