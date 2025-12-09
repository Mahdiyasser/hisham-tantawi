document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Functionality (Unchanged) ---
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

    // --- Dynamic Content Loading ---
    const lessonsContainer = document.getElementById('video-lessons-container');

    // Function to render a single lesson
    const renderLesson = (lesson) => {
        // Create the topics list HTML
        const topicsList = lesson.coreTopics.join(', ');

        const lessonHTML = `
            <div class="video-lesson" id="${lesson.id}">
                <div class="lesson-text">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.summary}</p>
                    <p style="margin-top: 15px;"><strong>Core Topics</strong>: ${topicsList}.</p>
                </div>
                <video class="vetrom-media-selected" poster="${lesson.thumbnailUrl}" controls> 
                    <source src="${lesson.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        lessonsContainer.insertAdjacentHTML('beforeend', lessonHTML);
    };

    // Function to fetch and display lessons
    const loadVideoLessons = async () => {
        try {
            // Fetch the JSON data
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const lessons = await response.json();

            // Render each lesson
            lessons.forEach(renderLesson);

        } catch (error) {
            console.error('Failed to load video lessons:', error);
            lessonsContainer.innerHTML = '<p class="error-message">Could not load video lessons. Please try again later.</p>';
        }
    };

    // Load the lessons when the page is ready
    loadVideoLessons();
});
