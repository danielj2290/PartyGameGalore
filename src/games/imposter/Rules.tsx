import { ExampleList, RulesPage, type RulesContent } from '../shared/RulesPage';

const content: RulesContent = {
  name: 'Imposter',
  headerTagline: 'SOCIAL DEDUCTION',
  footer: 'TRUST NO ONE. CLUE EVERYONE.',
  eyebrow: 'MYSTERY · DECEPTION · SOCIAL DEDUCTION',
  tagline: "Who doesn't belong?",
  lede: 'Everyone knows the secret word... except one! Give clues that prove you are in on it, without handing the answer to the imposter.',
  ruleset: <><strong>Ruleset shown:</strong> classic single-word Imposter, with one imposter, one round of clues, and one vote. The imposter knows their role but gets no word and no hint.</>,
  facts: [
    ['Players', '3 or more. One imposter works best for groups of up to about 6.'],
    ['Objective', 'Civilians: find the imposter. Imposter: blend in and survive the vote.'],
    ["You'll need", 'A secret word and a private way to show each player their role.'],
  ],
  setup: [
    'Choose a secret word. Someone sitting out, or a word picker, should choose it so no player starts with an advantage.',
    'Secretly choose one player to be the imposter.',
    'Show each player their role in private. Civilians see the secret word; the imposter only learns that they are the imposter.',
    'Pick a first player. Clues go around the group in order from there.',
  ],
  steps: [
    ['Check your role', 'Look privately and keep a straight face. Never show your screen or card to anyone else.'],
    ['One clue each', 'Taking turns, every player says one word related to the secret word. You may not say the word itself or repeat an earlier clue.'],
    ['Walk the line', 'Be specific enough to prove you know the word, but vague enough that the imposter cannot work it out. The imposter listens closely and bluffs a clue that fits.'],
    ['Talk it over', 'After everyone has given a clue, discuss whose clue felt off. No new clues, and the secret word is still off limits.'],
    ['Cast your votes', 'Each player votes for one other player as the imposter. Nobody votes for themselves.'],
    ['Reveal', 'The player with the most votes is accused and reveals their role.'],
  ],
  sections: [{
    heading: 'Important rules',
    items: [
      ['Never say the secret word', 'The word cannot be spoken during clues or discussion. If it slips out, the imposter knows exactly what to bluff.'],
      ['Too obvious helps the imposter', 'Each clue gives the imposter more to work with. A perfect clue tells your fellow civilians you know the word, without telling the imposter what it is.'],
      ['The imposter is flying blind', 'The imposter knows they are the imposter, but they get no word and no hint. They have to build a believable clue from what they hear.'],
      ['Ties protect the imposter', 'If two or more players tie for the most votes, nobody is accused and the imposter escapes.'],
    ],
  }],
  example: {
    heading: 'Example round',
    body: <>
      <p>The secret word is <strong>BEACH</strong>. Four players give clues in turn:</p>
      <ExampleList items={[
        <><strong>Player 1:</strong> “Sand.”</>,
        <><strong>Player 2:</strong> “Towel.”</>,
        <><strong>Player 3 (the imposter):</strong> “Summer.” It is vague, but it could fit after “sand” and “towel.”</>,
        <><strong>Player 4:</strong> “Waves.”</>,
      ]} />
      <p>In discussion, Player 3's clue looks safe compared with the others. Most players vote for Player 3, who reveals they were the imposter. The civilians win.</p>
    </>,
  },
  win: [
    <><strong>Civilians win</strong> if the player with the most votes is the imposter.</>,
    <><strong>The imposter wins</strong> if a civilian is accused instead, or if the vote ends in a tie.</>,
  ],
  variations: {
    heading: 'Optional variations',
    intro: 'These are not part of the ruleset above. Agree on any of them before you start.',
    items: [
      ['Last-chance guess', 'A caught imposter gets one guess at the secret word. If they guess right, they steal the win.'],
      ['Category hint', 'Give the imposter the category of the word, such as “places,” for a fairer bluff.'],
      ['Tie runoff', 'Instead of letting the imposter escape on a tie, vote again among only the tied players.'],
    ],
  },
  sources: [
    { label: 'imposter-game.com rules', href: 'https://imposter-game.com/rules' },
    { label: 'Laughtable', href: 'https://laughtable.com/' },
  ],
};

export function Rules() { return <RulesPage content={content} />; }
