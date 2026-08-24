import { useEffect, useRef, useState } from "preact/hooks";

import entries from "../load";

import TimelineConnector from "./connector";
import TimelineNode from "./node";

function smoothScrollTo(targetY, duration = 1100) {
	const startY = window.scrollY;
	const distance = targetY - startY;

	if (Math.abs(distance) < 1) {
		return;
	}

	const startTime = performance.now();

	const ease = (t) => {
		if (t < 0.5) {
			return 4 * t * t * t;
		}

		return 1 - Math.pow(-2 * t + 2, 3) / 2;
	};

	const animate = (currentTime) => {
		const elapsed = currentTime - startTime;

		const progress = Math.min(elapsed / duration, 1);

		const easedProgress = ease(progress);

		window.scrollTo(0, startY + distance * easedProgress);

		if (progress < 1) {
			requestAnimationFrame(animate);
		}
	};

	requestAnimationFrame(animate);
}

function setupSmoothKeyboardScrolling() {
	const handleKeyDown = (event) => {
		if (event.key !== "PageDown" && event.key !== "PageUp") {
			return;
		}

		const target = event.target;

		if (
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target?.isContentEditable
		) {
			return;
		}

		event.preventDefault();

		const amount = window.innerHeight * 0.82;

		const direction = event.key === "PageDown" ? 1 : -1;

		const targetY = window.scrollY + amount * direction;

		const maxScroll =
			document.documentElement.scrollHeight - window.innerHeight;

		smoothScrollTo(Math.max(0, Math.min(targetY, maxScroll)), 650);
	};

	window.addEventListener("keydown", handleKeyDown);

	return () => {
		window.removeEventListener("keydown", handleKeyDown);
	};
}

export default function Timeline() {
	const timelineRef = useRef(null);

	const [activeIndex, setActiveIndex] = useState(0);
	
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const timeline = timelineRef.current;

		if (!timeline) {
			return;
		}

		const nodes = Array.from(timeline.querySelectorAll(".timeline-step"));

		if (!nodes.length) {
			return;
		}

		const observer = new IntersectionObserver(
			(observedEntries) => {
				const visible = observedEntries
					.filter((item) => item.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				if (!visible.length) {
					return;
				}

				const index = nodes.indexOf(visible[0].target);

				if (index !== -1) {
					setActiveIndex(index);
				}
			},
			{
				rootMargin: "-20% 0px -45% 0px",

				threshold: [0.05, 0.2, 0.4, 0.7],
			},
		);

		nodes.forEach((node) => {
			observer.observe(node);
		});

		let ticking = false;

		const updateProgress = () => {
			if (ticking) {
				return;
			}

			ticking = true;

			requestAnimationFrame(() => {
				const documentHeight = document.documentElement.scrollHeight;

				const viewportHeight = window.innerHeight;

				const maxScroll = Math.max(1, documentHeight - viewportHeight);

				const scrollPosition = window.scrollY;

				const rawProgress = scrollPosition / maxScroll;

				const clampedProgress = Math.min(1, Math.max(0, rawProgress));

				setProgress(clampedProgress);

				ticking = false;
			});
		};

		updateProgress();

		window.addEventListener("scroll", updateProgress, { passive: true });

		window.addEventListener("resize", updateProgress);

		const removeKeyboardScrolling = setupSmoothKeyboardScrolling();

		return () => {
			observer.disconnect();

			window.removeEventListener("scroll", updateProgress);

			window.removeEventListener("resize", updateProgress);

			removeKeyboardScrolling();
		};
	}, []);

	return (
		<>
			<section
				ref={timelineRef}
				class="timeline"
				aria-label="personal timeline"
			>
				<div class="timeline-spine" aria-hidden="true" />

				<div class="timeline-start">
					<span class="timeline-start__dot" />

					<span class="timeline-start__label">start</span>
				</div>

				<div class="timeline-entries">
					{entries.map((entry, index) => (
						<div
							class={`timeline-step timeline-step--${entry.side} ${
								index === activeIndex ? "is-active" : ""
							}`}
							key={entry.id}
						>
							<TimelineConnector
								entry={entry}
								index={index}
								isLast={index === entries.length - 1}
							/>

							<TimelineNode entry={entry} />
						</div>
					))}
				</div>
			</section>

			<ScrollControls progress={progress} />
		</>
	);
}

function ScrollControls({ progress }) {
	const [showTopButton, setShowTopButton] = useState(false);

	useEffect(() => {
		let ticking = false;

		const update = () => {
			if (ticking) {
				return;
			}

			ticking = true;

			requestAnimationFrame(() => {
				setShowTopButton(window.scrollY > 500);

				ticking = false;
			});
		};

		update();

		window.addEventListener("scroll", update, { passive: true });

		return () => {
			window.removeEventListener("scroll", update);
		};
	}, []);

	const scrollToTop = () => {
		smoothScrollTo(0, 1400);
	};

	return (
		<>
			<div class="custom-scrollbar" aria-hidden="true">
				<div class="custom-scrollbar__track" />

				<div
					class="custom-scrollbar__thumb"
					style={{
						height: `${Math.max(8, progress * 100)}%`,
					}}
				/>
			</div>

			<button
				class={`back-to-top ${showTopButton ? "back-to-top--visible" : ""}`}
				type="button"
				onClick={scrollToTop}
				aria-label="return to top"
				tabIndex={showTopButton ? 0 : -1}
			>
				<span>↑</span>
			</button>
		</>
	);
}
