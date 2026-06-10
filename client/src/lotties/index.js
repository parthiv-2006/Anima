// Registry of available Lottie animations keyed by species → stage.
//
// NOTE: the current .json files are placeholder stubs (a single pulsing
// colored circle exported at 512x512). They are intentionally rendered as an
// elemental AURA layer behind the hand-drawn PNG sprite rather than replacing
// it — swapping the sprite for a flat circle would be a downgrade. When real
// character Lotties land, flip `replacesSprite` to true for that entry and
// AnimatedPet will render the Lottie as the pet itself.
import aquaBaby from './aqua-baby.json';
import emberBaby from './ember-baby.json';
import emberTeen from './ember-teen.json';
import emberAdult from './ember-adult.json';
import terraBaby from './terra-baby.json';

export const LOTTIE_REGISTRY = {
  EMBER: {
    1: { data: emberBaby, replacesSprite: false },
    2: { data: emberTeen, replacesSprite: false },
    3: { data: emberAdult, replacesSprite: false }
  },
  AQUA: {
    1: { data: aquaBaby, replacesSprite: false }
  },
  TERRA: {
    1: { data: terraBaby, replacesSprite: false }
  }
};

export function getLottie(species, stage) {
  return LOTTIE_REGISTRY[species]?.[stage] || null;
}
