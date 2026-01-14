export const camelCaseToRegular = (str: string) => {
	return str
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/^./, (match) => match.toUpperCase());
};

export const addSpacesToCamelCase = (text: string) => {
	if (!text) return "";
	return text.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
};

export const formatter = new Intl.NumberFormat(navigator.languages, {
	notation: "compact",
	compactDisplay: "short",
});

export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const formatDateTime = (date: Date | string) => {
	const d = typeof date === "string" ? new Date(date) : date;
	return (
		d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}) +
		" at " +
		d.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		})
	);
};

export const formatDate = (date: Date | string) => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export const formatTime = (date: Date | string) => {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
};
