async function fetchPrices() {
  const response = await fetch('http://localhost:3000/api/prices');
  const data = await response.json();

  // Update the price on the page
  document.getElementById('price').innerText = `₹ ${data.bitcoin.inr.toLocaleString()}`;
}

// Fetch prices when the page loads
window.onload = fetchPrices;
