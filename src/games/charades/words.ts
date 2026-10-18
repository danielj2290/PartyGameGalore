export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'everyday' | 'animals' | 'actions' | 'entertainment';
export interface Word { id: string; text: string; difficulty: Difficulty; category: Category }

// Categories are metadata for now. Category filtering will be a later milestone.
const lists: Record<Difficulty, Record<Category, string>> = {
  easy: {
    everyday: 'Umbrella|Toothbrush|Balloon|Backpack|Sunglasses|Camera|Pillow|Telephone|Mirror|Scissors|Guitar|Drum|Book|Bicycle|Clock|Crown|Flashlight|Kite|Ladder|Suitcase|Headphones|Shopping cart|Steering wheel|Doorbell|Ice cream|Popcorn|Birthday cake|Sandwich|Banana|Hot soup',
    animals: 'Cat|Dog|Elephant|Monkey|Penguin|Kangaroo|Snake|Butterfly|Fish|Rabbit|Frog|Lion|Chicken|Horse|Duck|Bear|Giraffe|Crocodile|Turtle|Mouse',
    actions: 'Brushing your teeth|Walking a dog|Flying a kite|Eating spaghetti|Riding a bicycle|Swimming|Sleeping|Sneezing|Clapping|Dancing|Running|Jumping rope|Reading a book|Taking a photo|Playing tennis|Kicking a ball|Blowing bubbles|Washing your hands|Combing your hair|Opening a present|Making a snowman|Playing the piano|Mopping the floor|Painting a wall|Climbing stairs|Drinking water|Peeling a banana|Rocking a baby|Putting on shoes|Lifting weights',
    entertainment: 'Superhero|Robot|Pirate|Astronaut|Cowboy|Magician|Mermaid|Ballerina|Clown|Drummer|Singer|Juggler|Detective|Wizard|Knight|Princess|Dinosaur|Ghost|Vampire|Snowman',
  },
  medium: {
    everyday: 'Vending machine|Revolving door|Escalator|Metal detector|Sleeping bag|Rocking chair|Roller skates|Lawn mower|Binoculars|Fire extinguisher|Vacuum cleaner|Typewriter|Seat belt|Fishing rod|Hammock|Jack-in-the-box|Snow globe|Wheelbarrow|Traffic light|Fortune cookie|Sticky tape|Bubble wrap|Paper airplane|Windshield wipers|Tripod|Wind chime|Beanbag chair|Folding table|Can opener|Pogo stick',
    animals: 'Flamingo|Octopus|Peacock|Chameleon|Hedgehog|Sloth|Seal|Crab|Gorilla|Ostrich|Woodpecker|Jellyfish|Meerkat|Seahorse|Lobster|Pelican|Squirrel|Raccoon|Rhino|Bat',
    actions: 'Walking through a spiderweb|Trying on tight jeans|Getting caught in the rain|Burning your tongue|Building a tent|Changing a flat tire|Carrying too many groceries|Trying to stay awake|Looking for lost keys|Walking on hot sand|Getting a haircut|Riding a roller coaster|Parallel parking|Making pizza dough|Catching a butterfly|Learning to ice skate|Giving a dog a bath|Untangling headphones|Carrying a sleeping baby|Walking against the wind|Trying to swat a fly|Wrapping a present|Serving afternoon tea|Making a pottery bowl|Playing air guitar|Walking a tightrope|Trying to open a stuck jar|Conducting an orchestra|Putting on sunscreen|Training a puppy',
    entertainment: 'Circus ringmaster|Silent movie|Talent show|Puppet show|Treasure hunt|Haunted house|Slow motion replay|Stage fright|Movie director|Disco dancer|Sword fight|Magic carpet|Mad scientist|Secret agent|News reporter|Game show host|Opera singer|Tightrope walker|Marching band|Zombie',
  },
  hard: {
    everyday: 'Newton’s cradle|Sundial|Hourglass|Periscope|Compass|Metronome|Lie detector|Record player|Spiral staircase|Invisible ink|Pendulum|Mechanical bull|Satellite dish|Automatic doors|Fountain pen|Wind turbine|Sewing machine|Printing press|Drawbridge|Weather vane|Telescope|Marionette|Rubber stamp|Accordion|Boomerang|Electric fence|Trapdoor|Water wheel|Security scanner|Butter churn',
    animals: 'Praying mantis|Hermit crab|Komodo dragon|Armadillo|Platypus|Flying squirrel|Pufferfish|Leaf insect|Hummingbird|Dung beetle|Narwhal|Tarantula|Anglerfish|Mole|Albatross|Cuttlefish|Lemur|Anteater|Porcupine|Sea cucumber',
    actions: 'Pretending to understand a joke|Trying to remember a dream|Walking in zero gravity|Defusing a ticking bomb|Escaping quicksand|Trying to look innocent|Hiding a surprise party|Rewinding a movie|Being trapped in an invisible box|Winning an imaginary argument|Smuggling snacks into a cinema|Trying to quietly eat chips|Teaching a robot to dance|Discovering a secret passage|Conducting an underwater orchestra|Walking through a hall of mirrors|Being hypnotized|Inventing a new dance move|Dodging invisible lasers|Trying to fold a fitted sheet|Catching your own reflection|Sneaking past a sleeping dragon|Juggling imaginary bowling balls|Realizing you forgot your lines|Trying to blend into a crowd|Being pulled by an invisible magnet|Building a house of cards|Balancing plates on sticks|Trying to catch falling stars|Leading a silent protest',
    entertainment: 'Time travel|Body swap|Plot twist|Cliffhanger|Standing ovation|Film noir detective|Ventriloquist|Stunt double|Escapologist|One-person band|Human statue|Mimed tug of war|Backstage chaos|Orchestra conductor|A dramatic monologue|An unreliable narrator|Opening night|Stop-motion animation|An invisible audience|The grand finale',
  },
};

export const words: Word[] = Object.entries(lists).flatMap(([difficulty, categories]) =>
  Object.entries(categories).flatMap(([category, list]) => list.split('|').map((text, index) => ({
    id: `${difficulty}-${category}-${index}`, text,
    difficulty: difficulty as Difficulty, category: category as Category,
  }))),
);
