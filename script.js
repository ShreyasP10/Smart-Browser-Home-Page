// Save and load editable text
const editableText = document.getElementById('editable-text');

if (localStorage.getItem('savedText')) {
  editableText.textContent = localStorage.getItem('savedText');
}

editableText.addEventListener('input', function() {
  localStorage.setItem('savedText', this.textContent);
});

// Search functionality
function handleEnter(event) {
  if (event.key === "Enter") {
    Search();
  }
}

function Search() {
  const text = document.getElementById("search").value;
  if (text === "") {
    return;
  } else {
    const cleanQuery = text.replace(/\s+/g, '+');
    const url = 'https://www.bing.com/search?q=' + cleanQuery;
    window.location.href = url;
  }
}

function Clear() {
  document.getElementById("search").value = "";
}

// URL span click prevention
const urlSpans = document.querySelectorAll('.url');

urlSpans.forEach(function(urlSpan) {
  urlSpan.addEventListener('click', function(event) {
    event.preventDefault();
  });
});

// Update link functionality
const savedUrl = localStorage.getItem('url');
const nameSpan = document.querySelector('.name');
const urlSpan = document.querySelector('.url');
const icon = document.querySelector('.fa-stack-overflow');
const link = document.querySelector('#link');

urlSpan.addEventListener('input', updateLink);

function updateLink() {
  const domain = new URL('http://' + urlSpan.textContent).hostname.replace('www.', '');
  link.querySelector('.name').textContent = domain;
  link.href = 'http://' + urlSpan.textContent;
  
  const iconClass = 'fa-brands fa-' + domain.split('.')[0];
  icon.className = iconClass;
  
  localStorage.setItem('url', urlSpan.textContent);
}

// Retrieve saved URL on page load
window.addEventListener('load', function() {
  const savedUrl = localStorage.getItem('url');
  if (savedUrl) {
    urlSpan.textContent = savedUrl;
    updateLink();
  }
});

// Settings functionality
function toggleSettings() {
  alert('Settings panel would open here in a real implementation!');
  // In a real implementation, you would show/hide a settings panel
}

// Add hover effect for top buttons
document.querySelectorAll('.top-button').forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-3px)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Enhanced app card hover effects
document.querySelectorAll('#apps-container > a').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.zIndex = '10';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.zIndex = '1';
  });
});

// Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.activeElement.blur();
  }
});