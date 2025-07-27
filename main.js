function darkMode() {
    const toggle = document.getElementById("dark-mode-btn");
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggle.innerHTML = "Light Mode";
    } else {
        toggle.innerHTML = "Dark Mode";
    }
}
const facts = [
    "Iceland runs almost entirely on renewable geothermal energy sources.",
    "Bhutan limits tourist numbers to preserve its cultural heritage.",
    "Japan's rail system is among the most punctual on Earth.",
    "Venice has over 150 canals connected by 400 bridges.",
    "India's Kumbh Mela is visible from space due to scale.",
    "Antarctica is the driest, windiest, and coldest continent on Earth.",
    "Australia’s Great Barrier Reef is the world’s largest coral reef system.",
    "Machu Picchu was rediscovered in 1911 by Hiram Bingham.",
    "Morocco’s Chefchaouen city is famous for its blue-painted buildings.",
    "Switzerland has more than 7,000 lakes across its alpine landscape."
  ];
  let currentIndex = 0;
const factBox = document.getElementById("fact-box");
const nextBtn = document.getElementById("next-slide");
const prevBtn = document.getElementById("prev-slide");

function updateFact() {
    factBox.textContent = facts[currentIndex];
  }
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % facts.length;
    updateFact();
  });
  
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + facts.length) % facts.length;
    updateFact();
  });
 
  updateFact();

  