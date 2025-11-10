interface ButtonProps {
	label?: string;
	icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	iconStyles?: string;
	isCenter?: boolean;
	isAccent?: boolean;
	isOnlyIcon?: boolean;
}

const Button = ({
	label,
	icon: IconComponent,
	iconStyles,
	isCenter,
	isAccent,
	isOnlyIcon,
}: ButtonProps) => {
	let baseClass =
		"transition-all rounded-sm p-2 cursor-pointer h-full w-full flex items-center flex-shrink-0 ";
	if (isCenter) baseClass += "justify-center ";
	if (isAccent) baseClass += "color-accent ";

	return (
		<>
			{isOnlyIcon ? (
				<div className={baseClass}>
					{IconComponent && (
						<IconComponent
							className={
								"h-5 w-5 flex-shrink-0 " +
								iconStyles
							}
						/>
					)}
				</div>
			) : (
				<div className={baseClass}>
					{IconComponent && (
						<IconComponent
							className={
								"mr-2 h-5 w-5 flex-shrink-0 " +
								iconStyles
							}
						/>
					)}
					{label}
				</div>
			)}
		</>
	);
};

export default Button;
