import type { ReactNode } from "react";

interface CardProps {
	title?: string;
	size?: "sm" | "md" | "lg";
	children: ReactNode;
	className?: string;
}

const sizeClasses = {
	sm: "p-4",
	md: "p-6",
	lg: "p-8",
};

export default function Card({ title, size = "md", children, className = "" }: CardProps) {
	return (
		<div
			className={`bg-zinc-900 rounded-xl shadow-md border border-[#3a3a3f] pt-3.5 ${sizeClasses[size]} ${className}`}
		>
			{title && (
				<h2 className="text-lg font-semibold mb-2 text-white">{title}</h2>
			)}
			{children}
		</div>
	);
}
