export interface SeedSite {
  address: string;
  title: string;
  author: string;
  html: string;
}

export const SITES: SeedSite[] = [
  {
    address: 'front-page.zz',
    title: 'The Front Page',
    author: 'Elena',
    html: `
<h1>The Front Page</h1>
<p>Welcome to the small web: a few hundred pages, written by people who had
something to say and nowhere else to say it. This page is a doorway, not a
destination. Pick a thread and pull on it.</p>
<ul>
  <li><a href="tidepool.zz">Tidepool</a> on the strange little worlds left by the tide.</li>
  <li><a href="starter.zz">Starter</a> on keeping a sourdough culture alive.</li>
  <li><a href="night-trains.zz">Night Trains</a> on crossing a continent while you sleep.</li>
  <li><a href="lichen.zz">Lichen</a> on the slowest organisms you will ever admire.</li>
  <li><a href="lighthouse.zz">The Lighthouse</a> on the people who kept the lamps lit.</li>
</ul>`,
  },
  {
    address: 'tidepool.zz',
    title: 'Tidepool',
    author: 'Amara',
    html: `
<h1>Tidepool</h1>
<p>Twice a day the sea retreats and leaves behind a handful of rock basins full
of water. Each one is a tiny world: anemones closing around a fingertip, hermit
crabs borrowing shells that are far too big for them, and limpets that return
to the same scar in the rock every time the tide goes out.</p>
<p>The best time to visit is an hour before low tide. Walk slowly, look before
you touch, and put every stone back exactly as you found it. The meadows just
offshore, described at <a href="seagrass.zz">seagrass.zz</a>, feed the same food
web. Further along the coast stands <a href="lighthouse.zz">the lighthouse</a>.
Someone once promised a page about kelp at <a href="kelp-forest.zz">kelp-forest.zz</a>,
but it has never been written.</p>
<p><a href="front-page.zz">Back to the front page</a></p>`,
  },
  {
    address: 'seagrass.zz',
    title: 'Seagrass Meadows',
    author: 'Amara',
    html: `
<h1>Seagrass Meadows</h1>
<p>Seagrass is not seaweed. It is a flowering plant that returned to the sea
millions of years ago, with roots, veins and even tiny flowers. A healthy meadow
stores carbon faster than many forests on land and shelters young fish while
they grow large enough to survive the open water.</p>
<p>Meadows are easily damaged by anchors and by cloudy water that blocks the
sunlight they need. The pools in <a href="tidepool.zz">tidepool.zz</a> depend on
them, and the patient study of <a href="lichen.zz">lichen</a> shows a similar
lesson: the quietest living things hold ecosystems together. Salt marshes make
a natural next chapter, but <a href="salt-flats.zz">salt-flats.zz</a> does not
exist yet.</p>`,
  },
  {
    address: 'lighthouse.zz',
    title: 'The Lighthouse',
    author: 'Amara',
    html: `
<h1>The Lighthouse</h1>
<p>Before automation, every lighthouse needed a keeper. The keeper trimmed the
wick, polished the great lens, wound the clockwork that turned it, and wrote
down the weather in a logbook every few hours, whether or not anyone would ever
read it. A lens the size of a small room could throw its beam twenty miles.</p>
<p>The older tower on the point was abandoned decades ago and its story is meant
to live at <a href="old-lighthouse.zz">old-lighthouse.zz</a>. For now there is
only this page. If you walked here from the shore, you can return to
<a href="tidepool.zz">the tidepools</a> or go back to the
<a href="front-page.zz">front page</a>.</p>`,
  },
  {
    address: 'starter.zz',
    title: 'Starter',
    author: 'Bilal',
    html: `
<h1>Starter</h1>
<p>A sourdough starter is a jar of flour and water in which wild yeast and
bacteria have agreed to live together. Feed it equal weights of flour and water
once a day and it will bubble, smell faintly of apples and vinegar, and double
in size a few hours after each meal. Neglect it for a week and it will sulk but
rarely die.</p>
<p>Once it is lively, bake with it. Notes on dough texture live at
<a href="crumb.zz">crumb.zz</a>, and the practical business of heat is in
<a href="oven-notes.zz">oven-notes.zz</a>. An old plan to revive a rye loaf from
a village recipe is written up at <a href="rye-revival.zz">rye-revival.zz</a>,
which was never published. <a href="front-page.zz">Home</a></p>`,
  },
  {
    address: 'crumb.zz',
    title: 'Reading the Crumb',
    author: 'Bilal',
    html: `
<h1>Reading the Crumb</h1>
<p>Cut a loaf in half and the inside tells you everything. Tight, even holes
mean the dough was under-fermented. Large irregular holes with glossy walls mean
it was handled gently and given enough time. A gummy streak near the base
usually means the oven was too cool or the loaf was cut too soon.</p>
<p>Hydration is the biggest lever: wetter dough gives a more open crumb but is
harder to shape. Begin with seventy percent water to flour and go higher only
once your hands are confident. Go back to <a href="starter.zz">the starter</a>
if your loaf never rises, or read about heat in
<a href="oven-notes.zz">the oven notes</a>.</p>`,
  },
  {
    address: 'oven-notes.zz',
    title: 'Oven Notes',
    author: 'Bilal',
    html: `
<h1>Oven Notes</h1>
<p>Home ovens are bad at the one thing bread needs most: trapped steam. In the
first fifteen minutes steam keeps the crust soft so the loaf can expand fully.
A heavy covered pot preheated for forty minutes solves this almost perfectly,
and it needs nothing more complicated than a lid.</p>
<p>After the lid comes off, drop the temperature slightly and bake until the
crust is a deep mahogany. Pale bread is under-baked bread. A forgotten rye
experiment is listed at <a href="rye-revival.zz">rye-revival.zz</a>, and the
foundations are on <a href="starter.zz">the starter page</a>, with texture advice
in <a href="crumb.zz">crumb.zz</a>.</p>`,
  },
  {
    address: 'night-trains.zz',
    title: 'Night Trains',
    author: 'Chen',
    html: `
<h1>Night Trains</h1>
<p>A good night train turns distance into sleep. You board in the evening, eat
something forgettable in a dining car, and wake up in a different country with
the light coming in sideways through the blind. The best compartments have a
folding sink, a reading lamp that actually works, and a window that opens an
inch for the smell of the rails.</p>
<p>Planning one takes patience. The published times are collected on
<a href="timetable.zz">timetable.zz</a>. Rumour says a sleeper once ran to a
terminus at <a href="lost-station.zz">lost-station.zz</a>, but no one has been
able to confirm it. Return to the <a href="front-page.zz">front page</a> any
time.</p>`,
  },
  {
    address: 'timetable.zz',
    title: 'The Timetable',
    author: 'Chen',
    html: `
<h1>The Timetable</h1>
<p>Timetables are among the most compressed documents ever written. A single
printed page can describe forty trains, a dozen connections and the promise that
all of it will line up. Learn to read one and you can plan a journey without a
screen: the columns run in time order, the footnotes hide the exceptions, and
a small clock symbol often marks the train that will not wait.</p>
<ul>
  <li>Check the day-of-week letters before trusting any train.</li>
  <li>Leave at least twenty minutes for connections across borders.</li>
  <li>Always have a fallback that departs within the hour.</li>
</ul>
<p>The sleepers themselves are described at <a href="night-trains.zz">night-trains.zz</a>.
The old terminus <a href="lost-station.zz">lost-station.zz</a> is not on any
current timetable.</p>`,
  },
  {
    address: 'lichen.zz',
    title: 'Lichen',
    author: 'Dara',
    html: `
<h1>Lichen</h1>
<p>A lichen is not one organism but two: a fungus that provides structure and
an alga that makes food from light. Together they colonise bare rock, gravestones
and roofs, growing perhaps a millimetre a year. A patch the size of a dinner
plate can be older than the building it sits on.</p>
<p>Lichens are also quiet sensors. Many cannot survive polluted air, so their
presence is a free measurement of how clean a place is. You will find
them beside the meadows of <a href="seagrass.zz">seagrass.zz</a>, and on the
long rail lines of <a href="night-trains.zz">night-trains.zz</a>. <a href="front-page.zz">Home</a></p>`,
  },
];