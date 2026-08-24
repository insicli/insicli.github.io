import { useEffect, useRef } from "preact/hooks";
import { marked } from "marked";

marked.setOptions({
	gfm: true,
	breaks: false,
});

function renderMarkdown(markdown) {
	return marked.parse(markdown);
}

export default function TimelineNode({ entry }) {
	const nodeRef = useRef(null);

	useEffect(() => {
		const node = nodeRef.current;

		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			([entryState]) => {
				if (entryState.isIntersecting) {
					node.classList.add("is-visible");
				}
			},
			{
				rootMargin: "-12% 0px -30% 0px",
				threshold: 0.05,
			},
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<article ref={nodeRef} class={`timeline-node timeline-node--${entry.side}`}>
			<div class="timeline-node__meta">entry no. {entry.entryNumber}</div>

			{entry.heading && <h2>{entry.heading}</h2>}

			<div
				class="markdown"
				dangerouslySetInnerHTML={{
					__html: renderMarkdown(entry.body),
				}}
			/>
		</article>
	);
}
