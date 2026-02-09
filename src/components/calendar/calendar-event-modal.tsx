"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS } from "@/lib/constants";
import { createEvent, updateEvent, deleteEvent } from "@/actions/calendar-actions";
import { toast } from "sonner";
import type { CalendarEvent } from "@/types";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
  endDate: z.date().optional().nullable(),
  allDay: z.boolean(),
  color: z.string(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface CalendarEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onSaved?: () => void;
}

export function CalendarEventModal({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSaved,
}: CalendarEventModalProps) {
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const locale = useLocale();
  const dateFnsLocale = locale === "zh" ? zhCN : enUS;

  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: defaultDate ?? new Date(),
      endDate: null,
      allDay: true,
      color: "#6366f1",
    },
  });

  const watchDate = watch("date");
  const watchEndDate = watch("endDate");
  const watchAllDay = watch("allDay");
  const watchColor = watch("color");

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (event) {
        reset({
          title: event.title,
          description: event.description ?? "",
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : null,
          allDay: event.allDay,
          color: event.color,
        });
      } else {
        reset({
          title: "",
          description: "",
          date: defaultDate ?? new Date(),
          endDate: null,
          allDay: true,
          color: "#6366f1",
        });
      }
      setShowDeleteConfirm(false);
    }
  }, [open, event, defaultDate, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (isEditing && event) {
        await updateEvent(event.id, {
          title: data.title,
          description: data.description || null,
          date: data.date,
          endDate: data.endDate || null,
          allDay: data.allDay,
          color: data.color,
        });
        toast.success(t("eventUpdated"));
      } else {
        await createEvent({
          title: data.title,
          description: data.description || null,
          date: data.date,
          endDate: data.endDate || null,
          allDay: data.allDay,
          color: data.color,
        });
        toast.success(t("eventCreated"));
      }
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id);
      toast.success(t("eventDeleted"));
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editEvent") : t("newEvent")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Input
              {...register("title")}
              placeholder={t("eventTitle")}
              autoFocus
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <Textarea
            {...register("description")}
            placeholder={t("eventDescriptionPlaceholder")}
            className="min-h-[60px]"
          />

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t("eventDate")}</label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !watchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {watchDate
                    ? format(watchDate, "PPP", { locale: dateFnsLocale })
                    : t("eventDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchDate}
                  onSelect={(date) => {
                    if (date) {
                      setValue("date", date, { shouldValidate: true });
                      setDatePickerOpen(false);
                    }
                  }}
                  defaultMonth={watchDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t("eventEndDate")}</label>
            <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !watchEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {watchEndDate
                    ? format(watchEndDate, "PPP", { locale: dateFnsLocale })
                    : t("eventEndDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchEndDate ?? undefined}
                  onSelect={(date) => {
                    setValue("endDate", date ?? null, { shouldValidate: true });
                    setEndDatePickerOpen(false);
                  }}
                  defaultMonth={watchEndDate ?? watchDate}
                />
              </PopoverContent>
            </Popover>
            {watchEndDate && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="self-start"
                onClick={() => setValue("endDate", null)}
              >
                {tc("cancel")}
              </Button>
            )}
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="allDay"
              checked={watchAllDay}
              onCheckedChange={(checked) =>
                setValue("allDay", checked === true)
              }
            />
            <label htmlFor="allDay" className="text-sm cursor-pointer">
              {t("allDay")}
            </label>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t("eventColor")}</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={cn(
                    "size-6 rounded-full transition-all",
                    watchColor === color
                      ? "ring-2 ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  )}
                  style={{
                    backgroundColor: color,
                    // @ts-expect-error -- Tailwind ring color via CSS custom prop
                    "--tw-ring-color": color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isEditing ? (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-destructive">
                      {t("deleteConfirm")}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      {tc("delete")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {tc("cancel")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="size-4" />
                    {t("deleteEvent")}
                  </Button>
                )}
              </div>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {tc("save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
