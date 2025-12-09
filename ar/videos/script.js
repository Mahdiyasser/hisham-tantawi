document.addEventListener('DOMContentLoaded', () => {
    
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

    // New function to load video lessons from JSON
    async function loadVideoLessons() {
        const container = document.querySelector('.video-lessons-container');
        
        try {
            // Fetch the lesson data from data.json
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lessons = await response.json();
            
            // Generate HTML for each lesson
            lessons.forEach(lesson => {
                const topicsHtml = lesson.coreTopics.join('، '); // Join topics with Arabic comma
                
                const lessonHtml = `
                    <div class="video-lesson">
                        <div class="lesson-text">
                            <h3>${lesson.title}</h3>
                            <p>${lesson.summary}</p>
                            <p style="margin-top: 15px;"><strong>المواضيع الأساسية:</strong> ${topicsHtml}.</p>
                        </div>
                        <video class="vetrom-media-selected" poster="${lesson.thumbnailUrl}" controls> 
                            <source src="${lesson.videoUrl}" type="video/mp4">
                            لا يدعم متصفحك الفيديو.
                        </video>
                    </div>
                `;
                
                // Append the new lesson HTML to the container
                container.insertAdjacentHTML('beforeend', lessonHtml);
            });

        } catch (error) {
            console.error('Failed to load video lessons:', error);
            container.innerHTML = '<p>تعذر تحميل الدروس المصورة. الرجاء المحاولة مرة أخرى لاحقًا.</p>';
        }
    }

    // Call the function to load the lessons
    loadVideoLessons();
});
