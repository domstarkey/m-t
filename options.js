let page = document.getElementById('saveDiv');
let hourly = document.getElementById('hourly');
let button = document.createElement('button');
chrome.storage.sync.get('rate', function(data) {
  hourly.value = data.rate;
});
button.textContent="Save";
button.addEventListener('click', function() {
  chrome.storage.sync.set({rate: hourly.value})
});
page.appendChild(button);
