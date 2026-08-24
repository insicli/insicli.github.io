import Timeline from "./components/timeline";

export default function App() {
	return (
		<main class="site">
			<header class="site-header">
				<p class="site-kicker">my own little corner of the internet</p>

				<h1></h1>

				<p class="site-intro">
					a collection of things about me, about other things, and random things
				</p>
			</header>

			<Timeline />

			<footer class="site-footer">
				<span>
					"See you <em>tomorrow</em>."
				</span>
			</footer>
		</main>
	);
}
