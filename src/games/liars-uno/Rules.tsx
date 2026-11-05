import { ExampleList, RulesPage, type RulesContent } from '../shared/RulesPage';

const content: RulesContent = {
  name: "Liar's UNO",
  headerTagline: 'THE BLUFFING CARD GAME',
  footer: 'STRAIGHT FACES. SNEAKY CARDS.',
  eyebrow: 'CARD GAME · BLUFFING · AGES 7+',
  tagline: 'Bluff your way out.',
  lede: 'Play your cards, bluff your friends, and catch the liars! It plays like classic UNO, until the cards start going face down.',
  ruleset: <><strong>Ruleset shown:</strong> Mattel's official Liar's UNO instructions. You'll need the physical Liar's UNO deck.</>,
  facts: [
    ['Players', '2 to 6 players, ages 7 and up.'],
    ['Objective', 'Be the first player to get rid of every card in your hand.'],
    ["You'll need", "The 112-card Liar's UNO deck."],
  ],
  setup: [
    'Choose a dealer and shuffle the cards.',
    'Deal 7 cards to each player.',
    'Put the rest of the cards face down in the middle. This is the Draw Pile.',
    <>Turn the top card face up beside it to start the Discard Pile. If it is an Action Card, ignore it and flip the next card. If it is a Liar's Card, treat it as a normal card.</>,
    'The player to the left of the dealer goes first, and play moves clockwise.',
  ],
  steps: [
    ['Match the top card', 'On your turn, play one card that matches the top of the Discard Pile by color, number, or symbol.'],
    ['Regular Cards go face up', 'A Regular Card is always played face up. If it matches, simply play it.'],
    ["Liar's Cards go face down", "A Liar's Card is always played face down, and you announce out loud what it is. If it really matches, you are telling the truth."],
    ['Or bluff', <>If your Liar's Card does not match, you can still play it face down and lie about what it is. The lie must be <strong>plausible</strong>: name a card that would match the top card.</>],
    ['Challenge!', 'Any player may challenge a face-down card before the next player begins their turn. The challenged card is revealed.'],
    ["Can't play? Draw", 'With no playable card, draw one. If it can be played, you may play it; otherwise your turn ends. You may also draw instead of playing, even when you have a match.'],
  ],
  sections: [
    {
      heading: 'Challenges & penalties',
      items: [
        ['Caught lying', 'If you were lying, take the card back into your hand and draw 1 card.'],
        ['Honest after all', 'If you were telling the truth, the player who challenged you draws 1 card.'],
        ['Unchallenged claims stand', 'If nobody challenges before the next turn starts, you are safe. If you announced an Action Card, its action happens whether you were lying or not.'],
        ['No disguised Regular Cards', "You may not play a Regular Card face down and pass it off as a Liar's Card. If you are caught, take it back and draw 6 cards."],
      ],
    },
    {
      heading: 'Special rules',
      items: [
        ["7's Swap", 'When a 7 of any color is played, its player must swap hands with another player of their choice. Play then continues in the current order.'],
        ["0's Pass", 'When a 0 of any color is played, every player passes their hand to the next player in the current direction of play.'],
        ['Challenging a 7 or 0', 'If a 7 or 0 is challenged, the penalty card is drawn after hands have been exchanged.'],
        ['Calling “UNO!”', 'The moment you are down to 1 card, shout “UNO!” If another player calls it first, before the next player takes their turn, you draw 2 cards.'],
      ],
    },
    {
      heading: 'Action Cards',
      intro: "Every Action Card except the Wild Liar's Challenge is a Liar's Card, so it must be played face down. The Wild Liar's Challenge is always played face up.",
      items: [
        ['Draw Two', 'The next player draws 2 cards and loses their turn.'],
        ['Reverse', 'The direction of play switches, from clockwise to counterclockwise or back again.'],
        ['Skip', 'The next player loses their turn.'],
        ['Wild Draw 4', 'Matches anything, so it can be played on any card. The next player draws 4 cards and loses their turn, and you choose the color that continues play.'],
        ["Wild Liar's Challenge: the call", "Choose a color. Every other player puts a card of that color face down and announces it; Wild Cards don't count. Players without that color may put down any card, but they must claim it matches."],
        ["Wild Liar's Challenge: the reveal", "Challenge players one at a time. A liar takes their card back and draws 1. Stop when you've challenged everyone or someone shows the right color. That player and everyone unchallenged then tuck their cards under the Wild Liar's Challenge card."],
      ],
    },
  ],
  example: {
    heading: 'Example turn',
    body: <>
      <p>The top card is a <strong>Red 3</strong>. Your only Liar's Card is a <strong>Green 8</strong>, which does not match. You play it face down and announce “Red 7.” That claim is plausible, because a Red 7 would match.</p>
      <ExampleList items={[
        <><strong>Nobody challenges:</strong> the card stays, and play moves on.</>,
        <><strong>Someone challenges:</strong> you reveal the Green 8, take it back, and draw 1 card.</>,
        <><strong>If it really had been a Red 7:</strong> the challenger would draw 1 card instead.</>,
      ]} />
    </>,
  },
  win: [
    <>Play your final card. If no one challenges it, <strong>you win</strong>. If you are challenged and caught lying, take the card back, draw 1 penalty card, and play continues.</>,
    <>If someone discards their last card during a Wild Liar's Challenge, they win. If several players go out that way at once, they <strong>win together</strong>.</>,
    <><strong>Optional scoring:</strong> the winner of each hand scores the cards left in opponents' hands. Number cards count face value, Skip, Reverse, and Draw Two count 20, and Wild Draw 4 and Wild Liar's Challenge count 50. The first player to 500 points wins.</>,
  ],
  sources: [
    { label: "Mattel's official Liar's UNO instructions", href: 'https://service.mattel.com/instruction_sheets/JLH43%20English.pdf' },
  ],
};

export function Rules() { return <RulesPage content={content} />; }
