let currentPage = 0;
const ITEMS_PER_PAGE = 4;

document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');
  const sidebarButtons = document.querySelectorAll('.sidebar button');
  let users = [{ username: "admin", password: "admin123" }];

  // Load initial view (Dashboard)
  loadView('dashboard');

  // Sidebar button handlers
  sidebarButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      sidebarButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const target = button.getAttribute('data-target');

      if(target==='logout'){
        window.location.href='index.html';
        return;
      }
      loadView(target);
    });
  });

  // Main view loader
  function loadView(viewName) {
    fetch(`views/${viewName}.html`)
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.text();
      })
      .then(html => {
        contentContainer.innerHTML = html;
        
        // View-specific setup
        if (viewName === 'user-info') setupUserInfoForm();
        if (viewName === 'create') setupCreateForm();
        if (viewName === 'dashboard') loadCredentials();
        if (viewName === 'logout') logout();
      })
      .catch(err => {
        console.error('Failed to load page:', err);
        contentContainer.innerHTML = `<h2>Error loading ${viewName}. Check console.</h2>`;
      });
  }

  // User Info Form
  function setupUserInfoForm() {
    const form = document.getElementById('change-credentials');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUsername = document.getElementById('new-username').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (newPassword !== confirmPassword) {
        document.getElementById('credential-error').textContent = "Passwords don't match!";
        return;
      }
      
      localStorage.setItem('username', newUsername);
      localStorage.setItem('password', newPassword);
      users[0] = { username: newUsername, password: newPassword };
      alert("Credentials updated!");
    });
    
    document.getElementById('clear-storage').addEventListener('click', () => {
      if (confirm("⚠️ Delete ALL saved passwords and login data?")) {
        localStorage.removeItem('credentials');
        alert("Data cleared!");
        loadCredentials(); // Refresh dashboard if open
      }
    });
  }

  // Create Form
  function setupCreateForm() {
    const form = document.getElementById('save-credentials');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const website = document.getElementById('website-url').value.trim();
      const username = document.getElementById('website-username').value.trim();
      
      const password = document.getElementById('website-password').value.trim();
      
      if (!website || !username || !password) {
        document.getElementById('save-error').textContent = "All fields required!";
        return;
      }
      
      const credential = { website, username, password };
      const saved = JSON.parse(localStorage.getItem('credentials') || '[]');
      saved.push(credential);
      localStorage.setItem('credentials', JSON.stringify(saved));
      
      alert("Password saved!");
      form.reset();
    });
  }

  // Dashboard Loader
  function loadCredentials() {
    const container = document.getElementById('password-grid');
    if (!container) {
      console.error("Password grid container not found!");
      return;
    }
  
    try {
      const savedData = localStorage.getItem('credentials');
      const allCredentials = savedData ? JSON.parse(savedData) : [];
      
      // Calculate pagination
      const startIdx = currentPage * ITEMS_PER_PAGE;
      const paginatedItems = allCredentials.slice(startIdx, startIdx + ITEMS_PER_PAGE);
      const totalPages = Math.ceil(allCredentials.length / ITEMS_PER_PAGE);
  
      // Clear container
      container.innerHTML = '';
  
      // Display current page items
      if (paginatedItems.length > 0) {
        paginatedItems.forEach((cred, index) => {  
          container.innerHTML += `
            <div class="display-case">
    <h2 class="label">${cred.website || 'No URL'}</h2>
    <div class="label2">Username</div>
    <input type="text" class="text-field" value="${cred.username}" readonly>
    
    <div class="label2">Password</div>
    <div class="password-field">
      <input type="password" class="text-field" value="${cred.password}" readonly>
      <div class="item-actions">
        <button class="copy-password" data-password="${cred.password}">
          <img src="images/copy-alt.png" alt="copy">
        </button>
        <button class="show-password">
          <img src="images/eye.png" alt="eye">
        </button>
      </div>
    </div>
    
    <div class="item-actions">
      <button class="delete-item" data-index="${startIdx + index}">
          <img src="images/delete.png" alt="delete">
      </button>
    </div>
  </div>
          `;
        });
      } else {
        container.innerHTML = '<h2 class="label">No passwords found</h2>';
      }
  
      // Add pagination controls
      container.innerHTML += `
        <div class="pagination-controls">
          <button id="prev-btn" ${currentPage === 0 ? 'disabled' : ''}>◄ Previous</button>
          <span> <h2>Page ${currentPage + 1} of ${totalPages || 1}</h2></span>
          <button id="next-btn" ${startIdx + ITEMS_PER_PAGE >= allCredentials.length ? 'disabled' : ''}>Next ►</button>
        </div>
      `;
  
      // Add event listeners
      //Previous page button
      document.getElementById('prev-btn')?.addEventListener('click', () => {
        currentPage--;
        loadCredentials();
      });
      //Next page button
      document.getElementById('next-btn')?.addEventListener('click', () => {
        currentPage++;
        loadCredentials();
      });
  
      // Attach button handlers
      attachButtonHandlers();
  
    } catch (error) {
      console.error("Error loading credentials:", error);
      container.innerHTML = '<p class="error">Failed to load passwords</p>';
    }
  }
  
  // Separate function for button handlers
  function attachButtonHandlers() {
    // Copy password buttons
    document.querySelectorAll('.copy-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Get password from button's data attribute (not event target)
        const password = btn.dataset.password; 
        
        // Verify password exists before copying
        if (!password) {
          console.error("No password found to copy!");
          return;
        }
    
        // Copy to clipboard
        navigator.clipboard.writeText(password)
          .then(() => {
            // Visual feedback
            btn.classList.add('copied');
            
            // Change icon temporarily
            const img = btn.querySelector('img');
            if (img) {
              const originalSrc = img.src;
              img.src = 'images/check.png'; // Verify this path is correct
              setTimeout(() => img.src = originalSrc, 1000);
            }
    
            // Remove copied class after 2.5s
            setTimeout(() => btn.classList.remove('copied'), 2500);
          })
          .catch(err => {
            console.error("Copy failed:", err);
          });
      });
    });
  
    // Delete buttons
    document.querySelectorAll('.delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const allCredentials = JSON.parse(localStorage.getItem('credentials') || []);
        
        if (confirm("Delete this password entry?")) {
          allCredentials.splice(index, 1);
          localStorage.setItem('credentials', JSON.stringify(allCredentials));
          
          // Reset pagination if needed
          if (allCredentials.length <= currentPage * ITEMS_PER_PAGE && currentPage > 0) {
            currentPage--;
          }
          loadCredentials();
        }
      });
    });
  
    // Show/hide password toggle
    document.querySelectorAll('.show-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = e.target.closest('.display-case').querySelector('.password-field input');
        const img = e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img');
        
        input.type = input.type === 'password' ? 'text' : 'password';
        img.src = input.type === 'password' ? 'images/eye.png' : 'images/eye-crossed.png';
      });
    });

  }

});