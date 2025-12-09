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

    // New function to fetch and render lesson data
    const fetchAndRenderLessons = async () => {
        const container = document.getElementById('lessons-content');
        if (!container) return;

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lessons = await response.json();

            lessons.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.classList.add('image-lesson');
                
                // Create image tags dynamically
                const imageTags = lesson.images.map(src => 
                    `<img src="${src}">`
                ).join('');

                // Use the data structure to build the lesson HTML
                lessonElement.innerHTML = `
                    <div class="lesson-text">
                        <h3>${lesson.title}</h3>
                        <p>${lesson.description}</p>
                        <p style="margin-top: 15px;"><strong>المواضيع الأساسية:</strong> ${lesson.core_topics}</p>
                    </div>
                    <div>
                        <div class="vetrom-gallery:${lesson.id}">
                            ${imageTags}
                        </div>
                    </div> 
                `;

                container.appendChild(lessonElement);
            });
        } catch (error) {
            console.error('Could not fetch or render lesson data:', error);
            container.innerHTML = '<p>حدث خطأ أثناء تحميل الدروس. الرجاء المحاولة لاحقًا.</p>';
        }
    };

    // Call the function to load the data when the DOM is ready
    fetchAndRenderLessons();
});
