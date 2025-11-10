import type { JSX } from "react";
import ArrowSvg from "../../assets/icons/arrow-down.svg?react";

interface DropdownProps {
	entries: JSX.Element | JSX.Element[];
	disabled?: boolean;
	refToApply?: React.RefObject<HTMLSelectElement | null>;
	defaultValue?: string;
	onChange?: (newValue: string) => void;
}

const Dropdown = ({ entries, disabled, refToApply, defaultValue, onChange }: DropdownProps) => {
	const handleOnChange = (newValue: string) => {
		if (onChange) onChange(newValue);
	};

	let selectStyles = "appearance-none w-full h-full p-2";
	if (disabled) selectStyles += " bg-gray-100 cursor-not-allowed";

	return (
		<div className="relative border border-gray-300 w-full rounded-sm">
			<select
				className={selectStyles}
				defaultValue={defaultValue}
				disabled={disabled}
				ref={refToApply}
				onChange={(e) => handleOnChange(e.target.value)}
			>
				{entries}
			</select>
			<ArrowSvg className="absolute top-2 right-2 pointer-events-none" />
		</div>
	);
};

export default Dropdown;
