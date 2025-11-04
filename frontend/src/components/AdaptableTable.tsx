import React from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { camelCaseToRegular, formatter } from "../util/util";

interface AdaptableTableProps {
	data: Array<Record<string, unknown>>;
	borderColor?: string;
	formatNums?: boolean;
}

const PADDING = "p-3";

const IGNORED_HEADERS: Record<string, boolean> = {
	id: true,
};

const AdaptableTable = ({ data, borderColor, formatNums = true }: AdaptableTableProps) => {
	const columns = React.useMemo(() => {
		if (data.length == 0) return [];

		return Object.keys(data[0])
			.filter((key) => !IGNORED_HEADERS[key])
			.map((key) => ({
				header: camelCaseToRegular(key),
				accessorKey: key,
			})) satisfies ColumnDef<Record<string, unknown>>[];
	}, [data]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (!borderColor) borderColor = " border-zinc-800 ";

	return (
		<table className="w-full h-full table-auto">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className={`sticky top-0 border-b font-bold text-zinc-400 ${borderColor} ${PADDING}`}
							>
								{flexRender(
									typeof header.column
										.columnDef
										.header === "string"
										? camelCaseToRegular(
												header
													.column
													.columnDef
													.header
											)
										: header.column
												.columnDef
												.header,
									header.getContext()
								)}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id} className={`text-left ${borderColor}`}>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className={`border-t border-zinc-800 font-normal ${PADDING}`}
							>
								{(() => {
									const rawValue =
										cell.getValue();
									if (formatNums) {
										if (
											typeof rawValue ===
											"number"
										)
											return formatter.format(
												rawValue
											);

										return flexRender(
											cell.column
												.columnDef
												.cell,
											cell.getContext()
										);
									}
									if (
										typeof rawValue ===
										"number"
									)
										return rawValue.toLocaleString();

									return flexRender(
										cell.column
											.columnDef
											.cell,
										cell.getContext()
									);
								})()}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default AdaptableTable;
