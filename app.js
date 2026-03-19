// =============================================================================
// API Configuration
// Locally this app talks to Flask on :5000, which in turn proxies to db_server
// on :5001.  When deployed to AWS, set the same host (leave as empty string)
// or point to your EC2's public IP.
// =============================================================================
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';   // replace with http://<your-ec2-ip>:5000 once deployed

// =============================================================================
// Local conservation dictionary — comprehensive IUCN-based species list
// Used as a fast local fallback before the SQL db_server API call.
// =============================================================================
const CONSERVATION_DATA = {
    // ── Critically Endangered (CR) ──────────────────────────────────────────
    'javan rhino':       { status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 80 Javan rhinos remain in the wild, all in one national park in Indonesia.' },
    'sumatran rhino':    { status: 'Critically Endangered', class: 'status-endangered', desc: 'The smallest living rhino species, with fewer than 80 individuals left.' },
    'black rhino':       { status: 'Critically Endangered', class: 'status-endangered', desc: 'Black rhinos are critically endangered from decades of poaching for their horns.' },
    'amur leopard':      { status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 100 Amur leopards survive in the wild in Russia and China.' },
    'vaquita':           { status: 'Critically Endangered', class: 'status-endangered', desc: 'The world\'s rarest marine mammal, with fewer than 10 individuals remaining.' },
    'mountain gorilla':  { status: 'Critically Endangered', class: 'status-endangered', desc: 'Mountain gorillas number around 1,000 thanks to intensive conservation efforts.' },
    'cross river gorilla':{ status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 300 Cross River gorillas remain, split across fragmented habitats.' },
    'orangutan':         { status: 'Critically Endangered', class: 'status-endangered', desc: 'All orangutan species are critically endangered from palm oil deforestation.' },
    'hawksbill turtle':  { status: 'Critically Endangered', class: 'status-endangered', desc: 'Hawksbill turtles are poached for their beautiful shells and are critically endangered.' },
    'saola':             { status: 'Critically Endangered', class: 'status-endangered', desc: 'The saola is one of the rarest mammals on Earth, discovered only in 1992.' },
    'philippine eagle':  { status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 800 Philippine eagles remain due to deforestation.' },
    'kakapo':            { status: 'Critically Endangered', class: 'status-endangered', desc: 'The flightless kakapo parrot has around 250 individuals, all in managed programs.' },
    'california condor': { status: 'Critically Endangered', class: 'status-endangered', desc: 'California condors were reduced to 22 birds in 1987; captive breeding has increased numbers.' },
    'sumatran tiger':    { status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 400 Sumatran tigers remain, threatened by poaching and deforestation.' },
    'pangolin':          { status: 'Critically Endangered', class: 'status-endangered', desc: 'Pangolins are the most trafficked mammals in the world.' },
    'gharial':           { status: 'Critically Endangered', class: 'status-endangered', desc: 'Gharials are fish-eating crocodilians with fewer than 650 adults remaining.' },
    'sawfish':           { status: 'Critically Endangered', class: 'status-endangered', desc: 'All sawfish species are critically endangered from bycatch and habitat loss.' },
    'addax':             { status: 'Critically Endangered', class: 'status-endangered', desc: 'Fewer than 100 addax remain in the Sahara due to uncontrolled hunting.' },
    'rhino':             { status: 'Critically Endangered', class: 'status-endangered', desc: 'Rhinos are critically endangered mostly due to severe poaching for their horns.' },
    'gorilla':           { status: 'Critically Endangered', class: 'status-endangered', desc: 'Gorillas face critical threats from poaching, habitat destruction, and disease.' },

    // ── Endangered (EN) ─────────────────────────────────────────────────────
    'tiger':             { status: 'Endangered', class: 'status-endangered', desc: 'Fewer than 4,500 tigers remain in the wild due to poaching and habitat loss.' },
    'asian elephant':    { status: 'Endangered', class: 'status-endangered', desc: 'Asian elephant populations have declined by at least 50% over three generations.' },
    'blue whale':        { status: 'Endangered', class: 'status-endangered', desc: 'The largest animal ever, reduced to 10,000–25,000 by commercial whaling.' },
    'green turtle':      { status: 'Endangered', class: 'status-endangered', desc: 'Green turtles are endangered from harvesting, bycatch, and coastal development.' },
    'bonobo':            { status: 'Endangered', class: 'status-endangered', desc: 'Bonobos are found only in the DRC and face hunting and habitat loss threats.' },
    'snow leopard':      { status: 'Endangered', class: 'status-endangered', desc: 'Around 4,000–6,500 snow leopards remain in Central Asian mountain ranges.' },
    'african wild dog':  { status: 'Endangered', class: 'status-endangered', desc: 'Fewer than 6,600 African wild dogs remain, threatened by habitat fragmentation.' },
    'chimpanzee':        { status: 'Endangered', class: 'status-endangered', desc: 'Chimpanzees face severe threats from habitat destruction, bushmeat hunting, and disease.' },
    'red panda':         { status: 'Endangered', class: 'status-endangered', desc: 'Fewer than 10,000 red pandas remain due to deforestation and poaching.' },
    'african penguin':   { status: 'Endangered', class: 'status-endangered', desc: 'African penguin populations have crashed by 90% since pre-industrial times.' },
    'whale shark':       { status: 'Endangered', class: 'status-endangered', desc: 'The largest fish in the sea is endangered from bycatch and vessel strikes.' },
    'african grey parrot':{ status: 'Endangered', class: 'status-endangered', desc: 'Illegal trapping for the pet trade has devastated wild African grey parrot populations.' },
    'fin whale':         { status: 'Endangered', class: 'status-endangered', desc: 'Fin whales were heavily hunted and remain endangered despite some population recovery.' },
    'sei whale':         { status: 'Endangered', class: 'status-endangered', desc: 'Sei whales are the third-largest whale species, still recovering from whaling.' },
    'komodo dragon':     { status: 'Endangered', class: 'status-endangered', desc: 'Komodo dragons are endangered due to climate change and shrinking habitat on Indonesian islands.' },
    'koala':             { status: 'Endangered', class: 'status-endangered', desc: 'Koalas in eastern Australia are endangered from bushfires, disease, and habitat clearing.' },
    'loggerhead turtle': { status: 'Endangered', class: 'status-endangered', desc: 'Loggerhead turtles face threats from fishing bycatch and coastal development.' },
    'leatherback turtle':{ status: 'Endangered', class: 'status-endangered', desc: 'The largest sea turtle is endangered from fishing bycatch and egg harvesting.' },
    'mandrill':          { status: 'Endangered', class: 'status-endangered', desc: 'Mandrills are the world\'s largest monkeys, threatened by hunting and logging.' },
    'elephant':          { status: 'Endangered', class: 'status-endangered', desc: 'African and Asian elephants face severe threats from ivory poaching and habitat loss.' },

    // ── Vulnerable (VU) ─────────────────────────────────────────────────────
    'lion':              { status: 'Vulnerable', class: 'status-vulnerable', desc: 'African lion populations have halved in 25 years; around 23,000 remain.' },
    'cheetah':           { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Fewer than 7,000 cheetahs remain, with 90% of their historical range lost.' },
    'giant panda':       { status: 'Vulnerable', class: 'status-vulnerable', desc: 'About 1,860 giant pandas live in the wild thanks to China\'s conservation efforts.' },
    'panda':             { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Giant pandas are vulnerable. Conservation efforts have helped, but habitat loss persists.' },
    'polar bear':        { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Around 22,000–31,000 polar bears remain, threatened by Arctic sea ice loss.' },
    'hippopotamus':      { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Hippo populations have declined due to habitat loss and illegal ivory trade in their teeth.' },
    'leopard':           { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Leopards are declining across Africa and Asia from poaching and habitat fragmentation.' },
    'great white shark': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Great white sharks are vulnerable from bycatch, trophy hunting, and declining prey.' },
    'emperor penguin':   { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Emperor penguins are highly vulnerable to climate change and Antarctic sea ice loss.' },
    'sea otter':         { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Sea otters were nearly hunted to extinction for their fur and remain vulnerable.' },
    'walrus':            { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Walruses face threats from climate change reducing the Arctic sea ice they depend on.' },
    'orca':              { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Several orca populations are declining from pollution, prey depletion, and vessel noise.' },
    'manta ray':         { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Manta rays are targeted for their gill rakers in traditional medicine.' },
    'sun bear':          { status: 'Vulnerable', class: 'status-vulnerable', desc: 'The world\'s smallest bear, threatened by deforestation and bile farming.' },
    'sloth bear':        { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Sloth bears are declining from habitat loss and conflict with humans in South Asia.' },
    'king cobra':        { status: 'Vulnerable', class: 'status-vulnerable', desc: 'The world\'s longest venomous snake is vulnerable from habitat loss and persecution.' },
    'nile crocodile':    { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Nile crocodiles have recovered in some areas but remain vulnerable from hunting.' },
    'harpy eagle':       { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Harpy eagles are the most powerful raptors, threatened by tropical deforestation.' },
    'penguin':           { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Many penguin species are vulnerable to climate change and overfishing.' },
    'whale':             { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Many whale species remain vulnerable from ship strikes, bycatch, and ocean noise.' },
    'manatee':           { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Manatees are vulnerable from boat strikes, cold stress, and habitat degradation.' },
    'dugong':            { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Dugongs are vulnerable from bycatch, seagrass loss, and coastal development.' },
    'wolverine':         { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Wolverines are vulnerable due to climate change reducing their snowpack habitat.' },
    'python':            { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Many large python species are vulnerable from skin trade and habitat loss.' },
    'monitor lizard':    { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Monitor lizards face hunting for their skin, meat, and traditional medicine.' },
    'hammerhead shark':  { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Hammerhead sharks are heavily overfished for their fins globally.' },

    // ── Near Threatened (NT) ────────────────────────────────────────────────
    'jaguar':            { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Jaguars have lost about 50% of their historical range to deforestation.' },
    'gray wolf':         { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Gray wolves have recovered in some regions but remain persecuted in others.' },
    'narwhal':           { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Narwhals are sensitive to climate change affecting their Arctic sea ice habitat.' },
    'bald eagle':        { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Bald eagles recovered dramatically after DDT bans; populations are stable.' },
    'golden eagle':      { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Golden eagles face threats from wind turbines, lead poisoning, and habitat loss.' },
    'peregrine falcon':  { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Peregrine falcons are the fastest animals on Earth, recovering from pesticide effects.' },
    'flamingo':          { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Some flamingo species face threats from habitat loss and water pollution.' },
    'ocelot':            { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Ocelots are declining from habitat fragmentation across the Americas.' },
    'serval':            { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Servals face habitat loss as African wetlands and grasslands are converted.' },
    'caribou':           { status: 'Near Threatened', class: 'status-vulnerable', desc: 'Caribou/reindeer populations are declining significantly across the Arctic.' },

    // ── Least Concern (LC) ──────────────────────────────────────────────────
    'dog':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic dogs are the most widespread domesticated animal, not at risk.' },
    'cat':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic cats have very large and stable global populations.' },
    'red fox':           { status: 'Least Concern', class: 'status-least-concern', desc: 'Red foxes are one of the most widely distributed wild carnivores.' },
    'fox':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Red foxes are highly adaptable and globally distributed.' },
    'raccoon':           { status: 'Least Concern', class: 'status-least-concern', desc: 'Raccoons are highly adaptable and thriving in urban environments.' },
    'coyote':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Coyotes have expanded their range dramatically across North America.' },
    'pigeon':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Rock pigeons are one of the most successful urban bird species globally.' },
    'squirrel':          { status: 'Least Concern', class: 'status-least-concern', desc: 'Eastern gray squirrels are abundant and widespread.' },
    'rabbit':            { status: 'Least Concern', class: 'status-least-concern', desc: 'European rabbits are widely distributed and have large stable populations.' },
    'mouse':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Mice are highly adaptable and widespread globally.' },
    'rat':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Brown and black rats are among the most widespread mammals on Earth.' },
    'horse':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic horses have large global populations and are not at risk.' },
    'cow':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic cattle number over 1 billion worldwide.' },
    'sheep':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Domesticated sheep have large, stable populations worldwide.' },
    'goat':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic goats are one of the oldest domesticated species, numbering over 1 billion.' },
    'deer':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Most deer populations, like white-tailed deer, are stable or increasing.' },
    'moose':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Moose are widespread across the Northern Hemisphere in boreal forests.' },
    'humpback whale':    { status: 'Least Concern', class: 'status-least-concern', desc: 'Humpback whales have recovered well from commercial whaling.' },
    'alligator':         { status: 'Least Concern', class: 'status-least-concern', desc: 'American alligators recovered dramatically after conservation measures in the 1960s.' },
    'robin':             { status: 'Least Concern', class: 'status-least-concern', desc: 'American and European robins have large, stable populations.' },
    'crow':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Crows are highly intelligent and adaptable birds with stable populations.' },
    'sparrow':           { status: 'Least Concern', class: 'status-least-concern', desc: 'House sparrows are widespread, though some urban populations are declining.' },
    'chicken':           { status: 'Least Concern', class: 'status-least-concern', desc: 'Chickens are the most numerous bird species, with over 33 billion alive at any time.' },
    'duck':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Mallard ducks and most domestic duck breeds are very common and widespread.' },
    'frog':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Common frogs are widespread, though many rare species are critically endangered.' },
    'gecko':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Common gecko species like the tokay gecko are widespread and abundant.' },
    'iguana':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Green iguanas are widespread across Central and South America.' },
    'tortoise':          { status: 'Least Concern', class: 'status-least-concern', desc: 'Some tortoise species are common, though many island species are critically endangered.' },
    'camel':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic camels number over 35 million and are not at risk.' },
    'llama':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Llamas are domesticated South American camelids with stable populations.' },
    'donkey':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic donkeys number over 40 million worldwide.' },
    'bear':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Brown/grizzly bears are widespread across the Northern Hemisphere.' },
    'wolf':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Gray wolves have recovered in many regions and have stable global populations.' },
    'dolphin':           { status: 'Least Concern', class: 'status-least-concern', desc: 'Common bottlenose dolphins are widespread across tropical and temperate oceans.' },
    'zebra':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Plains zebras are the most common zebra species with large populations.' },
    'giraffe':           { status: 'Least Concern', class: 'status-least-concern', desc: 'Some giraffe subspecies are stable, though others face severe decline.' },
    'snake':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Most common snake species like corn snakes and king snakes are of least concern.' },
    'lizard':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Most common lizard species have stable populations worldwide.' },
    'parrot':            { status: 'Least Concern', class: 'status-least-concern', desc: 'Many parrot species are common, though some tropical species are endangered.' },
    'eagle':             { status: 'Least Concern', class: 'status-least-concern', desc: 'Bald eagles and many other eagle species have recovered well from historical declines.' },
    'hawk':              { status: 'Least Concern', class: 'status-least-concern', desc: 'Red-tailed hawks and similar species are widespread and abundant.' },
    'owl':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Great horned owls and barn owls have large, stable populations.' },
    'crocodile':         { status: 'Least Concern', class: 'status-least-concern', desc: 'American and saltwater crocodiles have recovered through conservation programs.' },
    'boa':               { status: 'Least Concern', class: 'status-least-concern', desc: 'Common boa constrictors are widespread across Central and South America.' },

    // ── Fallback ────────────────────────────────────────────────────────────
    'bird':              { status: 'Varies',         class: 'status-unknown', desc: 'Conservation status varies across bird species — many common birds are of least concern.' },
    'fish':              { status: 'Varies',         class: 'status-unknown', desc: 'Fish conservation status varies widely by species and region.' },
    'insect':            { status: 'Not Evaluated',  class: 'status-unknown', desc: 'Most insect species have not been formally evaluated by the IUCN.' },
    'default':           { status: 'Unknown Status', class: 'status-unknown', desc: 'We could not pinpoint the exact conservation status for this species based on the AI scan.' }
};

function findLocalStatus(name) {
    const lower = name.toLowerCase();
    // Sort keys by length (longest first) so more-specific matches win
    // e.g. "snow leopard" matches before generic "leopard"
    const keys = Object.keys(CONSERVATION_DATA)
        .filter(k => k !== 'default')
        .sort((a, b) => b.length - a.length);
    for (const keyword of keys) {
        if (lower.includes(keyword)) return CONSERVATION_DATA[keyword];
    }
    return null;
}

// =============================================================================
// DOM Elements
// =============================================================================
const dropArea       = document.getElementById('drop-area');
const fileInput      = document.getElementById('file-input');
const imagePreview   = document.getElementById('image-preview');
const loadingSpinner = document.getElementById('loading-spinner');
const resultView     = document.getElementById('result-view');
const btnReset       = document.getElementById('reset-btn');
const rootElement    = document.documentElement;

// Camera elements (IDs match index.html)
const useCameraBtn   = document.getElementById('use-camera-btn');
const cameraView     = document.getElementById('camera-view');
const cameraVideo    = document.getElementById('camera-video');
const captureBtn     = document.getElementById('capture-btn');
const cancelCameraBtn = document.getElementById('cancel-camera-btn');
let cameraStream = null;

// =============================================================================
// Camera Logic
// =============================================================================
useCameraBtn.addEventListener('click', async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        cameraVideo.srcObject = cameraStream;
        dropArea.setAttribute('hidden', 'true');
        useCameraBtn.setAttribute('hidden', 'true');
        cameraView.removeAttribute('hidden');
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Camera access denied or unavailable. Make sure you are using a secure connection (HTTPS or localhost).');
    }
});

captureBtn.addEventListener('click', async () => {
    // Capture and mirror the frame
    const canvas   = document.createElement('canvas');
    canvas.width   = cameraVideo.videoWidth;
    canvas.height  = cameraVideo.videoHeight;
    const ctx      = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    // Stop the stream
    stopCamera();
    cameraView.setAttribute('hidden', 'true');

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Show preview & spinner before calling backend
    imagePreview.src    = dataUrl;
    imagePreview.hidden = false;
    dropArea.setAttribute('hidden', 'true');
    useCameraBtn.setAttribute('hidden', 'true');
    loadingSpinner.removeAttribute('hidden');

    // Try the dedicated /predict-webcam endpoint first
    try {
        const response = await fetch(`${API_BASE_URL}/predict-webcam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: dataUrl })
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('[webcam] Backend prediction:', result);
                displayResults([{ className: result.prediction, probability: result.confidence }]);
                return;
            }
        }
    } catch (err) {
        console.warn('[webcam] /predict-webcam unavailable, falling back to MobileNet.', err);
    }

    // Fallback: run standard image analysis
    startAnalysis();
});

cancelCameraBtn.addEventListener('click', () => {
    stopCamera();
    cameraView.setAttribute('hidden', 'true');
    dropArea.removeAttribute('hidden');
    useCameraBtn.removeAttribute('hidden');
});

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraVideo.srcObject = null;
}

// =============================================================================
// Drag & Drop / File Upload
// =============================================================================
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    dropArea.addEventListener(ev, preventDefaults, false);
    document.body.addEventListener(ev, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(ev => dropArea.addEventListener(ev, () => dropArea.classList.add('dragover'), false));
['dragleave', 'drop'].forEach(ev => dropArea.addEventListener(ev, () => dropArea.classList.remove('dragover'), false));

dropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files), false);
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function () {
    if (this.files && this.files.length) handleFiles(this.files);
});

function handleFiles(files) {
    const file = files[0];
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => processImage(reader.result);
}

// =============================================================================
// Core Image Processing
// =============================================================================
async function processImage(dataUrl) {
    imagePreview.src    = dataUrl;
    imagePreview.hidden = false;
    dropArea.setAttribute('hidden', 'true');
    useCameraBtn.setAttribute('hidden', 'true');
    loadingSpinner.removeAttribute('hidden');

    // 1. Try the custom Keras reptile model via Flask backend
    const reptileResult = await tryReptileModel(dataUrl);

    if (reptileResult && reptileResult.success) {
        console.log('Reptile model prediction:', reptileResult);
        displayResults([{ className: reptileResult.prediction + ', reptile', probability: reptileResult.confidence }]);
    } else {
        console.warn('Reptile model unavailable — falling back to MobileNet.');
        startAnalysis();
    }
}

async function tryReptileModel(base64Image) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict-reptile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// =============================================================================
// MobileNet Fallback
// =============================================================================
let mobileNetModel;

async function loadModel() {
    console.log('Loading MobileNet model...');
    try {
        mobileNetModel = await mobilenet.load();
        console.log('MobileNet loaded.');
    } catch (e) {
        console.error('Failed to load MobileNet:', e);
    }
}
loadModel();

async function startAnalysis() {
    if (!mobileNetModel) {
        alert('AI model is still loading — please wait a moment.');
        return;
    }
    setTimeout(async () => {
        try {
            const predictions = await mobileNetModel.classify(imagePreview);
            displayResults(predictions);
        } catch (error) {
            console.error('Classification error:', error);
            alert('Error analysing image. Please try another.');
            resetApp();
        }
    }, 500);
}

// =============================================================================
// Conservation Status Lookup
// =============================================================================
async function matchConservationStatus(speciesName) {
    const queryName = speciesName.split(',')[0].trim();
    let result = {
        status: 'Status Unavailable',
        class:  'status-unknown',
        desc:   `We could not automatically retrieve the conservation status for "${queryName}".`
    };

    // 1. Fast local dict check
    const localData = findLocalStatus(queryName);
    if (localData) {
        result.status = localData.status;
        result.class  = localData.class;
        result.desc   = localData.desc;
    }

    // 2. SQL database server (via Flask proxy)
    try {
        const resp = await fetch(`${API_BASE_URL}/api/status?animal=${encodeURIComponent(queryName)}`);
        if (resp.ok) {
            const dbData = await resp.json();
            if (dbData && dbData.status) {
                result.status = dbData.status;
                result.class  = dbData.class;
            }
        }
    } catch (e) {
        console.warn('DB server unreachable, using local/Wikipedia fallback.', e);
    }

    // 3. Wikipedia for description + extra status
    try {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions|extracts&rvprop=content&rvsection=0&exintro=1&explaintext=1&titles=${encodeURIComponent(queryName)}&format=json&origin=*`;
        const data     = await (await fetch(endpoint)).json();
        const pages    = data.query.pages;
        const pageId   = Object.keys(pages)[0];

        if (pageId !== '-1') {
            const page    = pages[pageId];
            const content = page.revisions ? page.revisions[0]['*'] : '';
            const summary = page.extract || '';

            if (summary) result.desc = summary.split('. ').slice(0, 2).join('. ') + '.';

            // Only overwrite status if we don't already have a good match
            if (!localData) {
                const statusMatch = content.match(/status\s*=\s*([A-Za-z]+)/i);
                const statusMap = {
                    'EX': { text: 'Extinct',              class: 'status-endangered' },
                    'EW': { text: 'Extinct in the Wild',  class: 'status-endangered' },
                    'CR': { text: 'Critically Endangered',class: 'status-endangered' },
                    'EN': { text: 'Endangered',           class: 'status-endangered' },
                    'VU': { text: 'Vulnerable',           class: 'status-vulnerable' },
                    'NT': { text: 'Near Threatened',      class: 'status-vulnerable' },
                    'LC': { text: 'Least Concern',        class: 'status-least-concern' },
                    'DD': { text: 'Data Deficient',       class: 'status-unknown' },
                    'NE': { text: 'Not Evaluated',        class: 'status-unknown' },
                };
                if (statusMatch && statusMatch[1]) {
                    const code = statusMatch[1].toUpperCase();
                    if (statusMap[code]) { result.status = statusMap[code].text; result.class = statusMap[code].class; }
                } else {
                    const lc = summary.toLowerCase();
                    if      (lc.includes('endangered'))   { result.status = 'Endangered';   result.class = 'status-endangered'; }
                    else if (lc.includes('vulnerable'))   { result.status = 'Vulnerable';   result.class = 'status-vulnerable'; }
                    else if (lc.includes('least concern')){ result.status = 'Least Concern';result.class = 'status-least-concern'; }
                    else if (lc.includes('domesticated')) { result.status = 'Domesticated'; result.class = 'status-least-concern'; }
                }
            }
        }
    } catch (e) {
        console.error('Wikipedia fetch error:', e);
    }

    return result;
}

// =============================================================================
// Display Results
// =============================================================================
async function displayResults(predictions) {
    console.log('Predictions:', predictions);
    const topResult        = predictions[0];
    const speciesNameRaw   = topResult.className.split(',')[0];
    const confidencePercent = Math.round(topResult.probability * 100);

    document.getElementById('species-name').textContent    = speciesNameRaw;
    document.getElementById('confidence-text').textContent = confidencePercent + '%';
    setTimeout(() => { document.getElementById('confidence-fill').style.width = confidencePercent + '%'; }, 100);

    const conservationInfo = await matchConservationStatus(speciesNameRaw);

    loadingSpinner.setAttribute('hidden', 'true');
    resultView.removeAttribute('hidden');

    document.getElementById('status-badge').textContent = conservationInfo.status;
    document.getElementById('status-desc').textContent  = conservationInfo.desc;

    rootElement.className = '';
    rootElement.classList.add(conservationInfo.class);
    document.getElementById('result-view').className = `result-view ${conservationInfo.class}`;
}

// =============================================================================
// Reset
// =============================================================================
btnReset.addEventListener('click', resetApp);

function resetApp() {
    fileInput.value         = '';
    imagePreview.src        = '';
    imagePreview.hidden     = true;

    resultView.setAttribute('hidden', 'true');
    dropArea.removeAttribute('hidden');
    useCameraBtn.removeAttribute('hidden');

    document.getElementById('confidence-fill').style.width = '0%';
    rootElement.className = '';
    document.getElementById('result-view').className = 'result-view';

    stopCamera();
    cameraView.setAttribute('hidden', 'true');
}
