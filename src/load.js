import matter from "@11ty/gray-matter";

const markdownFiles = import.meta.glob("/data/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});

function getFilename(path) {
	return path.split("/").pop();
}

function parseEntry(path, raw) {
	const filename = getFilename(path);
	const parsed = matter(raw);

	const numericPrefix = filename.match(/^\d+/);

	const order = Number.parseInt(numericPrefix?.[0] ?? "0", 10);

	return {
		id: filename.replace(/\.md$/, ""),
		filename,
		order,
		entryNumber: String(order).padStart(2, "0"),
		heading: parsed.data.heading ?? null,
		body: parsed.content.trim(),
		data: parsed.data,
	};
}

const parsedEntries = Object.entries(markdownFiles)
	.map(([path, raw]) => parseEntry(path, raw))
	.sort((a, b) => {
		if (a.order !== b.order) {
			return a.order - b.order;
		}

		return a.filename.localeCompare(b.filename);
	});

export const entries = parsedEntries.map((entry, index) => ({
	...entry,

	side: index % 2 === 0 ? "left" : "right",
}));

export default entries;
