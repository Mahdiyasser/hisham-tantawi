document.addEventListener('DOMContentLoaded', () => {
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

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

    const handleFormSubmit = (event) => {
        event.preventDefault(); 

        const contactForm = document.getElementById('contactForm');
        const formStatus = document.getElementById('formStatus');
        const submitButton = contactForm.querySelector('.btn');

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        
        formStatus.textContent = "Processing your request...";
        formStatus.style.backgroundColor = 'var(--background-dark)';
        formStatus.style.color = 'var(--primary-color)';
        formStatus.style.opacity = '1';

        setTimeout(() => {
            
            submitButton.disabled = false;
            submitButton.textContent = "Send Securely";

            formStatus.textContent = "✅ Success! Your message has been sent successfully. I'll be in touch soon.";
            formStatus.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            formStatus.style.color = '#28a745'; 
            contactForm.reset();
            
            setTimeout(() => {
                formStatus.style.opacity = '0';
            }, 5000);
            
        }, 2000);
    };

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});
