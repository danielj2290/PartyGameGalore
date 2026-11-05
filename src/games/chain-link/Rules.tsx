import { Chain, RulesPage, type RulesContent } from '../shared/RulesPage';

const content: RulesContent = {
  name: 'Chain Link',
  headerTagline: 'WORD ASSOCIATION',
  footer: 'ONE WORD. ONE LINK. ONE LONG CHAIN.',
  eyebrow: 'WORD ASSOCIATION · QUICK THINKING',
  tagline: 'Link by link.',
  lede: 'Connect words to build the ultimate chain! Each new word has to team up with the one before it to make a phrase everybody knows.',
  facts: [
    ['Players', '2 or more, passing the turn around the group.'],
    ['Objective', 'Grow one chain of words where every neighbouring pair forms a familiar phrase or compound word.'],
    ["You'll need", 'Nothing but your vocabulary. Say the words out loud or jot the chain down.'],
  ],
  setup: [
    'Gather in a circle and choose who goes first.',
    'Pick a starting word. An everyday noun, like GOLF, works well.',
    'Say it out loud, or write it down, so everyone can follow the chain as it grows.',
  ],
  steps: [
    ['See the word', 'Look at the last word in the chain. That is the only word you need to link from.'],
    ['Find the link', <>Think of a word that can follow it to make a recognizable expression. After GOLF you might say CLUB, because <strong>“golf club”</strong> is a real thing.</>],
    ['Chain it', 'Say your word. It becomes the new end of the chain, and the next link has to start from it: CLUB can lead to SODA.'],
    ['Pass it on', 'The next player links from your word, and play keeps moving around the group as the chain grows.'],
  ],
  sections: [{
    heading: 'Linking rules',
    items: [
      ['Order matters', <>Each pair reads in chain order, with the earlier word first. <strong>“Golf club”</strong> works; “club golf” does not.</>],
      ['Only neighbours connect', 'A word only has to pair with the word right before it and the word right after it. GOLF and SODA never need to relate.'],
      ['Familiar, not forced', 'Links should be expressions most players recognize: common two-word phrases, compound words such as BASE → BALL, or set expressions.'],
      ['Agree before you start', 'Versions differ on the fine print. Decide up front whether repeated words are allowed, and settle a disputed link by a quick group vote.'],
    ],
  }],
  example: {
    heading: 'Example chain',
    body: <>
      <Chain words={['GOLF', 'CLUB', 'SODA', 'POP']} />
      <p>Every neighbouring pair is a phrase you already know: <strong>“golf club,”</strong> <strong>“club soda,”</strong> and <strong>“soda pop.”</strong> The next player now needs a word that follows POP, such as CORN for <strong>“popcorn.”</strong></p>
    </>,
  },
  win: [
    'At heart, Chain Link is a team challenge. The chain ends when a player cannot find a link the group accepts. Count the links you made, and try to beat that chain next time.',
    'For a competitive game, agree before you start that a player who cannot add a link is out. The last player still linking wins.',
  ],
  sources: [
    { label: 'Word Chain Party', href: 'https://wordchainparty.com/' },
    { label: 'CHN LNK', href: 'https://thechnlnk.com/' },
  ],
};

export function Rules() { return <RulesPage content={content} />; }
