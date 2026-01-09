// Select all like buttons
const likeButtons = document.querySelectorAll(".like-btn");

// Add click event listeners to each button
likeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const countsElement = button.closest(".post").querySelector(".counts");
    let countsText = countsElement.textContent.trim();
    let currentCount = parseInt(countsText.replace(/,/g, ""));

    // Get the clicked attribute and convert it to a boolean
    let clicked = button.getAttribute("data-clicked") === "true";

    // Update the counts based on button click
    if (!clicked) {
      currentCount += 1;
    } else {
      currentCount -= 1;
    }

    // Toggle the clicked attribute
    button.setAttribute("data-clicked", !clicked);

    // Create the updated counts string
    const updatedCountsString =
      currentCount.toLocaleString() +
      " " +
      (currentCount === 1 ? "like" : "likes");

    // Update the counts element with the new string
    countsElement.textContent = updatedCountsString;
  });
});
