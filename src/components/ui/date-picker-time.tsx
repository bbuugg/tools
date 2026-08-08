"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const pad = (n: number) => String(n).padStart(2, "0")

const parseValue = (value?: string): Date | undefined => {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

const toLocalISO = (d: Date, withSeconds: boolean) => {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = withSeconds
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${date}T${time}`
}

interface DatePickerTimeProps {
  /** ISO local string: "yyyy-MM-ddTHH:mm:ss" or "yyyy-MM-ddTHH:mm" */
  value?: string
  onChange?: (value: string) => void
  withSeconds?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePickerTime({
  value,
  onChange,
  withSeconds = true,
  placeholder = "选择日期时间",
  className,
  disabled,
}: DatePickerTimeProps) {
  const [open, setOpen] = React.useState(false)
  const date = parseValue(value)

  const timeValue = date
    ? withSeconds
      ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      : `${pad(date.getHours())}:${pad(date.getMinutes())}`
    : ""

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return
    const base = date ?? new Date()
    selected.setHours(
      base.getHours(),
      base.getMinutes(),
      withSeconds ? base.getSeconds() : 0,
    )
    onChange?.(toLocalISO(selected, withSeconds))
    setOpen(false)
  }

  const handleTimeChange = (timeStr: string) => {
    if (!timeStr) return
    const base = date ?? new Date()
    const [h, m, s] = timeStr.split(":")
    base.setHours(parseInt(h) || 0, parseInt(m) || 0, parseInt(s) || 0)
    onChange?.(toLocalISO(base, withSeconds))
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="flex-1 justify-between font-normal"
          >
            {date ? format(date, "yyyy-MM-dd") : placeholder}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date ?? new Date()}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step={withSeconds ? 1 : 60}
        value={timeValue}
        disabled={disabled}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="w-32 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </div>
  )
}
