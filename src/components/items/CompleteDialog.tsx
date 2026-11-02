import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getTodayLocalDateString } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';

export interface CompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  onConfirm: (data: { completedAt: string; reflection: string }) => void;
}

export function CompleteDialog({
  isOpen,
  onClose,
  goalTitle,
  onConfirm,
}: CompleteDialogProps) {
  const today = getTodayLocalDateString();
  const [completedDate, setCompletedDate] = useState(today);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');

  const reduceMotion = useAppStore((s) => s.settings.reduceMotion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completedDate > today) {
      setError('Completion date cannot be in the future.');
      return;
    }

    // Trigger celebration if motion is enabled
    const prefersReducedMotion =
      reduceMotion === 'on' ||
      (reduceMotion === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#F7F6F7', '#D1D0D1', '#8A8B91', '#2F5D8A', '#FFFFFF'],
        });
      } catch {
        // Safe fallback if canvas is unavailable
      }
    }

    // Convert date YYYY-MM-DD into ISO timestamp
    const now = new Date();
    const parts = completedDate.split('-');
    const isoDate = new Date(
      parseInt(parts[0]!, 10),
      parseInt(parts[1]!, 10) - 1,
      parseInt(parts[2]!, 10),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    ).toISOString();

    onConfirm({
      completedAt: isoDate,
      reflection: reflection.trim(),
    });

    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Achieve Dream"
      description={`Celebrate achieving: "${goalTitle}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="date"
          label="Achievement Date"
          value={completedDate}
          max={today}
          onChange={(e) => {
            setCompletedDate(e.target.value);
            setError('');
          }}
          error={error}
          required
        />

        <Textarea
          label="Memory & Reflection (Optional)"
          placeholder="How did this feel? What surprised you or made it unforgettable? (up to 500 characters)"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          maxLength={500}
          rows={4}
          hint={`${reflection.length}/500 characters`}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-line/60">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="chrome" className="font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 mr-1" />
            Complete & Celebrate
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
