
// 1. GETTING ITINERARY DATA
const params = new URLSearchParams(window.location.search);
let itineraryData;
if (params.toString()) {
    itineraryData = {
        destination: params.get("destination"),
        month: params.get("month"),
        budget: params.get("budget"),
        duration: params.get("duration"),
    };
    localStorage.setItem("itineraryData", JSON.stringify(itineraryData));
} else {
    const storedData = localStorage.getItem("itineraryData");
    itineraryData = storedData ? JSON.parse(storedData) : null;
}
// =================================================================



// 2. IMAGE DATA FOR SLIDER
const destinationImages = {
    dubai: ['../images/itinerary/dubai1.jpg', '../images/itinerary/dubai2.jpg', '../images/itinerary/dubai3.jpg', '../images/itinerary/dubai4.jpg'],
    manali: ['../images/itinerary/manali1.jpg', '../images/itinerary/manali2.jpg', '../images/itinerary/manali3.jpg', '../images/itinerary/manali4.jpg'],
    jaipur: ['../images/itinerary/jaipur1.jpg', '../images/itinerary/jaipur2.jpg', '../images/itinerary/jaipur3.jpg', '../images/itinerary/jaipur4.jpg'],
    thailand: ['../images/itinerary/thailand1.jpg', '../images/itinerary/thailand2.jpg', '../images/itinerary/thailand3.jpg', '../images/itinerary/thailand4.jpg'],
    greece: ['../images/itinerary/greece1.jpg', '../images/itinerary/greece2.jpg', '../images/itinerary/greece3.jpg', '../images/itinerary/greece4.jpg'],
    varanasi: ['../images/itinerary/varanasi1.jpg', '../images/itinerary/varanasi2.jpg', '../images/itinerary/varanasi3.jpg', '../images/itinerary/varanasi4.jpg'],
    munnar: ['../images/itinerary/munnar1.jpg', '../images/itinerary/munnar2.jpg', '../images/itinerary/munnar3.jpg', '../images/itinerary/munnar4.jpg'],
    paris: ['../images/itinerary/paris1.jpg', '../images/itinerary/paris2.jpg', '../images/itinerary/paris3.jpg', '../images/itinerary/paris4.jpg']
};
// =================================================================



// 3. MAIN LOGIC
if (itineraryData) {
    // Run all the functions to build the page
    displayHeader(itineraryData);
    setupSlider(itineraryData.destination.toLowerCase());
    fetchClimateData(itineraryData.destination, itineraryData.month);
    displayItinerary(itineraryData);
} else {
    window.location.href = "customize.html";
}
// =================================================================


// 4. DISPLAY AND FEATURE FUNCTIONS
function displayHeader(data) {
    const titleElement = document.getElementById('itinerary-title');
    const subtitleElement = document.getElementById('itinerary-subtitle');
    
    if (titleElement && subtitleElement) {
        titleElement.textContent = `Your ${data.destination} Itinerary`;
        subtitleElement.textContent = `${data.duration} Days, ${data.budget} Budget`;
    }
}

function setupSlider(destination) {
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    
    const images = destinationImages[destination] || [];
    if (images.length === 0 || !slider || !prevBtn || !nextBtn) {
        const sliderContainer = document.getElementById('slider-container');
        if(sliderContainer) sliderContainer.style.display = 'none';
        return;
    }

    slider.innerHTML = images.map(src => `<img src="${src}" alt="Image of ${destination}">`).join('');
    
    let currentIndex = 0;
    const totalImages = images.length;

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalImages;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        updateSlider();
    });
}

