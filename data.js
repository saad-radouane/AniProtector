const IUCN_DATABASE = [
    {
        status: 'Extinct',
        code: 'EX',
        className: 'status-endangered',
        species: [
            "dodo", "tasmanian tiger", "passenger pigeon", "great auk", "steller’s sea cow", "caribbean monk seal", "japanese sea lion", "atlas bear", "bluebuck", "pyrenean ibex", "falkland islands wolf", "broad-faced potoroo", "toolache wallaby", "labrador duck", "mauritius blue pigeon", "elephant bird", "moa", "giant fossa"
        ]
    },
    {
        status: 'Extinct in the Wild',
        code: 'EW',
        className: 'status-endangered',
        species: [
            "scimitar oryx", "hawaiian crow", "ʻalalā", "alagoas curassow", "guam kingfisher", "socorro dove", "spix’s macaw"
        ]
    },
    {
        status: 'Critically Endangered',
        code: 'CR',
        className: 'status-endangered',
        species: [
            "javan rhino", "sumatran rhino", "black rhino", "amur leopard", "vaquita", "mountain gorilla", "cross river gorilla", "orangutan (tapanuli)", "hawksbill turtle", "yangtze giant softshell turtle", "saola", "philippine eagle", "kakapo", "red wolf", "addax", "african forest elephant", "gharial", "chinese pangolin", "sunda pangolin", "siamese crocodile", "california condor", "iberian lynx", "northern white rhino", "bornean orangutan", "blue-throated macaw", "sumatran tiger", "sumatran elephant", "hainan gibbon", "madagascar fish eagle", "spoon-billed sandpiper", "atlantic goliath grouper", "european eel", "angelshark", "sawfish", "helmeted hornbill", "black-footed ferret"
        ]
    },
    {
        status: 'Endangered',
        code: 'EN',
        className: 'status-endangered',
        species: [
            "tiger", "asian elephant", "blue whale", "green turtle", "bonobo", "snow leopard", "african wild dog", "chimpanzee", "orangutan (bornean)", "orangutan (sumatran)", "red panda", "galápagos penguin", "african penguin", "giant otter", "grevy’s zebra", "ethiopian wolf", "dhole", "giraffe", "sea lion (australian)", "whale shark", "humphead wrasse", "african grey parrot", "polar bear", "leatherback turtle", "fin whale", "sei whale", "gorilla (western lowland)", "mandrill", "proboscis monkey", "bengal florican", "african lion", "cheetah", "bluefin tuna", "scalloped hammerhead shark", "great hammerhead shark", "basking shark", "dugong", "komodo dragon", "loggerhead turtle"
        ]
    },
    {
        status: 'Vulnerable',
        code: 'VU',
        className: 'status-vulnerable',
        species: [
            "polar bear", "lion", "cheetah", "giant panda", "koala", "hippopotamus", "african elephant (savanna)", "sea otter", "emperor penguin", "great white shark", "dugong", "manatee (west indian)", "snow goose", "red kangaroo", "wombat (northern hairy-nosed)", "meerkat", "hyena (striped)", "african buffalo", "wildebeest (black)", "caracal", "lynx (canadian)", "wolverine", "harpy eagle", "macaw (scarlet)", "puffin (atlantic)", "walrus", "orca", "bottlenose dolphin", "hammerhead shark (smooth)", "manta ray", "sun bear", "sloth bear", "brown bear", "moose", "reindeer", "nile crocodile", "reticulated python", "king cobra", "monitor lizard"
        ]
    },
    {
        status: 'Near Threatened',
        code: 'NT',
        className: 'status-vulnerable',
        species: [
            "jaguar", "gray wolf", "mountain zebra", "narwhal", "humboldt penguin", "giraffe", "brown bear", "african buffalo", "hyena (spotted)", "bald eagle", "peregrine falcon", "golden eagle", "caribou", "red deer", "elk", "pronghorn", "ocelot", "serval", "red-tailed hawk", "great horned owl", "pelican (american white)", "flamingo (greater)", "sea lion (california)", "harbor seal", "sea eagle (white-tailed)", "swordfish", "mako shark (shortfin)", "zebra shark", "green iguana", "komodo dragon"
        ]
    },
    {
        status: 'Least Concern',
        code: 'LC',
        className: 'status-least-concern',
        species: [
            "red fox", "raccoon", "pigeon (rock dove)", "squirrel (eastern gray)", "wild boar", "mallard duck", "bald eagle (usa population)", "peregrine falcon (global)", "coyote", "moose", "rabbit (european)", "common frog", "toad (american)", "house sparrow", "starling", "crow", "raven", "magpie", "blue jay", "robin", "blackbird", "partridge", "quail", "turkey (wild)", "chicken (red junglefowl)", "cow", "horse", "sheep", "goat", "donkey", "camel", "llama", "alpaca", "dog", "cat", "dolphin (common)", "humpback whale", "orca (global)", "zebra (plains)", "giraffe (angolan)", "gazelle (thomson’s)", "meerkat", "prairie dog", "armadillo (nine-banded)", "sloth (brown-throated)", "iguana (common green)", "gecko (tokay)", "python (ball)", "boa (common)", "tortoise (leopard)", "turtle (red-eared slider)", "crocodile (american)", "alligator (american)"
        ]
    },
    {
        status: 'Data Deficient',
        code: 'DD',
        className: 'status-unknown',
        species: [
            "deep-sea shark", "philippine tube-nosed bat", "rainforest frog", "cave fish", "lizard", "octopus", "rodent"
        ]
    },
    {
        status: 'Not Evaluated',
        code: 'NE',
        className: 'status-unknown',
        species: [
            "insect", "deep-sea species", "microorganism", "amphibian", "reptile"
        ]
    }
];

// Helper purely for finding if an animal precisely exists in our defined dataset
function findLocalStatus(queryName) {
    queryName = queryName.toLowerCase();
    for (const category of IUCN_DATABASE) {
        for (const sp of category.species) {
            let cleanSp = sp.replace(/\(.*\)/g, '').trim(); 
            // We do a robust check: the provided animal name matching the DB name
            if (queryName.includes(cleanSp) || cleanSp.includes(queryName)) {
                return {
                    status: category.status,
                    class: category.className
                };
            }
        }
    }
    return null;
}
