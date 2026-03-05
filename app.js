// Database of activities indicating various categories, names, and relative costs.
const ACTIVITIES = {
    restaurant: [
        { name: "Sri Hari Kiran Family Restaurant", cost: 1500 },
        { name: "Garlica Multicuisine Restaurant", cost: 1200 },
        { name: "Mehfil Restaurant", cost: 1000 },
        { name: "Lucky9 Tadipatri Biryani Center", cost: 800 },
        { name: "Pisata House", cost: 600 },
        { name: "Mamtha hotel (Veg/Tiffin)", cost: 300 }
    ],
    movies: [
        { name: "Neelima 4K Dolby 7.1", cost: 500 },
        { name: "SV Cinemax 4K Dolby Atmos", cost: 400 },
        { name: "V Mega Triveni Complex", cost: 350 },
        { name: "S2 Cinemas", cost: 400 },
        { name: "Gowri Cinema Hall", cost: 400 }
    ],
    trip: [
        { name: "Lepakshi Temple Visit", cost: 2500 },
        { name: "Penukonda Fort Exploration", cost: 2500 },
        { name: "Gooty Fort Trek", cost: 1500 },
        { name: "Yadiki Caves Adventure", cost: 2000 },
        { name: "ISKCON Temple, Anantapur", cost: 200 },
        { name: "Thimmamma Marrimanu Trip", cost: 1200 }
    ],
    shopping: [
        { name: "CMR Shopping Mall Spree", cost: 2000 },
        { name: "Trends Shopping", cost: 2500},
        { name: "Zudio Shopping", cost: 1800 },
        { name: "Dress Circle Shopping Mall", cost: 1700 },
        { name: "Anantapur Market Yard Visit", cost: 1500 }
    ],
    nightlife: [
        { name: "Dashmesh Punjabi Dhaba (Late Night)", cost: 1200 },
        { name: "Mg Dhaba, Kirikera", cost: 1500 },
        { name: "Hari Kiran Dhaba", cost: 1000 },
        { name: "Highway Dolphin's Dhaba", cost: 800 },
        { name: "Midnight Street Food / Biryani", cost: 500 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // References to buttons
    const generateBtn = document.getElementById('generateBtn');
    const replanBtn = document.getElementById('replanBtn');
    const reshuffleBtn = document.getElementById('reshuffleBtn');

    // References to sections
    const setupSection = document.getElementById('setupSection');
    const resultsSection = document.getElementById('resultsSection');

    // References to inputs & displays
    const budgetInput = document.getElementById('budget');
    const totalBudgetDisplay = document.getElementById('totalBudgetDisplay');
    const totalSpentDisplay = document.getElementById('totalSpentDisplay');
    const totalRemainingDisplay = document.getElementById('totalRemainingDisplay');
    const itineraryContainer = document.getElementById('itineraryContainer');

    let currentBudget = 0;
    let currentPreferences = [];

    // Helper to format monetary values cleanly
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Helper to shuffle arrays randomly
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    // Main generate function triggered by user interaction
    const generateItinerary = () => {
        const budgetVal = parseFloat(budgetInput.value);
        if (isNaN(budgetVal) || budgetVal <= 0) {
            // Animate error state briefly instead of generic alert
            budgetInput.style.borderColor = 'var(--danger)';
            budgetInput.style.animation = 'bounce 0.5s ease';
            setTimeout(() => { budgetInput.style.animation = ''; }, 500);
            return;
        }
        currentBudget = budgetVal;

        // Collect what the user desires
        currentPreferences = Array.from(document.querySelectorAll('.pref-checkbox:checked'))
            .map(cb => cb.value);

        // Defaulting if nothing is checked
        if (currentPreferences.length === 0) {
            currentPreferences = Object.keys(ACTIVITIES);
            // Visually check them too!
            document.querySelectorAll('.pref-checkbox').forEach(cb => cb.checked = true);
        }

        buildAndDisplayPlan();

        // Hide config, show results
        setupSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Logic to select the best combo within budget
    const buildAndDisplayPlan = () => {
        itineraryContainer.innerHTML = '';

        let availableBudget = currentBudget;
        let selectedActivities = [];

        // Shuffle the selected preferences so the primary choices rotate
        let shuffledPreferences = shuffleArray(currentPreferences);

        // Pass 1: Grab at least one element per user-preferred category
        for (const category of shuffledPreferences) {
            const acts = shuffleArray(ACTIVITIES[category]);

            let chosen = null;
            for (const act of acts) {
                if (act.cost <= availableBudget) {
                    chosen = { ...act, category };
                    break;
                }
            }

            if (chosen) {
                selectedActivities.push(chosen);
                availableBudget -= chosen.cost;
            }
        }

        // Pass 2: If we still have budget left, fill in with more variety across selections
        if (availableBudget >= 15) {
            let allPreferredActivities = [];
            currentPreferences.forEach(pref => {
                allPreferredActivities = [...allPreferredActivities, ...ACTIVITIES[pref].map(a => ({ ...a, category: pref }))];
            });
            allPreferredActivities = shuffleArray(allPreferredActivities); // Randomize heavily

            for (const act of allPreferredActivities) {
                // Avoid picking identical names across passes
                if (!selectedActivities.find(s => s.name === act.name)) {
                    if (act.cost <= availableBudget) {
                        selectedActivities.push(act);
                        availableBudget -= act.cost;
                    }
                }
            }
        }

        const totalSpent = currentBudget - availableBudget;

        // Render dashboard values
        totalBudgetDisplay.textContent = formatCurrency(currentBudget);
        totalSpentDisplay.textContent = formatCurrency(totalSpent);
        totalRemainingDisplay.textContent = formatCurrency(availableBudget);

        // Adjust remaining indicator styling based on tightness
        if (availableBudget === 0) {
            totalRemainingDisplay.style.color = 'var(--text-muted)';
        } else if (availableBudget < currentBudget * 0.15) {
            totalRemainingDisplay.style.color = 'var(--warning)';
        } else {
            totalRemainingDisplay.style.color = 'var(--success)';
        }

        // Display results
        if (selectedActivities.length === 0) {
            itineraryContainer.innerHTML = `
                <div class="no-results">
                    <h3>Budget too tight! 😢</h3>
                    <p>We couldn't find any activities fitting your <b>${formatCurrency(currentBudget)}</b> budget.</p>
                </div>
            `;
            return;
        }

        // Sorting by cost gives it a logical hierarchy
        selectedActivities.sort((a, b) => b.cost - a.cost);

        selectedActivities.forEach((act, index) => {
            const delay = index * 0.1;
            const itemElem = document.createElement('div');
            itemElem.className = 'itinerary-item';
            itemElem.style.animation = `slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s both`;

            const icons = {
                restaurant: '🍽️ Dining',
                movies: '🍿 Entertainment',
                trip: '🚗 Getaway',
                shopping: '🛍️ Shopping',
                nightlife: '🍸 Nightlife'
            };

            itemElem.innerHTML = `
                <div class="item-info">
                    <div class="item-category">${icons[act.category]}</div>
                    <h4>${act.name}</h4>
                </div>
                <div class="item-cost">${formatCurrency(act.cost)}</div>
            `;
            itineraryContainer.appendChild(itemElem);
        });
    };

    // Binding interactions
    generateBtn.addEventListener('click', generateItinerary);

    reshuffleBtn.addEventListener('click', () => {
        const originalText = reshuffleBtn.innerHTML;
        reshuffleBtn.innerHTML = `<span>Shuffling...</span>`;
        reshuffleBtn.style.opacity = '0.7';

        setTimeout(() => {
            buildAndDisplayPlan();
            reshuffleBtn.innerHTML = originalText;
            reshuffleBtn.style.opacity = '1';
        }, 400); // Small fake delay to give a "thinking" feedback loop
    });

    replanBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        setupSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    budgetInput.addEventListener('keypress', (e) => {
        budgetInput.style.borderColor = ''; // Reset border if errored previously
        if (e.key === 'Enter') {
            generateItinerary();
        }
    });
});
