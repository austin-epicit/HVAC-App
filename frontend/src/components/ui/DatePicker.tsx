import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";

import "react-day-picker/dist/style.css";

type DatePickerProps = {
	value: Date | null;
	onChange: (date: Date | null) => void;
	disabled?: boolean;
	optional?: boolean;
};

export default function DatePicker({
	value,
	onChange,
	disabled,
	optional = false,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const [alignRight, setAlignRight] = useState(false);
	const [showAbove, setShowAbove] = useState(false);

	const buttonRef = useRef<HTMLButtonElement>(null);
	const calendarRef = useRef<HTMLDivElement>(null);

	// Provide default date for non-optional mode
	const displayValue = value || new Date();

	useEffect(() => {
		if (open && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const shouldAlignRight = rect.left > window.innerWidth / 2;

			const calendarHeight = 350;
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;

			const shouldShowAbove =
				spaceBelow < calendarHeight && spaceAbove > calendarHeight;

			setAlignRight(shouldAlignRight);
			setShowAbove(shouldShowAbove);
		}
	}, [open]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				open &&
				buttonRef.current &&
				calendarRef.current &&
				!buttonRef.current.contains(event.target as Node) &&
				!calendarRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	return (
		<div className="relative w-full">
			<style>{`
        .date-picker-dark {
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #18181b;
          --rdp-accent-background-color: #1e40af;
          color: #e4e4e7;
          border-radius: 4px;
          pointer-events: auto !important;
          overscroll-behavior: contain;
        }

        .date-picker-dark .rdp-month_caption {
          color: #e4e4e7;
          font-weight: 600;
          padding: 0 0 0 0.8rem;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .date-picker-dark .rdp-weekdays {
          padding: 0 0.25rem;
        }

        .date-picker-dark .rdp-weekday {
          color: #a1a1aa;
          font-size: 0.70rem;
          padding: 0.05rem 0.25rem;
        }

        .date-picker-dark .rdp-day_button {
          padding: 0.15rem 0.15rem;
          border-radius: 3px;
          font-size: 0.80rem;
          line-height: 1rem;
        }

        .date-picker-dark .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #27272a;
        }

        .date-picker-dark .rdp-day_button.rdp-day_selected {
          background-color: #3b82f6;
          color: white;
        }

        .date-picker-dark .rdp-day_button.rdp-day_today:not(.rdp-day_selected) {
          color: #3b82f6;
          font-weight: 600;
        }

        .date-picker-dark .rdp-day_button:disabled {
          opacity: 0.25;
        }

        .date-picker-dark .rdp-nav_button {
          padding: 0.2rem;
          border-radius: 4px;
          color: #e4e4e7;
        }

        .date-picker-dark .rdp-nav_button:hover {
          background-color: #27272a;
        }
      `}</style>

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
				<span
					className={
						optional && !value ? "text-zinc-500" : "text-white"
					}
				>
					{optional && !value
						? "Select date..."
						: format(displayValue, "MMMM dd, yyyy")}
				</span>
				<div className="flex items-center gap-1">
					{optional && value && !disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onChange(null);
							}}
							className="hover:bg-zinc-800 rounded p-0.5 transition-colors"
						>
							<X className="h-3 w-3 text-zinc-400 hover:text-white" />
						</button>
					)}
					<Calendar className="h-4 w-4 opacity-50" />
				</div>
			</button>

			{open && (
				<div
					ref={calendarRef}
					className={`
            absolute z-50 
            bg-zinc-950 border border-zinc-800 
            rounded-sm shadow-xl p-0.5
            ${alignRight ? "right-0" : "left-0"}
            ${showAbove ? "bottom-full mb-1" : "top-full mt-1"}
          `}
				>
					<DayPicker
						mode="single"
						selected={displayValue}
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