async function fetchClimateData(destination, month) {
    const climateInfo = document.getElementById('climate-info');
    if (!climateInfo) return;

    //RapidAPI Key for Meteostat
    const apiKey = 'b2519cd743msh012928f75d57e7ap12bda2jsnbd070e41863a';

    // Helper object to get coordinates for each destination since the API requires latitude and longitude
    const destinationCoordinates = {
        dubai: { lat: 25.20, lon: 55.27 },
        manali: { lat: 32.24, lon: 77.18 },
        jaipur: { lat: 26.91, lon: 75.78 },
        thailand: { lat: 13.75, lon: 100.50 }, // Using Phuket
        greece: { lat: 37.98, lon: 23.72 },   // Using Athens
        varanasi: { lat: 25.31, lon: 82.97 },
        munnar: { lat: 10.08, lon: 77.05 },
        paris: { lat: 48.85, lon: 2.35 }
    };

    const coords = destinationCoordinates[destination.toLowerCase()];
    if (!coords) {
        climateInfo.textContent = "Climate data is not available for this destination.";
        return;
    }

    const monthMap = { "january": 0, "february": 1, "march": 2, "april": 3, "may": 4, "june": 5, "july": 6, "august": 7, "september": 8, "october": 9, "november": 10, "december": 11 };
    const monthNumber = monthMap[month.toLowerCase()];
    const year = new Date().getFullYear() - 1; // Using last year for historical data

    // Calculating the start and end dates for the selected month since the API requires a date range
    const startDate = new Date(Date.UTC(year, monthNumber, 1));
    const endDate = new Date(Date.UTC(year, monthNumber + 1, 0)); 

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const url = `https://meteostat.p.rapidapi.com/point/monthly?lat=${coords.lat}&lon=${coords.lon}&start=${startDateString}&end=${endDateString}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'meteostat.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data.');
        }
        const result = await response.json();
        
        const temp = result?.data?.[0]?.tavg;

        if (temp !== undefined) {
             climateInfo.textContent = `The average temperature in ${month} is around ${Math.round(temp)}°C.`;
        } else {
            throw new Error('Temperature data not found in API response.');
        }
    } catch (error) {
        console.error("Failed to fetch climate data:", error);
        climateInfo.textContent = "Could not load climate data.";
    }
}


function displayItinerary(data) {
    const container = document.getElementById('itinerary-details');
    if (!container) return;

    const { destination, budget, duration } = data;
    const days = parseInt(duration);
    const lowerCaseDestination = destination.toLowerCase();
    const lowerCaseBudget = budget.toLowerCase();
    
    let itineraryPlan;
    
    if (lowerCaseDestination === "dubai") {
        itineraryPlan = generateDubaiItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "manali") {
        itineraryPlan = generateManaliItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "jaipur") {
        itineraryPlan = generateJaipurItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "thailand") {
        itineraryPlan = generateThailandItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "greece") {
        itineraryPlan = generateGreeceItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "varanasi") {
        itineraryPlan = generateVaranasiItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "munnar") {
        itineraryPlan = generateMunnarItinerary(lowerCaseBudget, days);
    } else if (lowerCaseDestination === "paris") {
        itineraryPlan = generateParisItinerary(lowerCaseBudget, days);
    } else {
        itineraryPlan = ["No detailed plan available for this destination."];
    }

    const itineraryHTML = itineraryPlan.map((plan, index) => `
        <h3>Day ${index + 1}</h3>
        <p>${plan}</p>
    `).join('');
    
    container.innerHTML = itineraryHTML;
}
// =================================================================



// 5. ITINERARY GENERATOR FUNCTIONS 

function generateDubaiItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Dubai and check into a budget-friendly hotel or hostel in historic areas like Deira or Bur Dubai, known for their proximity to the creek and souks. Spend the afternoon exploring the vibrant Dubai Creek by taking a traditional abra boat ride—it's a cheap and authentic experience. For dinner, explore the affordable street food stalls in the area, trying shawarma or falafel wraps.", "Use the efficient Dubai Metro to travel to the massive Dubai Mall. In the evening, enjoy the spectacular free fountain show at the base of the Burj Khalifa. For a cheap meal, head to the mall's food court which has numerous options. You can also explore the mall's free attractions, like the impressive indoor waterfall.", "Dedicate your morning to culture by visiting the Al Fahidi Historical Neighbourhood (Bastakiya Quarter). Then, visit the Dubai Museum. Before heading to the airport, explore the vibrant Meena Bazaar for some last-minute budget shopping and enjoy a final meal at a local cafeteria."];
        } else if (days === 5) {
            plans = ["Arrive and check into a budget hotel in Deira. Explore the historic Dubai Creek by abra, then visit the dazzling Gold Souk and aromatic Spice Souk.", "Spend the day at Dubai Mall, watching the fountain show and seeing the Burj Khalifa from the outside. In the evening, head to the sprawling Global Village for international food and entertainment.", "Discover the Al Fahidi Historical Neighbourhood and the Dubai Museum. In the afternoon, take the Metro to the Mall of the Emirates to see the impressive indoor ski slope.", "Take a local bus to Jumeirah Public Beach for iconic photos of the Burj Al Arab hotel. Afterwards, explore the bustling Karama district for unique souvenirs and affordable Indian cuisine.", "Enjoy a relaxed morning, perhaps revisiting a favorite souk for last-minute gifts. Alternatively, find a local park to relax in before heading to the airport for your departure."];
        } else if (days === 7) {
            plans = ["Settle into your budget accommodation and begin your adventure by exploring the historic Dubai Creek, Gold Souk, and Spice Souk.", "Dedicate a full day to the Dubai Mall area. Watch the fountain show, take photos of the Burj Khalifa, and explore the mall's many free attractions. In the evening, immerse yourself in the lively atmosphere of Global Village.", "Immerse yourself in Emirati culture with a visit to the Al Fahidi Historical Neighbourhood (Bastakiya), followed by the Dubai Museum and a walk through the colorful Meena Bazaar.", "Relax on the sands of Jumeirah Public Beach with stunning views of the Burj Al Arab. In the afternoon, hunt for bargains and enjoy diverse food options in the vibrant Karama district.", "Take a local bus to the modern Dubai Marina. Stroll along the scenic promenade, admire the stunning skyscrapers, and consider an affordable Dhow boat cruise in the evening.", "Take an easy day trip to the neighboring emirate of Sharjah via public transport. Visit the beautiful Al Noor Island or the Sharjah Museum of Islamic Civilization for a dose of art and culture.", "Enjoy a final traditional Emirati breakfast. Do some last-minute souvenir shopping at a local market before your departure from Dubai."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive and check into a comfortable 3-star hotel in the Downtown Dubai area. Head straight to the Burj Khalifa and take the elevator to the 'At The Top' observation deck for breathtaking views. In the evening, enjoy the famous Dubai Fountain show.", "Embark on an exciting morning desert safari, complete with dune bashing in a 4x4, a camel ride, and a traditional BBQ lunch. In the afternoon, visit the stunning floral displays at the Dubai Miracle Garden (seasonal).", "Explore the historic side of the city at the Al Fahidi Historical Neighbourhood and Dubai Museum. Take a traditional Abra ride across Dubai Creek before heading to the airport."];
        } else if (days === 5) {
            plans = ["Arrive at your mid-range hotel. Start your trip with a visit to the Burj Khalifa's 'At The Top' observation deck, followed by the spectacular Dubai Fountain show in the evening.", "Experience a thrilling morning desert safari with dune bashing, camel rides, and a BBQ lunch. In the afternoon, choose between the vibrant Dubai Miracle Garden or the enchanting Dubai Garden Glow (both seasonal).", "Discover Old Dubai by exploring the Al Fahidi Historical Neighbourhood and Dubai Museum, followed by an Abra ride. Spend the evening relaxing or dining at the trendy La Mer beachfront.", "Spend a fun-filled day at Atlantis, The Palm. Choose between the thrilling water slides at Aquaventure Waterpark or the fascinating marine life at The Lost Chambers Aquarium.", "Enjoy a leisurely final morning with some last-minute shopping at one of Dubai's major malls before your departure."];
        } else if (days === 7) {
            plans = ["Arrive at your mid-range hotel. Your first evening includes a trip to the top of the Burj Khalifa and watching the Dubai Fountain show.", "Embark on a morning desert safari with dune bashing and a BBQ lunch. In the afternoon, immerse yourself in the beauty of the Dubai Miracle Garden or Dubai Garden Glow.", "Explore the Al Fahidi Historical Neighbourhood, Dubai Museum, and take an Abra ride. Enjoy a relaxing evening at the La Mer beachfront.", "Dedicate a full day to the attractions at Atlantis, The Palm, including both the Aquaventure Waterpark and The Lost Chambers Aquarium.", "Visit the iconic Dubai Frame for panoramic views of old and new Dubai. In the evening, explore the Dubai Marina and enjoy a Dhow cruise with dinner.", "Take a full-day guided tour to Abu Dhabi to visit the magnificent Sheikh Zayed Grand Mosque and the world-class Louvre Abu Dhabi museum.", "Enjoy a final breakfast and some last-minute souvenir shopping before heading to the airport."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive via private luxury transfer to a 5-star hotel. After settling in, enjoy a gourmet dinner at one of the hotel's signature restaurants.", "Embark on a private luxury desert safari with a bespoke itinerary, including a falconry display, a gourmet dinner under the stars, and a private dune drive.", "Enjoy a VIP, skip-the-line tour of the Burj Khalifa. Afterwards, indulge in a lavish farewell brunch at a high-end restaurant before your private transfer to the airport."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort at a top-tier luxury hotel. Your first evening features a bespoke culinary experience prepared by a renowned chef.", "Experience a private luxury desert safari with a gourmet dinner and live entertainment. In the morning, enjoy a private yacht cruise along the stunning Dubai coastline.", "Enjoy VIP access to the Burj Khalifa's 'At The Top Sky' lounge. Follow this with a private, guided tour of The Dubai Mall's most exclusive luxury boutiques.", "Spend a full day at Atlantis, The Palm with VIP access to Aquaventure Waterpark. In the afternoon, indulge in a relaxing and rejuvenating spa treatment at the resort.", "Enjoy a leisurely morning with a private yoga session or a final spa treatment. Depart in style with a luxury transfer to the airport."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent suite. Enjoy a complimentary welcome champagne and a private, multi-course welcome dinner.", "Embark on an exclusive private yacht charter along the Dubai coastline, complete with a gourmet lunch and water sports. In the evening, enjoy a private luxury desert safari with bespoke dining.", "Experience a VIP tour of the Burj Khalifa's 'At The Top Sky' lounge, followed by a private shopping tour at The Dubai Mall with a personal stylist.", "Enjoy a full day of fun at Atlantis, The Palm with VIP access to both the Aquaventure Waterpark and The Lost Chambers Aquarium, followed by a world-class spa treatment.", "Take a day trip to Abu Dhabi with a private guide to visit the Sheikh Zayed Grand Mosque, the Louvre Abu Dhabi, and enjoy the thrills at Ferrari World with VIP access.", "Choose your adventure: a private helicopter tour over Dubai's iconic landmarks, or a magical hot air balloon ride at sunrise with a gourmet breakfast.", "Enjoy a leisurely breakfast and a final swim or spa session before your private transfer to the airport."];
        }
    }
    return plans.slice(0, days);
}

function generateManaliItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Manali and check into a budget hostel near Mall Road. In the evening, take a stroll on Mall Road, enjoy local street food like momos and thukpa, and visit the nearby Tibetan Monastery.", "Take a shared taxi or public bus to Solang Valley. Try budget-friendly snow activities like sledging or tube rides. Carry packed snacks or eat at local dhabas. Return to the hostel by evening.", "Visit Hidimba Devi Temple and Manu Temple in the morning. Walk around Old Manali, enjoy a meal at a pocket-friendly café, and depart with beautiful memories."];
        } else if (days === 5) {
            plans = ["Reach Manali and check into a backpacker-friendly hostel. Rest for a while and then explore the buzzing Mall Road area with affordable food options.", "Spend your day in Solang Valley enjoying budget snow sports. Return by evening and explore cafes in Old Manali.", "Visit local attractions such as Hidimba Temple, Vashisht Hot Springs, and Manu Temple. Enjoy local Himachali dishes for lunch.", "Take a bus to Naggar Castle. Visit Nicholas Roerich Art Gallery and spend time admiring the views. Dine at a local eatery.", "Enjoy a peaceful morning near the Beas River. Have brunch and buy souvenirs before leaving."];
        } else if (days === 7) {
            plans = ["Arrive and relax at a scenic budget hostel. Explore Mall Road and try out local Himachali snacks.", "Head to Solang Valley and indulge in low-cost snow activities. Capture great pictures and enjoy a bonfire back at the hostel.", "Visit Hidimba Temple, Manu Temple, and Club House. In the evening, hang out at Old Manali cafes known for live music.", "Go on a bus trip to Naggar Castle and explore the Roerich Art Gallery. Have lunch at a small riverside café.", "Visit Vashisht Hot Springs and Jogini Waterfalls. Have parathas at a street stall and relax at the hostel.", "Take a trip to Jana Waterfalls. Have lunch at local homes that serve authentic Himachali thalis.", "Enjoy breakfast, relax at the riverside, shop for souvenirs, and depart."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Check into a cozy boutique hotel. Stroll along Mall Road, visit the Tibetan Monastery, and enjoy a nice dinner at Johnson’s Café.", "Take a private cab to Solang Valley. Try snowboarding, ropeway rides, or skiing. Return in the evening and visit Old Manali for dinner.", "Visit Hidimba Devi Temple, Manu Temple, and the serene Van Vihar. Enjoy lunch at a garden café before departure."];
        } else if (days === 5) {
            plans = ["Arrive and settle into a 3-star hotel. Explore Mall Road and nearby temples.", "Solang Valley adventure with cable car ride and skiing. Enjoy bonfire night back at the hotel.", "Visit Hidimba Temple, Vashisht Baths, Manu Temple, and a peaceful riverside walk.", "Visit Naggar Castle and Roerich Art Gallery. Enjoy lunch with a view.", "Explore local markets, buy woollens, relax, and depart."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming resort. Explore Mall Road and enjoy a warm Himachali dinner.", "Solang Valley skiing, ropeway rides, and snowmobiling. Rest with a spa or massage.", "Visit Hidimba Temple, Manu Temple, Club House, and have a riverside cafe dinner.", "Visit Vashisht Baths, Jogini Falls, and spend your evening shopping.", "Take a guided tour to Naggar Castle and Jana Waterfalls. Eat traditional Himachali food.", "Explore Manali Sanctuary or try paragliding in Dobhi (optional).", "Breakfast, souvenir shopping, and return journey."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive via private cab to a luxury resort with mountain views. Enjoy a relaxing spa session and gourmet dinner.", "Take a personal guide to Solang Valley for snow sports, ziplining, and a helicopter ride (if available).", "Visit Hidimba Temple and enjoy brunch at a riverside café before departure in a chauffeur-driven car."];
        } else if (days === 5) {
            plans = ["Reach Manali in comfort and check into a luxury cottage. Enjoy a wine and dine experience.", "Exclusive Solang Valley day with a guide, including snowmobile and premium adventure sports.", "Private tour of Hidimba, Manu Temple, and Old Manali boutique cafes.", "Chauffeur-driven ride to Naggar Castle and Roerich Art Gallery. Scenic lunch included.", "Leisure day with spa or yoga session. Depart with a luxury transfer."];
        } else if (days === 7) {
            plans = ["Luxury check-in with complimentary wine and welcome dinner.", "Adventure-filled day at Solang Valley including VIP snowboarding experience.", "Private guided tour of Manali’s main temples, followed by a riverside picnic.", "Helicopter ride (if available) or exclusive guided forest walk and waterfall picnic.", "Full day at Naggar and Jana with candlelight dinner at a hill-view restaurant.", "Relax at the spa, with an optional rafting or fishing experience.", "Breakfast, farewell photoshoot, and luxury cab transfer back."];
        }
    }
    return plans.slice(0, days);
}

function generateJaipurItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Jaipur, check into a guesthouse. Explore Hawa Mahal from outside and wander through Johari Bazaar for street food.", "Take a local bus to Amber Fort. Explore the magnificent fort and the nearby Panna Meena ka Kund (stepwell).", "Visit the City Palace and Jantar Mantar (observatory). Walk around Bapu Bazaar for souvenir shopping before departing."];
        } else if (days === 5) {
             plans = ["Arrive in Jaipur and check into a backpacker-friendly hostel. Explore the stunning Hawa Mahal and the bustling Johari Bazaar.", "Dedicate your day to the grand Amber Fort, exploring its intricate architecture. Continue to Jaigarh Fort and Panna Meena ka Kund.", "Explore the heart of Jaipur: the City Palace and the historical Jantar Mantar. Visit the Albert Hall Museum and Birla Mandir.", "Take a shared auto to Nahargarh Fort for panoramic city views at sunset. Later, visit Galtaji Temple (Monkey Temple).", "Spend your morning exploring local markets like Bapu Bazaar for textiles. Enjoy a leisurely breakfast before your departure."];
        } else if (days === 7) {
            plans = ["Arrive and settle into your budget accommodation. Explore the Hawa Mahal and the lively Johari Bazaar, savoring local street food.", "Full day exploring Amber Fort, Jaigarh Fort, and Panna Meena ka Kund. Consider a local cooking class in the evening if available.", "Visit City Palace, Jantar Mantar, Albert Hall Museum, and Birla Mandir. Enjoy a traditional Rajasthani thali for dinner.", "Head to Nahargarh Fort for sunset views and then explore Galtaji Temple (Monkey Temple).", "Discover the local crafts with a day trip to Sanganer (known for block printing) or Bagru (for Dabu printing).", "Explore more offbeat places like the Patrika Gate for its vibrant arches and the Dolls Museum. Enjoy a relaxed evening.", "Enjoy a final Rajasthani breakfast, do some last-minute souvenir shopping, and depart with cherished memories."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive and check into a comfortable 3-star hotel. Explore Hawa Mahal, City Palace, and Jantar Mantar. Enjoy dinner at a local restaurant.", "Take a private cab to Amber Fort, opting for a jeep ride. Explore Jaigarh Fort. In the evening, experience the Light and Sound Show at Amber Fort.", "Visit the impressive Albert Hall Museum and the peaceful Birla Mandir. Spend time shopping at Bapu Bazaar before your departure."];
        } else if (days === 5) {
            plans = ["Arrive and settle into your mid-range hotel. Explore Hawa Mahal, City Palace, and Jantar Mantar.", "Full day at Amber Fort (with jeep ride) and Jaigarh Fort. In the evening, visit Chokhi Dhani for a cultural experience.", "Head to Nahargarh Fort for breathtaking sunset views over Jaipur. Afterwards, visit Galtaji Temple (Monkey Temple).", "Day trip to the holy town of Pushkar, with its sacred lake and Brahma Temple.", "Enjoy a leisurely morning. Visit the Albert Hall Museum or explore more local markets for unique finds. Depart from Jaipur."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming boutique hotel. Explore the Hawa Mahal, City Palace, and Jantar Mantar. Indulge in a fine dining experience.", "Full day exploring Amber Fort (with jeep ride) and Jaigarh Fort. In the evening, enjoy the Light and Sound Show at Amber Fort.", "Visit Nahargarh Fort for stunning city views and Galtaji Temple. Consider a cooking class to learn authentic Rajasthani dishes.", "Explore the Albert Hall Museum and Birla Mandir. Spend the afternoon shopping at high-quality local boutiques.", "Day trip to Pushkar and Ajmer, exploring their spiritual and historical significance.", "Experience a hot air balloon ride at sunrise for a breathtaking aerial view of Jaipur (optional).", "Enjoy a final leisurely breakfast. Do some last-minute souvenir shopping before your departure."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive via private chauffeur to a luxurious heritage hotel. Enjoy a relaxing spa session and a gourmet dinner.", "Embark on a private guided tour of Amber Fort, Jaigarh Fort, and Nahargarh Fort. Enjoy a champagne sunset at Nahargarh.", "Enjoy a private guided tour of the City Palace, Jantar Mantar, and Hawa Mahal. Indulge in a luxurious brunch before departure."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort and check into a top-tier luxury heritage property. Enjoy a bespoke culinary experience.", "Private guided tour of Amber Fort, Jaigarh Fort, and Nahargarh Fort. Experience a private cultural performance.", "Explore the City Palace, Jantar Mantar, and Albert Hall Museum with a personal guide. Indulge in high-end shopping.", "Experience a magical sunrise hot air balloon ride over Jaipur. In the afternoon, enjoy a private cooking session with a renowned local chef.", "Leisurely morning with a spa treatment or yoga session. Depart with a luxury transfer."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent heritage suite. Enjoy a private, multi-course welcome dinner.", "VIP guided tour of Amber Fort, Jaigarh Fort, and Nahargarh Fort. Experience a royal dinner at a private haveli.", "Private guided exploration of City Palace, Jantar Mantar, and Hawa Mahal. Indulge in an exclusive shopping spree.", "Sunrise hot air balloon ride followed by a gourmet breakfast. Afternoon private photography tour.", "Day trip to Ranthambore National Park for a luxury safari experience.", "Relax at the hotel with extensive spa treatments, or opt for a private yoga and meditation session.", "Leisurely breakfast. Private transfer to the airport, perhaps with a final stop at a historical site."];
        }
    }
    return plans.slice(0, days);
}

function generateThailandItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Phuket, check into a hostel in Patong. Explore Patong Beach and Bangla Road. Enjoy street food for dinner.", "Take a local bus to Kata Beach and Karon Beach. Visit Karon Viewpoint for panoramic views.", "Visit the Big Buddha for stunning views. Explore Phuket Old Town's Sino-Portuguese architecture. Depart from Phuket."];
        } else if (days === 5) {
            plans = ["Arrive and check into a budget-friendly guesthouse near Karon Beach. Relax and then explore Karon Beach.", "Head to Patong Beach. Spend the day swimming and people-watching. In the evening, explore Bangla Road and enjoy street food.", "Take a local bus to visit the Big Buddha and Wat Chalong, Phuket's largest temple. Explore Phuket Old Town.", "Take a budget group tour to Phi Phi Islands (usually includes snorkeling and lunch).", "Enjoy a leisurely morning at your chosen beach. Do some last-minute souvenir shopping at a local market before departing."];
        } else if (days === 7) {
            plans = ["Arrive and settle into a budget hostel. Explore Patong Beach and enjoy the vibrant street food scene.", "Spend the day at Kata Beach and Karon Beach, visiting Karon Viewpoint. Enjoy a relaxed evening.", "Cultural day: visit the Big Buddha, Wat Chalong, and explore the charming Phuket Old Town with its street art.", "Full day budget group tour to Phi Phi Islands, including snorkeling and exploring Maya Bay (from the boat, if restricted access).", "Visit Promthep Cape for a spectacular sunset view. Explore Rawai Beach and its seafood market for a fresh, affordable dinner.", "Relax at a less crowded beach like Nai Harn Beach or Freedom Beach.", "Enjoy a final Thai breakfast and do some last-minute souvenir shopping."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive and check into a comfortable 3-star resort in Kata or Karon. Enjoy the resort amenities.", "Take a group tour to Phi Phi Islands, including snorkeling and lunch. In the evening, consider watching the Simon Cabaret show.", "Visit the Big Buddha and Wat Chalong. Explore Phuket Old Town, enjoying its unique architecture and boutique shops."];
        } else if (days === 5) {
            plans = ["Arrive and settle into a mid-range resort. Relax by the pool or explore the nearby beach.", "Full day group tour to Phi Phi Islands and Maya Bay, with time for snorkeling and swimming.", "Visit the Big Buddha, Wat Chalong, and explore Phuket Old Town. In the evening, enjoy a traditional Thai massage.", "Choose between a day trip to James Bond Island (Phang Nga Bay) with sea kayaking, or an ethical elephant sanctuary visit.", "Enjoy a leisurely morning at your resort. Do some last-minute shopping for quality souvenirs. Depart from Phuket."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming resort. Relax and explore the local area, enjoying a welcome dinner.", "Full day group tour to Phi Phi Islands and Maya Bay, including snorkeling and swimming. Enjoy the sunset from your resort.", "Cultural exploration: Big Buddha, Wat Chalong, and Phuket Old Town. In the evening, enjoy a Thai cooking class.", "Day trip to James Bond Island (Phang Nga Bay) with sea kayaking through limestone caves. Enjoy the unique scenery.", "Ethical elephant sanctuary visit in the morning. In the afternoon, relax at a beautiful beach like Surin Beach or Kamala Beach.", "Explore Promthep Cape for sunset. Visit a local night market for food and shopping.", "Enjoy a final leisurely breakfast before your departure."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive via private transfer to a luxury beachfront resort or private villa. Enjoy a gourmet dinner.", "Private luxury speedboat tour to Phi Phi Islands, including secluded snorkeling spots and a gourmet picnic lunch.", "Private guided tour to the Big Buddha and Wat Chalong. Explore the exclusive boutiques and art galleries in Phuket Old Town."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort and check into a top-tier luxury resort. Enjoy a bespoke culinary experience and relax by your private pool.", "Private luxury yacht charter to Phi Phi Islands and other secluded spots, with dedicated crew and gourmet catering onboard.", "Private guided tour to an ethical elephant sanctuary for an intimate experience. In the afternoon, enjoy a high-end spa and wellness treatment.", "Private tour to Phang Nga Bay (James Bond Island) with sea kayaking and exploration of hidden lagoons.", "Leisurely morning with a private yoga session or a final spa treatment. Depart with a luxury transfer."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent private villa. Enjoy a private, multi-course welcome dinner.", "Exclusive private yacht charter to Phi Phi Islands with a personal chef and dedicated staff.", "Private guided visit to an ethical elephant sanctuary, followed by a bespoke Thai cooking class.", "Private tour to Phang Nga Bay, including sea kayaking, exploring hidden caves, and a gourmet lunch on a secluded beach.", "Relax and rejuvenate with a full day at a luxury spa and wellness retreat.", "Explore the cultural side of Phuket with a private guide: Big Buddha, Wat Chalong, and a curated shopping experience.", "Leisurely breakfast. Enjoy a final swim or spa session. Private transfer to the airport."];
        }
    }
    return plans.slice(0, days);
}

function generateGreeceItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Athens, check into a hostel near Monastiraki Square. Explore the Plaka district and enjoy a souvlaki dinner.", "Visit the Acropolis and Parthenon early. Hike up Lycabettus Hill for panoramic city views.", "Take a budget-friendly ferry to the nearby island of Aegina. Explore the town and Temple of Aphaia before departing."];
        } else if (days === 5) {
            plans = ["Arrive in Athens and check into a budget hostel. Explore Plaka, Anafiotika, and Monastiraki Square.", "Full day exploring the Acropolis, Parthenon, and Acropolis Museum. Walk through the Ancient Agora.", "Take a ferry to Paros. Check into a guesthouse. Explore Parikia town and relax at a nearby beach.", "Rent a scooter or use local buses to explore Naoussa and other charming villages in Paros.", "Enjoy a final Greek breakfast and do some last-minute souvenir shopping in Athens or Paros before departing."];
        } else if (days === 7) {
            plans = ["Arrive in Athens and settle into your budget accommodation. Explore Plaka, Monastiraki, and enjoy a traditional Greek dinner.", "Cultural immersion: Acropolis, Parthenon, Acropolis Museum, and Ancient Agora. Evening: enjoy a free walking tour of Athens.", "Take a budget ferry to Naxos, a larger and more affordable Cycladic island. Check into a hostel. Explore Naxos Town and Portara.", "Explore Naxos's beautiful beaches like Plaka Beach or Agios Prokopios. Consider a hike to Mount Zas.", "Day trip to a smaller, nearby island like Koufonisia or Delos (requires ferry/boat, budget accordingly).", "Return to Athens via ferry. Spend the afternoon exploring the National Archaeological Museum.", "Enjoy a final Greek breakfast. Do some last-minute souvenir shopping before your departure."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive in Athens, check into a comfortable 3-star hotel. Visit the Acropolis and Acropolis Museum.", "Take a high-speed ferry to Santorini. Enjoy the iconic caldera views and sunset in Oia.", "Explore Santorini: visit a black sand beach, a winery for a tasting, and enjoy the unique volcanic landscape."];
        } else if (days === 5) {
            plans = ["Arrive in Athens, settle into your mid-range hotel. Explore the Acropolis and Acropolis Museum.", "Take a high-speed ferry to Mykonos. Explore Mykonos Town (Chora) and Little Venice.", "Relax at a famous Mykonos beach like Paradise or Super Paradise. Consider a boat trip to Delos island.", "Take a high-speed ferry to Santorini. Enjoy the iconic Oia sunset and explore Fira.", "Explore Santorini: visit a black sand beach, a winery, and enjoy the caldera views. Depart from Santorini."];
        } else if (days === 7) {
            plans = ["Arrive in Athens and check into a charming boutique hotel. Explore the Acropolis, Parthenon, and Acropolis Museum.", "Explore the Ancient Agora, Roman Agora, and Temple of Olympian Zeus. In the afternoon, take a cooking class to learn Greek cuisine.", "Take a high-speed ferry to Mykonos. Settle into your hotel. Explore Mykonos Town, Little Venice, and enjoy the sunset from a beach club.", "Relax at a Mykonos beach. Consider a boat trip to Delos and Rhenia islands for swimming and history.", "Take a high-speed ferry to Santorini. Check into your hotel. Enjoy the iconic Oia sunset and explore Fira.", "Explore Santorini: visit a black sand beach, a winery for a tasting, and hike from Fira to Oia. Enjoy a final island dinner.", "Enjoy a final Greek breakfast. Depart from Santorini (or fly back to Athens for departure)."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive in Athens via private transfer to a luxury hotel with Acropolis views. Enjoy a private guided tour of the Acropolis.", "Take a private helicopter transfer to Santorini. Check into a luxurious cliffside villa with a private pool. Enjoy a private sunset cruise.", "Explore Santorini with a private driver: visit exclusive wineries, a secluded beach, and enjoy a bespoke culinary experience."];
        } else if (days === 5) {
            plans = ["Arrive in Athens with luxury transfer and check into a top-tier hotel. Enjoy a private Acropolis tour and a bespoke dining experience.", "Private yacht cruise along the Athens Riviera or a private tour to Delphi. Evening: exclusive shopping in Kolonaki.", "Private helicopter transfer to Mykonos. Check into a luxury villa. Enjoy a private beach club experience.", "Private yacht charter to Delos and secluded coves for swimming. Explore Mykonos Town's high-end boutiques.", "Private helicopter transfer to Santorini. Check into a luxurious caldera-view suite. Enjoy a private sunset dinner. Depart from Santorini."];
        } else if (days === 7) {
            plans = ["Arrive in Athens with luxury transfer and check into your opulent suite. Enjoy a private, multi-course welcome dinner.", "Exclusive private guided tour of the Acropolis and Acropolis Museum. In the afternoon, a private culinary tour of Athens.", "Private helicopter transfer to Mykonos. Check into a luxury villa. Enjoy a private beach club experience.", "Private yacht charter to Delos and Rhenia islands for swimming, snorkeling, and a gourmet onboard lunch.", "Private helicopter transfer to Santorini. Check into a luxurious caldera-view suite. Enjoy a private sunset cruise with champagne.", "Explore Santorini with a private driver: visit exclusive wineries, a cooking class with a local chef, and a visit to a secluded black sand beach.", "Leisurely breakfast. Private transfer to the airport, perhaps with a final stop at a high-end art gallery."];
        }
    }
    return plans.slice(0, days);
}

function generateVaranasiItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Varanasi, check into a guesthouse near Assi Ghat. Witness the evening Ganga Aarti at Dashashwamedh Ghat.", "Early morning boat ride on the Ganges. Visit Kashi Vishwanath Temple and explore the narrow lanes of the old city.", "Take a shared auto-rickshaw to Sarnath. Explore the Dhamek Stupa and Sarnath Museum before departing."];
        } else if (days === 5) {
            plans = ["Arrive and check into a budget hostel near the ghats. Explore Assi Ghat and enjoy the evening Ganga Aarti at Dashashwamedh Ghat.", "Early morning boat ride on the Ganges. Visit Kashi Vishwanath Temple and explore the vibrant old city lanes. Try various local delicacies.", "Day trip to Sarnath. Explore the ancient ruins and museum. Return to Varanasi and visit the Bharat Kala Bhavan museum.", "Explore more ghats: walk from Assi Ghat to Dashashwamedh Ghat, observing daily life. Visit Manikarnika Ghat from a respectful distance.", "Leisurely morning. Revisit a favorite spot, shop for Banarasi silk sarees or local crafts at Godowlia market. Depart from Varanasi."];
        } else if (days === 7) {
            plans = ["Arrive and settle into your budget accommodation near the ghats. Explore Assi Ghat and witness the grand Ganga Aarti at Dashashwamedh Ghat.", "Early morning sunrise boat ride on the Ganges. Visit Kashi Vishwanath Temple, Annapurna Temple, and explore the old city's hidden alleys.", "Full day trip to Sarnath, exploring its historical and spiritual sites. Return and enjoy a cultural evening with local music.", "Ghat exploration: walk along the riverfront, visiting various ghats like Darbhanga Ghat, Chet Singh Ghat, and Manikarnika Ghat.", "Visit the Banaras Hindu University campus, including the New Vishwanath Temple (Birla Temple) and Bharat Kala Bhavan museum.", "Explore the local markets in depth: Godowlia, Thatheri Bazaar (for brassware), and Vishwanath Gali for souvenirs.", "Enjoy a final Banarasi breakfast. Do some last-minute shopping for Banarasi silk or local sweets. Depart with spiritual memories."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive and check into a comfortable 3-star hotel. Take a private boat ride for the evening Ganga Aarti.", "Early morning private boat ride for sunrise. Visit Kashi Vishwanath Temple and explore the old city with a guide.", "Half-day trip to Sarnath with a private taxi and guide. Explore the Dhamek Stupa and Sarnath Museum."];
        } else if (days === 5) {
            plans = ["Arrive and settle into a mid-range hotel. Take a private boat ride for the evening Ganga Aarti.", "Early morning private boat ride for sunrise. Visit Kashi Vishwanath Temple and explore the old city with a knowledgeable guide.", "Full day trip to Sarnath with a private car and guide. Explore the Buddhist sites thoroughly.", "Explore the cultural side: visit the Bharat Kala Bhavan museum and the New Vishwanath Temple at BHU.", "Enjoy a leisurely morning. Explore the Banarasi silk weaving centers. Have a final traditional meal before departing."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming boutique hotel. Enjoy a private boat ride for the evening Ganga Aarti. Indulge in a fine dining experience.", "Early morning private boat ride for sunrise. Private guided tour of Kashi Vishwanath Temple and the old city.", "Full day trip to Sarnath with a private car and guide. Return and visit the Ramnagar Fort.", "Cultural immersion: visit Bharat Kala Bhavan, New Vishwanath Temple, and explore the local markets for Banarasi silk and crafts.", "Explore more offbeat ghats and temples with a local expert. In the afternoon, take a spiritual walk or meditation session by the Ganges.", "Day trip to Chunar Fort or Vindhyachal. Enjoy a picnic lunch. Return to Varanasi for a relaxed evening.", "Enjoy a final authentic Banarasi breakfast. Do some last-minute high-quality souvenir shopping. Depart."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive via private luxury transfer to a heritage hotel overlooking the Ganges. Evening private boat for Ganga Aarti.", "Early morning private luxury boat ride on the Ganges with breakfast onboard. Private guided tour of Kashi Vishwanath Temple (VIP access).", "Private chauffeur-driven tour to Sarnath with an expert historian. Explore the sites at leisure. Depart."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort and check into a top-tier heritage property. Evening: private boat experience for Ganga Aarti.", "Early morning private luxury boat ride with breakfast. Private guided tour of Kashi Vishwanath Temple and the old city.", "Private chauffeur-driven tour to Sarnath with an expert guide. In the afternoon, enjoy a private yoga and meditation session by the Ganges.", "Explore the cultural richness: private tour of Bharat Kala Bhavan, New Vishwanath Temple, and a curated shopping experience.", "Leisurely morning with a spa treatment or a private cooking class focusing on royal Banarasi cuisine. Depart."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent suite. Evening: exclusive private boat experience for Ganga Aarti.", "Early morning private luxury boat ride with gourmet breakfast on board. Private guided tour of Kashi Vishwanath Temple (VIP access).", "Private chauffeur-driven tour to Sarnath with a renowned historian. In the afternoon, a private session with a local astrologer.", "Private culinary tour of Varanasi, exploring hidden food gems and a bespoke cooking class.", "Explore the Banarasi silk heritage with a private tour of exclusive weaving centers and designer boutiques.", "Day trip to a lesser-known spiritual site or a nearby historical fort with a private guide and picnic lunch.", "Leisurely breakfast. Private transfer to the airport, perhaps with a final stop at a curated art gallery."];
        }
    }
    return plans.slice(0, days);
}

function generateMunnarItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Munnar, check into a homestay. Explore the nearby tea gardens on foot. Visit Blossom Hydel Park.", "Take a local bus to Eravikulam National Park. Afterwards, visit Mattupetty Dam and Echo Point.", "Visit the Tea Museum to learn about tea processing. Explore Munnar town for souvenir shopping before departing."];
        } else if (days === 5) {
            plans = ["Arrive and check into a budget homestay. Relax amidst the tea plantations. Visit Blossom Hydel Park in the evening.", "Full day exploring Eravikulam National Park. Afterwards, visit Mattupetty Dam, Echo Point, and Kundala Lake.", "Visit the Tea Museum. Explore a local spice plantation. Enjoy a traditional Kerala meal at a local eatery.", "Take a local bus or shared taxi to Top Station for panoramic views of the Western Ghats.", "Enjoy a leisurely morning. Revisit a favorite tea garden for photos or do some last-minute shopping for local produce before departing."];
        } else if (days === 7) {
            plans = ["Arrive and settle into your budget accommodation. Explore the immediate tea gardens and relax. Visit Blossom Hydel Park.", "Full day at Eravikulam National Park, Mattupetty Dam, Echo Point, and Kundala Lake. Enjoy boating.", "Visit the Tea Museum and a spice plantation. Consider a short trek to Attukad Waterfalls.", "Explore Top Station and Anayirangal Dam. Enjoy the stunning vistas and take plenty of photos.", "Day trip to Marayoor and Chinnar Wildlife Sanctuary (requires bus/shared taxi). Explore the sandalwood forests and ancient dolmens.", "Relax and rejuvenate. Consider a visit to a local village to experience rural life.", "Enjoy a final Kerala breakfast. Do some last-minute shopping for tea, coffee, and spices. Depart."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive in Munnar and check into a comfortable 3-star resort amidst tea plantations. Enjoy a leisurely walk through tea gardens.", "Private taxi tour to Eravikulam National Park. Afterwards, visit Mattupetty Dam, Echo Point, and Kundala Lake.", "Visit the Tea Museum and a well-regarded spice plantation. Explore Munnar town for quality souvenir shopping."];
        } else if (days === 5) {
            plans = ["Arrive and settle into a mid-range resort. Relax and explore the beautiful surroundings.", "Full day private taxi tour covering Eravikulam National Park, Mattupetty Dam, Echo Point, and Kundala Lake.", "Visit the Tea Museum and a spice plantation. Enjoy a jeep safari to Kolukkumalai Tea Estate.", "Explore Top Station and Anayirangal Dam. Consider an optional soft trek or nature walk with a local guide.", "Enjoy a leisurely morning. Revisit a favorite viewpoint or indulge in some last-minute shopping. Depart from Munnar."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming boutique resort. Relax and explore the tea gardens. Enjoy a welcome dinner.", "Full day private taxi tour covering Eravikulam National Park, Mattupetty Dam, Echo Point, and Kundala Lake.", "Visit the Tea Museum and a spice plantation. Experience a jeep safari to Kolukkumalai Tea Estate for stunning sunrise views.", "Explore Top Station, Anayirangal Dam, and Attukad Waterfalls. Consider a moderate trek to a scenic viewpoint.", "Day trip to Marayoor and Chinnar Wildlife Sanctuary. Enjoy a guided trek and spot diverse flora and fauna.", "Relax and rejuvenate at your resort. Consider an Ayurvedic massage or a cooking class to learn Kerala cuisine.", "Enjoy a final gourmet breakfast. Do some last-minute shopping for premium tea and spices. Depart."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive in Munnar via private luxury transfer to a 5-star resort with panoramic tea garden views. Enjoy a gourmet dinner.", "Private guided tour of Eravikulam National Park. Afterwards, enjoy a private picnic lunch by Mattupetty Dam.", "Private jeep safari to Kolukkumalai Tea Estate for a breathtaking sunrise experience with gourmet breakfast. Depart."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort and check into a top-tier luxury resort. Enjoy a bespoke culinary experience and relax by your private pool.", "Private guided tour of Eravikulam National Park. Enjoy a private boat ride on Kundala Lake. Indulge in a relaxing spa treatment.", "Exclusive private jeep safari to Kolukkumalai Tea Estate for sunrise, followed by a gourmet breakfast amidst the plantations.", "Explore Top Station and Anayirangal Dam with a private guide. Consider a guided nature walk or bird watching session.", "Leisurely morning with a private yoga session or a final spa treatment. Depart with a luxury transfer."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent suite. Enjoy a private, multi-course welcome dinner.", "Exclusive private guided tour of Eravikulam National Park. Enjoy a private picnic lunch by a scenic waterfall.", "Private jeep safari to Kolukkumalai Tea Estate for a spectacular sunrise, followed by a gourmet breakfast.", "Guided trek to a secluded viewpoint or a private session with a local naturalist for bird watching.", "Day trip to Marayoor and Chinnar Wildlife Sanctuary with a private guide and luxury picnic.", "Relax and rejuvenate with a full day at a luxury spa and wellness retreat.", "Leisurely breakfast. Private transfer to the airport, perhaps with a final stop at a curated art gallery."];
        }
    }
    return plans.slice(0, days);
}

function generateParisItinerary(budget, days) {
    let plans = [];
    if (budget === 'low') {
        if (days === 3) {
            plans = ["Arrive in Paris, explore the Latin Quarter and Notre Dame Cathedral (from outside). Enjoy a picnic by the Seine River.", "Visit the Eiffel Tower (from outside). Walk to the Arc de Triomphe and explore the Champs-Élysées.", "Explore the Montmartre area: Sacré-Cœur Basilica and Place du Tertre. Visit the Louvre Museum (from outside). Depart from Paris."];
        } else if (days === 5) {
            plans = ["Arrive and check into a budget hostel. Explore the Latin Quarter, Notre Dame (exterior), and walk along the Seine.", "Full day exploring Eiffel Tower (exterior/stairs), Arc de Triomphe, and Champs-Élysées.", "Visit Montmartre: Sacré-Cœur Basilica, Place du Tertre. Explore the Louvre Museum (exterior or free entry times).", "Explore Le Marais district: Place des Vosges, Jewish Quarter. Visit the Centre Pompidou (from outside).", "Enjoy a leisurely morning. Revisit a favorite spot or do some last-minute souvenir shopping. Depart from Paris."];
        } else if (days === 7) {
            plans = ["Arrive and settle into your budget accommodation. Explore the Latin Quarter, Notre Dame (exterior), and enjoy a picnic by the Seine.", "Iconic sights: Eiffel Tower (exterior/stairs), Arc de Triomphe, Champs-Élysées.", "Artistic Paris: Montmartre, Sacré-Cœur, Place du Tertre. Visit the Louvre Museum (exterior or free entry).", "Explore Le Marais: Place des Vosges, Rue des Rosiers. Visit the Musée d'Orsay (exterior or free entry).", "Day trip to Versailles (RER train, explore gardens for free or palace with ticket). Pack a lunch.", "Discover Canal Saint-Martin for a different Parisian vibe. Enjoy a walk and relax by the canal.", "Enjoy a final Parisian breakfast. Revisit a favorite park (e.g., Luxembourg Gardens)."];
        }
    } else if (budget === 'medium') {
        if (days === 3) {
            plans = ["Arrive and check into a comfortable 3-star hotel. Visit the Eiffel Tower (summit ticket recommended).", "Full day at the Louvre Museum (pre-booked tickets essential). Afterwards, take a Bateaux Mouches (Seine River cruise).", "Explore Montmartre: Sacré-Cœur Basilica, Place du Tertre. Visit the Musée d'Orsay."];
        } else if (days === 5) {
            plans = ["Arrive and settle into a mid-range hotel. Visit the Eiffel Tower (summit) and enjoy the evening illuminations.", "Full day at the Louvre Museum. Afterwards, take a Seine River cruise. Enjoy a traditional French dinner.", "Explore Montmartre (Sacré-Cœur, Place du Tertre). Visit the Musée d'Orsay. In the evening, consider a cabaret show.", "Day trip to Versailles (palace and gardens). Return to Paris and explore the charming Saint-Germain-des-Prés district.", "Enjoy a leisurely morning. Revisit a favorite area or do some last-minute shopping at department stores. Depart from Paris."];
        } else if (days === 7) {
            plans = ["Arrive and check into a charming boutique hotel. Visit the Eiffel Tower (summit) and enjoy a welcome dinner.", "Full day at the Louvre Museum. Afterwards, take a Seine River cruise. Enjoy a gourmet French dinner.", "Explore Montmartre: Sacré-Cœur, Place du Tertre. Visit the Musée d'Orsay. Evening: attend a cabaret show or a classical concert.", "Day trip to Versailles (palace, gardens, Trianons). Enjoy a full day immersing in royal history.", "Explore Le Marais district: Place des Vosges, Picasso Museum. Enjoy a culinary walking tour.", "Visit the Catacombs (pre-book tickets). Afterwards, explore the Latin Quarter and Pantheon.", "Enjoy a final Parisian breakfast. Do some last-minute shopping at Galeries Lafayette or Printemps."];
        }
    } else if (budget === 'high') {
        if (days === 3) {
            plans = ["Arrive in Paris via private luxury transfer to a 5-star hotel. Enjoy a gourmet dinner at a Michelin-starred restaurant.", "Private guided VIP tour of the Louvre Museum. Afterwards, a private luxury Seine River cruise with champagne.", "Private guided tour of Montmartre and Sacré-Cœur. Enjoy a lavish farewell brunch at a high-end restaurant."];
        } else if (days === 5) {
            plans = ["Arrive in ultimate comfort and check into a top-tier luxury hotel. Enjoy a bespoke culinary experience and relax with a spa treatment.", "Private guided VIP tour of the Louvre Museum. Afterwards, a private luxury Seine River cruise with gourmet dinner.", "Private chauffeur-driven tour to Versailles (palace and Trianons with skip-the-line access). Enjoy a gourmet picnic lunch in the gardens.", "Explore Le Marais with a private art historian guide, including exclusive gallery visits. Indulge in a high-end patisserie and chocolate tasting tour.", "Leisurely morning with a private yoga session or a final spa treatment. Depart with a luxury transfer."];
        } else if (days === 7) {
            plans = ["Arrive with a luxury transfer to your opulent suite. Enjoy a private, multi-course welcome dinner at a Michelin-starred restaurant.", "Exclusive private guided VIP tour of the Louvre Museum. Afterwards, a private luxury Seine River cruise with live music.", "Private chauffeur-driven tour to Versailles with exclusive access. Enjoy a gourmet picnic lunch.", "Private guided tour of Montmartre, including a visit to a private artist's studio. Afternoon shopping with a personal stylist.", "Day trip to the Loire Valley with a private guide, visiting two châteaux and enjoying a private wine tasting.", "Explore the Musée d'Orsay with a private art expert. In the afternoon, a private cooking class focusing on French haute cuisine.", "Leisurely breakfast. Enjoy a final spa treatment or a private photography session at iconic landmarks. Private transfer to the airport."];
        }
    }
    return plans.slice(0, days);
}
//==========================================================================================