import { VisitVia } from '../../visits/visit.schema';

export interface Trail {
  person: string;
  startMinute: number; // minutes after BASE_TIME
  steps: [address: string, via: VisitVia][];
}

export const TRAILS: Trail[] = [
  // Amara: a long trail, five links deep, then a second one with dead ends
  { person: 'Amara', startMinute: 0, steps: [
    ['front-page.zz', 'typed'], ['tidepool.zz', 'link'], ['seagrass.zz', 'link'],
    ['lichen.zz', 'link'], ['night-trains.zz', 'link'], ['timetable.zz', 'link'],
  ]},
  { person: 'Amara', startMinute: 30, steps: [
    ['tidepool.zz', 'typed'], ['kelp-forest.zz', 'link'], ['tidepool.zz', 'history'],
    ['lighthouse.zz', 'link'], ['old-lighthouse.zz', 'link'],
  ]},

  // Bilal: bakes, repeats the starter page
  { person: 'Bilal', startMinute: 5, steps: [
    ['starter.zz', 'typed'], ['crumb.zz', 'link'], ['oven-notes.zz', 'link'],
    ['rye-revival.zz', 'link'], ['starter.zz', 'history'],
  ]},
  { person: 'Bilal', startMinute: 40, steps: [
    ['front-page.zz', 'typed'], ['starter.zz', 'link'], ['crumb.zz', 'link'],
  ]},

  // Chen: trains, dead end, then wanders off to bread
  { person: 'Chen', startMinute: 10, steps: [
    ['timetable.zz', 'typed'], ['night-trains.zz', 'link'], ['lost-station.zz', 'link'],
    ['front-page.zz', 'typed'], ['starter.zz', 'link'],
  ]},
  { person: 'Chen', startMinute: 50, steps: [
    ['night-trains.zz', 'typed'], ['timetable.zz', 'link'],
  ]},

  // Dara: lichen, goes back and forth, tries an address that never existed
  { person: 'Dara', startMinute: 20, steps: [
    ['lichen.zz', 'typed'], ['seagrass.zz', 'link'], ['tidepool.zz', 'link'],
    ['lichen.zz', 'history'],
  ]},
  { person: 'Dara', startMinute: 45, steps: [
    ['salt-flats.zz', 'typed'], ['front-page.zz', 'typed'], ['lighthouse.zz', 'link'],
  ]},

  // Elena: has been nearly everywhere (all 10 sites, over three trails)
  { person: 'Elena', startMinute: 2, steps: [
    ['front-page.zz', 'typed'], ['tidepool.zz', 'link'], ['seagrass.zz', 'link'],
    ['lichen.zz', 'link'], ['night-trains.zz', 'link'], ['timetable.zz', 'link'],
    ['night-trains.zz', 'history'],
  ]},
  { person: 'Elena', startMinute: 18, steps: [
    ['front-page.zz', 'typed'], ['starter.zz', 'link'], ['crumb.zz', 'link'],
    ['oven-notes.zz', 'link'], ['lighthouse.zz', 'typed'], ['kelp-forest.zz', 'typed'],
  ]},
  { person: 'Elena', startMinute: 36, steps: [
    ['tidepool.zz', 'typed'], ['lighthouse.zz', 'link'], ['front-page.zz', 'link'],
  ]},
];

export const STEP_SECONDS = 90;