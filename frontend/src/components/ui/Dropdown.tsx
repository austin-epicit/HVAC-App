import type { JSX } from "react";
import ArrowSvg from "../../assets/icons/arrow-down.svg?react";

interface DropdownProps {
	entries: JSX.Element | JSX.Element[];
	disabled?: boolean;
	refToApply?: React.RefObject<HTMLSelectElement | null>;
	defaultValue?: string;
	value?: string;
	onChange?: (newValue: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: boolean;
	className?: string;
	id?: string;
	name?: string;
	"aria-label"?: string;
	"aria-describedby"?: string;
}

const Dropdown = ({
	entries,
	disabled = false,
	refToApply,
	defaultValue,
	value,
	onChange,
	placeholder,
	required = false,
	error = false,
	className = "",
	id,
	name,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedby,
}: DropdownProps) => {
	const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newValue = e.target.value;
		if (onChange) {
			onChange(newValue);
		}
	};

	const selectClasses = [
		"appearance-none",
		"w-full",
		"h-full",
		"p-2",
		"bg-zinc-900",
		"text-white",
		"border-0",
		"outline-none",
		"focus:ring-0",
		"pr-8", // Space for arrow icon
		"rounded-sm",
		disabled && "cursor-not-allowed opacity-60",
		error && "text-red-300",
		"[&>option]:text-white",
		"[&>option]:bg-zinc-900",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const wrapperClasses = [
		"relative",
		"w-full",
		"border",
		error ? "border-red-500" : "border-zinc-700",
		"rounded-sm",
		"bg-zinc-900",
		"overflow-hidden", // Ensures border radius is visible on select
		disabled && "opacity-60",
		"transition-colors",
		!disabled && !error && "hover:border-zinc-600",
		!disabled && !error && "focus-within:border-blue-500",
	]
		.filter(Boolean)
		.join(" ");

	const arrowClasses = [
		"absolute",
		"top-1/2",
		"-translate-y-1/2",
		"right-2",
		"pointer-events-none",
		"text-white",
		"transition-opacity",
		disabled && "opacity-40",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={wrapperClasses}>
			<select
				className={selectClasses}
				defaultValue={defaultValue}
				value={value}
				disabled={disabled}
				ref={refToApply}
				onChange={handleOnChange}
				required={required}
				id={id}
				name={name}
				aria-label={ariaLabel}
				aria-describedby={ariaDescribedby}
				aria-invalid={error}
			>
				{placeholder && (
					<option value="" disabled hidden>
						{placeholder}
					</option>
				)}
				{entries}
			</select>
			<ArrowSvg className={arrowClasses} />
		</div>
	);
};

export default Dropdown;
