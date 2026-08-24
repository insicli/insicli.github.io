export default function TimelineConnector({ entry, isLast }) {
	return (
		<div
			class={`timeline-connector timeline-connector--${entry.side} ${
				isLast ? "timeline-connector--last" : ""
			}`}
			aria-hidden="true"
		>
			<span class="timeline-connector__tick" />

			<span class="timeline-connector__node" />
		</div>
	);
}
