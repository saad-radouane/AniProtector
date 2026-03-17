// Conservation Dictionary mapping keywords to statuses
const CONSERVATION_DATA = {
    // Endangered High Priority
    'tiger': { status: 'Endangered', class: 'status-endangered', desc: 'Tigers are listed as endangered due to poaching, habitat destruction, and human-wildlife conflict.' },
    'elephant': { status: 'Endangered', class: 'status-endangered', desc: 'African and Asian elephants face severe threats from ivory poaching and habitat loss.' },
    'rhino': { status: 'Critically Endangered', class: 'status-endangered', desc: 'Rhinos are critically endangered mostly due to severe poaching for their horns.' },
    'gorilla': { status: 'Critically Endangered', class: 'status-endangered', desc: 'Gorillas face critical threats from poaching, habitat destruction, and disease.' },
    'orangutan': { status: 'Critically Endangered', class: 'status-endangered', desc: 'Deforestation for palm oil plantations poses a massive threat to orangutans.' },
    'panda': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Giant pandas are vulnerable. Conservation efforts have improved their numbers, but habitat loss remains a threat.' },
    'turtle': { status: 'Endangered', class: 'status-endangered', desc: 'Many marine turtle species are endangered due to bycatch, climate change, and habitat destruction.' },
    'leopard': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Leopard populations are vulnerable and declining due to habitat fragmentation and conflict.' },
    'cheetah': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Cheetahs are vulnerable due to low genetic diversity and extensive habitat loss.' },
    'lion': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'African lion populations have decreased dramatically, making them vulnerable.' },
    'polar bear': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Polar bears are primarily threatened by the rapid loss of sea ice due to climate change.' },
    'koala': { status: 'Endangered', class: 'status-endangered', desc: 'Koalas in certain regions are facing severe habitat destruction and disease.' },
    'penguin': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Many penguin species are vulnerable to climate change and overfishing affecting their food supply.' },
    'whale': { status: 'Vulnerable', class: 'status-vulnerable', desc: 'Various whale species face threats from ship strikes, entanglement, and ocean noise.' },
    
    // Pets & Least Concern Output (Common Animals)
    'dog': { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic dogs are widespread and not at risk of extinction.' },
    'cat': { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic cats have a stable population.' },
    'bird': { status: 'Varies', class: 'status-unknown', desc: 'Conservation status varies wildly across bird species. Many common birds are of least concern.' },
    'mouse': { status: 'Least Concern', class: 'status-least-concern', desc: 'Mice are highly adaptable and widespread globally.' },
    'horse': { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic horses are widespread globally.' },
    'cow': { status: 'Least Concern', class: 'status-least-concern', desc: 'Domestic cattle populations are vast and globally distributed.' },
    'sheep': { status: 'Least Concern', class: 'status-least-concern', desc: 'Domesticated sheep have large, stable populations.' },
    'fox': { status: 'Least Concern', class: 'status-least-concern', desc: 'Red foxes are highly adaptable and globally distributed.' },
    'deer': { status: 'Least Concern', class: 'status-least-concern', desc: 'Most deer populations, such as whitetail deer, are stable or increasing.' },
    
    // Fallback System
    'default': { status: 'Unknown Status', class: 'status-unknown', desc: 'We could not pinpoint the exact conservation status for this specific species variation based on the AI scan.' }
};

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const loadingSpinner = document.getElementById('loading-spinner');
const resultView = document.getElementById('result-view');
const btnReset = document.getElementById('reset-btn');
const rootElement = document.documentElement;

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('dragover');
    }, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function() {
    if (this.files && this.files.length) {
        handleFiles(this.files);
    }
});

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async function() {
        imagePreview.src = reader.result;
        imagePreview.hidden = false;
        
        // Update UI State for loading
        dropArea.setAttribute('hidden', 'true');
        loadingSpinner.removeAttribute('hidden');
        
        // 1. Try Custom Reptile Model (Python Backend) First!
        const reptileResult = await tryReptileModel(reader.result);
        
        if (reptileResult && reptileResult.success) {
            // It successfully predicted from our custom Keras model
            console.log("Reptile Model Prediction:", reptileResult);
            // Construct a fake predictions block to reuse our display logic
            // We append ", reptile" so our status lookup might catch it
            const customPredictions = [{
                className: reptileResult.prediction + ", reptile",
                probability: reptileResult.confidence
            }];
            displayResults(customPredictions);
        } else {
            console.warn("Reptile model unavailable or failed. Falling back to tfjs MobileNet.");
            // 2. Fallback to standard MobileNet
            startAnalysis();
        }
    }
}

