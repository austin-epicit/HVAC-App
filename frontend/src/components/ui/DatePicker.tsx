import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

import "react-day-picker/dist/style.css";
import "./DatePicker.css"; 

type DatePickerProps = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
};

export default function DatePicker({
  label,
  value,
  onChange,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <p className="mb-1 mt-3 hover:color-accent text-sm font-medium">
          {label}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="
          border border-zinc-800 
          p-2 w-full 
          rounded-sm 
          text-left 
          flex items-center justify-between
          hover:bg-zinc-900 
          transition-all 
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <span>{format(value, "MMMM dd, yyyy")}</span>
        <Calendar className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className=" mt-1 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl p-0.5 inline-block">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange(date);
                setOpen(false);
              }
            }}
            className="date-picker-dark"
          />
        </div>
      )}
    </div>
  );
}
