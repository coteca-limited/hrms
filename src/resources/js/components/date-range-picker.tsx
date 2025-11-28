"use client";

import { useState } from "react";
import { DateRangePicker } from "react-date-range";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";

interface Props {
  value?: { startDate: Date; endDate: Date } | undefined;
  onChange: (range: { startDate: Date; endDate: Date } | undefined) => void;
}

export default function DatePickerWithRange({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const today = new Date();

  const handleSelect = (ranges: any) => {
    console.log(ranges);

    const { startDate, endDate } = ranges.selection;

    setSelectionCount((prevCount) => {
      const newCount = prevCount + 1;
      const newRange = { startDate, endDate };
      onChange(newRange);

      if (newCount === 2 && startDate && endDate) {
        setIsOpen(false);

        setTimeout(() => {
          setSelectionCount(0);
        }, 100);

        return newCount;
      }

      return newCount;
    });
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectionCount(0);
    }
  };

  const selectionRange = value && isValid(value.startDate) && isValid(value.endDate)
    ? {
        startDate: value.startDate,
        endDate: value.endDate,
        key: "selection",
      }
    : {
        startDate: today,
        endDate: today,
        key: "selection",
      };

  const label = value && isValid(value.startDate) && isValid(value.endDate)
    ? `${format(value.startDate, "MMM dd, yyyy")} - ${format(value.endDate, "MMM dd, yyyy")}`
    : `${format(today, "MMM dd, yyyy")} - ${format(today, "MMM dd, yyyy")}`;

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-[280px] justify-start text-sm font-normal"
        onClick={togglePicker}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <DateRangePicker
            ranges={[selectionRange]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            showDateDisplay={false}
            showMonthAndYearPickers={true}
            weekdayDisplayFormat="EE"
            rangeColors={["#3b82f6"]}
            color="#3b82f6"
            fixedHeight
          />
          <div className="flex justify-end p-3 border-t">
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setIsOpen(false);
            setSelectionCount(0);
          }}
        />
      )}
    </div>
  );
}
