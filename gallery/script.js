document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic (Kept from original) ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Dynamic Content Loading Logic (New) ---

    const contentContainer = document.getElementById('image-lessons-dynamic-content');

    async function loadLessonContent() {
        try {
            // Fetch the JSON data
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // The JSON is now a direct array, not an object with a 'lessons' property
            const lessonsData = await response.json(); 
            
            // Generate HTML for each lesson - Changed data.lessons to lessonsData
            lessonsData.forEach(lesson => {
                const lessonDiv = document.createElement('div');
                lessonDiv.classList.add('image-lesson');

                let imagesHtml = '';
                // Generate img tags by iterating over the actual image paths
                lesson.images.forEach(imagePath => {
                    imagesHtml += `<img src="${imagePath}">`;
                });

                // Construct the full HTML structure for the lesson
                lessonDiv.innerHTML = `
                    <div class="lesson-text">
                        <h3>${lesson.title}</h3>
                        <p>${lesson.description}</p>
                        <p style="margin-top: 15px;">
                            <strong>Core Topics:</strong> ${lesson.core_topics}
                        </p>
                    </div>
                    <div>
                        <div class="vetrom-gallery:${lesson.id}">
                            ${imagesHtml}
                        </div>
                    </div> 
                `;
                
                contentContainer.appendChild(lessonDiv);
            });

        } catch (error) {
            console.error('Could not load lesson data:', error);
            // Optionally display an error message on the page
            contentContainer.innerHTML = '<p>Error loading lesson content. Please check the data.json file.</p>';
        }
    }

    // Call the function to load the content
    loadLessonContent();
});
