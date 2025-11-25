import type { ReactNode } from "react";

interface CardProps {
	title?: string;
	headerAction?: ReactNode;
	children: ReactNode;
	className?: string;
}

export default function Card({ title, headerAction, children, className = "" }: CardProps) {
	return (
		<div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 ${className}`}>
			{title && (
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-white">{title}</h3>
					{headerAction && <div>{headerAction}</div>}
				</div>
			)}
			{children}
		</div>
	);
}