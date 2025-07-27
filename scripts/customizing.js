// Fetching the destination from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const destination = urlParams.get("destination");

// Getting the background container
const bgContainer = document.getElementById("dynamic-bg-container");

// Updating the background image dynamically
if (destination) {
  const imageUrl = `../images/background/${destination.toLowerCase() + 2}.jpg`;
  
  // Creating image element
  const bgImage = document.createElement('img');
  bgImage.src = imageUrl;
  bgImage.alt = '';
  bgImage.classList.add('responsive-bg');
  
  bgContainer.appendChild(bgImage);
  
  
  const preloadImage = new Image();
  preloadImage.src = imageUrl;
}


const heading = document.getElementById("customize-heading");
if (destination) {
    heading.textContent = `Customize Your ${destination.toUpperCase()} Itinerary`;
} else {
    heading.textContent = "Customize Your Itinerary";
}

// Handling form submission
document.getElementById("customize-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const month = document.getElementById("month").value;
    const budget = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;

    const itinenaryInfo = new URLSearchParams({
        destination: destination,
        month: month,
        budget: budget,
        duration: duration
    }).toString();

    window.location.href = `itinerary.html?${itinenaryInfo}`;
});