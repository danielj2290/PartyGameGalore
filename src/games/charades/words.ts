export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'everyday' | 'animals' | 'actions' | 'entertainment';
export interface Word { id: string; text: string; difficulty: Difficulty; category: Category }

// Medium/Hard favor 1-3 word prompts with clear physical clues.
// Inspiration: https://www.thegamegal.com/printables/
// https://parade.com/living/charades-ideas
// https://www.playcharades.app/blog/charades-ideas
// https://www.reddit.com/r/boardgames/comments/1tuuanr/high_quality_charades_ideas/
// Reddit discussions informed selection, not a verbatim or ranked word list.
// Categories are metadata for now. Category filtering will be a later milestone.
const lists: Record<Difficulty, Record<Category, string>> = {
  easy: {
    everyday: 'Umbrella|Toothbrush|Balloon|Backpack|Sunglasses|Camera|Pillow|Telephone|Mirror|Scissors|Guitar|Drum|Book|Bicycle|Clock|Crown|Flashlight|Kite|Ladder|Suitcase|Headphones|Shopping cart|Steering wheel|Doorbell|Ice cream|Popcorn|Birthday cake|Sandwich|Banana|Hot soup',
    animals: 'Cat|Dog|Elephant|Monkey|Penguin|Kangaroo|Snake|Butterfly|Fish|Rabbit|Frog|Lion|Chicken|Horse|Duck|Bear|Giraffe|Crocodile|Turtle|Mouse',
    actions: 'Brushing your teeth|Walking a dog|Flying a kite|Eating spaghetti|Riding a bicycle|Swimming|Sleeping|Sneezing|Clapping|Dancing|Running|Jumping rope|Reading a book|Taking a photo|Playing tennis|Kicking a ball|Blowing bubbles|Washing your hands|Combing your hair|Opening a present|Making a snowman|Playing the piano|Mopping the floor|Painting a wall|Climbing stairs|Drinking water|Peeling a banana|Rocking a baby|Putting on shoes|Lifting weights',
    entertainment: 'Superhero|Robot|Pirate|Astronaut|Cowboy|Magician|Mermaid|Ballerina|Clown|Drummer|Singer|Juggler|Detective|Wizard|Knight|Princess|Dinosaur|Ghost|Vampire|Snowman',
  },
  medium: {
    everyday: "Vending machine|Revolving door|Escalator|Metal detector|Sleeping bag|Rocking chair|Roller skates|Lawn mower|Binoculars|Fire extinguisher|Vacuum cleaner|Typewriter|Seat belt|Fishing rod|Hammock|Jack-in-the-box|Snow globe|Wheelbarrow|Traffic light|Fortune cookie|Yo-yo|Bubble wrap|Paper airplane|Windshield wipers|Hula hoop|Wind chime|Trampoline|Toaster|Can opener|Pogo stick",
    animals: "Flamingo|Octopus|Peacock|Chameleon|Hedgehog|Sloth|Seal|Crab|Gorilla|Ostrich|Woodpecker|Jellyfish|Meerkat|Seahorse|Lobster|Pelican|Squirrel|Raccoon|Rhino|Bat",
    actions: "Rock climbing|Rainfall|Brain freeze|Camping|Changing tires|Grocery shopping|Sleepwalking|Lost keys|Hot coals|Haircut|Roller coaster|Parallel parking|Kneading dough|Butterfly catching|Ice skating|Dog grooming|Untangling cables|Babysitting|Tug-of-war|Fly swatting|Gift wrapping|Tea party|Pottery|Air guitar|Tightrope walking|Opening jars|Conducting|Applying sunscreen|Dog training|Surfing",
    entertainment: "Circus ringmaster|Silent movie|Talent show|Puppet show|Treasure hunt|Haunted house|Slow motion|Stage fright|Movie director|Disco dancer|Sword fight|Magic carpet|Mad scientist|Secret agent|News reporter|Game show host|Opera singer|Jurassic Park|Ghostbusters|The Lion King",
  },
  hard: {
    everyday: "Jackhammer|Sundial|Hourglass|Periscope|Compass|Metronome|Lie detector|Record player|Spiral staircase|Invisible ink|Pendulum|Mechanical bull|Satellite dish|Turnstile|Fountain pen|Wind turbine|Sewing machine|Printing press|Drawbridge|Weather vane|Telescope|Marionette|Bathroom scale|Accordion|Boomerang|Electric fence|Trapdoor|Windmill|Drawstring|Mouse trap",
    animals: "Praying mantis|Hermit crab|Komodo dragon|Armadillo|Platypus|Flying squirrel|Pufferfish|Stick insect|Hummingbird|Dung beetle|Narwhal|Tarantula|Anglerfish|Mole|Walrus|Scorpion|Lemur|Anteater|Porcupine|Manta ray",
    actions: "Zero gravity|Defusing bombs|Quicksand|Pickpocketing|Hypnosis|Lock picking|Sleep paralysis|Folding fitted sheets|House of cards|Plate spinning|Fire breathing|Sword swallowing|Glassblowing|Synchronized swimming|Pole vaulting|Tightrope cycling|Bungee jumping|Moonwalking|Escape artistry|Lion taming|Flamenco|Auctioneering|Speed skating|Ice sculpting|Shearing sheep|Herding cats|Beekeeping|Falconry|Scuba diving|Stilt walking",
    entertainment: "Time travel|Body swap|Stunt double|Ventriloquist|Human statue|Orchestra conductor|Puppet master|Werewolf|Medusa|Frankenstein|Sherlock Holmes|Charlie Chaplin|The Terminator|Indiana Jones|King Kong|The Matrix|Mission Impossible|The Nutcracker|Swan Lake|Dracula",
  },
};

export const words: Word[] = Object.entries(lists).flatMap(([difficulty, categories]) =>
  Object.entries(categories).flatMap(([category, list]) => list.split('|').map((text, index) => ({
    id: `${difficulty}-${category}-${index}`, text,
    difficulty: difficulty as Difficulty, category: category as Category,
  }))),
);
