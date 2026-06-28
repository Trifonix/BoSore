"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createSource, updateSource } from "@/lib/actions/sources";
import {
  sourceFormSchema,
  type SourceFormValues,
} from "@/lib/validations/source";
import type { SourceDTO } from "@/lib/data/sources";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: SourceDTO | null;
};

export function SourceDialog({ open, onOpenChange, source }: Props) {
  const isEdit = !!source;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SourceFormValues>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: {
      content: "",
      description: "",
      isPublic: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        content: source?.content ?? "",
        description: source?.description ?? "",
        isPublic: source?.isPublic ?? false,
      });
      setError(null);
    }
  }, [open, source, form]);

  function onSubmit(values: SourceFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && source) {
          await updateSource(source.id, values);
        } else {
          await createSource(values);
        }
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка сохранения");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать источник" : "Новый источник"}
          </DialogTitle>
          <DialogDescription>
            Краткое описание и оформление по ГОСТ для списка литературы.
            Публичные источники видны всем пользователям.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Описание</Label>
            <Textarea
              id="content"
              rows={4}
              placeholder="Кратко: о чём книга или статья"
              {...form.register("content")}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">По ГОСТ</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Библиографическое описание для списка литературы (название уже внутри)"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--border-dim)] bg-[rgba(0,0,0,0.2)] p-3">
            <div>
              <Label htmlFor="isPublic">Публичный источник</Label>
              <p className="text-xs text-muted-foreground">
                Будет виден в разделе «Публичные источники»
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={form.watch("isPublic")}
              onCheckedChange={(checked) => form.setValue("isPublic", checked)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