// Function to call the local Python Flask Server
async function tryReptileModel(base64Image) {
    try {
        const response = await fetch('http://localhost:5000/predict-reptile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        });
        
        if (!response.ok) {
            return null; // Model not loaded or server error
        }
        
        return await response.json();
    } catch (e) {
        // Server is likely offline
        return null;
    }
}

let model;

// Load MobileNet Model on Initialization
async function loadModel() {
    console.log("Loading MobileNet Model...");
    try {
        model = await mobilenet.load();
        console.log("Model loaded successfully");
    } catch (e) {
        console.error("Failed to load the AI model:", e);
        alert("Failed to load AI model. Please check internet connection.");
    }
}

// Trigger loading as soon as page is reached
loadModel();

async function startAnalysis() {
    if(!model) {
        alert("Please wait, the AI models are still loading in the background.");
        return;
    }
    
    // Ensure the image preview is fully loaded and drawn before passing to tfjs
    setTimeout(async () => {
        try {
            const predictions = await model.classify(imagePreview);
            displayResults(predictions);
        } catch (error) {
            console.error("Classification error:", error);
            alert("Error analyzing image. Please try another one.");
            resetApp();
        }
    }, 500); // UI visual delay for smooth transition
}

async function matchConservationStatus(speciesName) {
    // Attempt to extract the base animal name
    // MobileNet often returns strings like "African elephant, Loxodonta africana"
    let queryName = speciesName.split(',')[0].trim();
    
    // Fallback default
    let result = {
        status: 'Status Unavailable',
        class: 'status-unknown',
        desc: `We could not automatically retrieve the specific conservation status for the ${queryName} from our biological databases.`
    };
    
    // 1. Check our robust local database provided by the user first!
    const localData = findLocalStatus(queryName);
    if (localData) {
        result.status = localData.status;
        result.class = localData.class;
    }

    try {
        // Query Wikipedia API for the page summary and infobox data
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions|extracts&rvprop=content&rvsection=0&exintro=1&explaintext=1&titles=${encodeURIComponent(queryName)}&format=json&origin=*`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId !== "-1") {
            const page = pages[pageId];
            const content = page.revisions ? page.revisions[0]['*'] : '';
            const summary = page.extract || '';

            // Update description with actual Wikipedia summary
            if(summary) {
                // Get the first sentence or two
                result.desc = summary.split('. ').slice(0, 2).join('. ') + '.';
            }
            
            // Try to parse conservation status from the infobox ONLY if we didn't find a high-accuracy match locally
            if (!localData) {
                const statusMatch = content.match(/status\s*=\s*([A-Za-z]+)/i);
                
                // Map common IUCN status codes to full text and CSS classes
                const statusMap = {
                    'EX': { text: 'Extinct', class: 'status-endangered' },
                    'EW': { text: 'Extinct in the Wild', class: 'status-endangered' },
                    'CR': { text: 'Critically Endangered', class: 'status-endangered' },
                    'EN': { text: 'Endangered', class: 'status-endangered' },
                    'VU': { text: 'Vulnerable', class: 'status-vulnerable' },
                    'NT': { text: 'Near Threatened', class: 'status-vulnerable' },
                    'LC': { text: 'Least Concern', class: 'status-least-concern' },
                    'DD': { text: 'Data Deficient', class: 'status-unknown' },
                    'NE': { text: 'Not Evaluated', class: 'status-unknown' },
                    // Full word fallbacks just in case
                    'endangered': { text: 'Endangered', class: 'status-endangered' },
                    'vulnerable': { text: 'Vulnerable', class: 'status-vulnerable' },
                    'least concern': { text: 'Least Concern', class: 'status-least-concern' },
                    'domesticated': { text: 'Domesticated', class: 'status-least-concern' }
                };

                if (statusMatch && statusMatch[1]) {
                    const code = statusMatch[1].toUpperCase();
                    if (statusMap[code]) {
                        result.status = statusMap[code].text;
                        result.class = statusMap[code].class;
                    } else if (statusMap[statusMatch[1].toLowerCase()]) {
                         result.status = statusMap[statusMatch[1].toLowerCase()].text;
                         result.class = statusMap[statusMatch[1].toLowerCase()].class;
                    } else {
                        result.status = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1);
                        result.class = 'status-vulnerable';
                    }
                } else {
                     // Fallback to keyword search in summary
                     const lowerSummary = summary.toLowerCase();
                     if(lowerSummary.includes('endangered')) { result.status = 'Endangered'; result.class = 'status-endangered'; }
                     else if(lowerSummary.includes('vulnerable')) { result.status = 'Vulnerable'; result.class = 'status-vulnerable'; }
                     else if(lowerSummary.includes('least concern')) { result.status = 'Least Concern'; result.class = 'status-least-concern'; }
                     else if(lowerSummary.includes('domesticated') || lowerSummary.includes('pet')) { result.status = 'Domesticated / LC'; result.class = 'status-least-concern'; }
                }
            }
        }
    } catch (e) {
        console.error("Error fetching conservation data:", e);
    }

    return result;
}

async function displayResults(predictions) {
    console.log("Predictions:", predictions);
    
    // We take the top prediction
    const topResult = predictions[0];
    const speciesNameRaw = topResult.className.split(',')[0]; // Simplify name output
    const probability = topResult.probability;
    const confidencePercent = Math.round(probability * 100);
    
    // Update DOM texts
    document.getElementById('species-name').textContent = speciesNameRaw;
    document.getElementById('confidence-text').textContent = confidencePercent + "%";
    
    // Trigger progress bar animation
    setTimeout(() => {
        document.getElementById('confidence-fill').style.width = confidencePercent + "%";
    }, 100);

    // Get conservation status (Now asynchronous)
    const conservationInfo = await matchConservationStatus(speciesNameRaw);
    
    // Hide spinner, show results NOW that API call is done
    loadingSpinner.setAttribute('hidden', 'true');
    resultView.removeAttribute('hidden');
    
    // Update Status card UI
    document.getElementById('status-badge').textContent = conservationInfo.status;
    document.getElementById('status-desc').textContent = conservationInfo.desc;
    
    // Apply theme container styling
    rootElement.className = ''; // remove existing
    rootElement.classList.add(conservationInfo.class);
    // Remove individual card classes to replace cleanly via generic parent targeting
    document.getElementById('result-view').className = `result-view ${conservationInfo.class}`;
}

btnReset.addEventListener('click', resetApp);

function resetApp() {
    fileInput.value = "";
    imagePreview.src = "";
    imagePreview.hidden = true;
    
    resultView.setAttribute('hidden', 'true');
    dropArea.removeAttribute('hidden');
    
    // Reset bar
    document.getElementById('confidence-fill').style.width = "0%";
    
    // Reset style classes
    rootElement.className = '';
    document.getElementById('result-view').className = 'result-view';
}
