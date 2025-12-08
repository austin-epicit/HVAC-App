import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

import "react-day-picker/dist/style.css";
import "./DatePicker.css"; 

type DatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
};

export default function DatePicker({ value, onChange, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      // If button is on the right half of the screen → align dropdown to the right
      const shouldAlignRight = rect.left > window.innerWidth / 2;

      setAlignRight(shouldAlignRight);
    }
  }, [open]);

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
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
        <div
          className={`
            absolute z-50 mt-1 
            bg-zinc-950 border border-zinc-800 
            rounded-sm shadow-xl p-0.5
            ${alignRight ? "right-0" : "left-0"}
          `}
        >
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
