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
