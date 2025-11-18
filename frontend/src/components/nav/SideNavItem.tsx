import { NavLink } from "react-router-dom";

export default function SideNavItem({
	to,
	icon,
	label,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<NavLink
			to={to}
			end
			className={({ isActive }) =>
				`flex items-center gap-3 p-2 rounded-md transition-colors ${
					isActive
						? "bg-zinc-900 font-medium text-white"
						: "text-gray-400 hover:text-white hover:bg-zinc-800"
				}`
			}
		>
			<span className="text-gray-400">{icon}</span>
			<span>{label}</span>
		</NavLink>
	);
}
