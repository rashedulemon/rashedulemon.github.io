document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    console.log('EEE Portfolio Loaded Successfully');

    // Floating Dock Active State
    const sections = document.querySelectorAll('section');
    const dockItems = document.querySelectorAll('.dock-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all items
                dockItems.forEach(item => item.classList.remove('active'));

                // Add active class to the item corresponding to the section
                const activeId = entry.target.getAttribute('id');
                const activeItem = document.querySelector(`.dock-item[href="#${activeId}"]`);

                if (activeItem) {
                    activeItem.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: "-10% 0px -10% 0px" // Shrink view area to center focus
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Activity Toggle Functionality (Show More / Show Less)
    const showMoreBtn = document.getElementById('show-more-btn');
    const activityCards = document.querySelectorAll('#activity .activity-card');
    const initialVisibleCount = 3;
    let isExpanded = false;

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            activityCards.forEach((card, index) => {
                if (index >= initialVisibleCount) {
                    if (isExpanded) {
                        setTimeout(() => {
                            card.classList.remove('hidden');
                            card.classList.add('reveal');
                        }, (index - initialVisibleCount) * 100);
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('reveal');
                    }
                }
            });

            if (isExpanded) {
                showMoreBtn.innerHTML = '<i class="fas fa-minus"></i> Show Less';
            } else {
                showMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Show More';
                // Optional: Scroll back to the section header when collapsing
                document.getElementById('activity').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});

// Tabbed Resume Section
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tab-content" and hide them
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    // Get all elements with class="tab-btn" and remove the class "active"
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.className += " active";
}
