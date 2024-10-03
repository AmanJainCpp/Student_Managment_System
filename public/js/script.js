// JavaScript for handling the submission of the attendance form
document.addEventListener('DOMContentLoaded', function() {
    const attendanceForm = document.querySelector('form');
    
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate that all students have an attendance status marked
            const selectElements = document.querySelectorAll('select');
            let isValid = true;

            selectElements.forEach(select => {
                if (select.value === "") {
                    isValid = false;
                    select.style.border = "2px solid red";
                } else {
                    select.style.border = "1px solid #ccc";
                }
            });

            if (!isValid) {
                alert("Please ensure all students' attendance is marked.");
                return false;
            }

            // If all is valid, submit the form
            attendanceForm.submit();
        });
    }
});

// Function to display success messages after form submission (Optional)
function displaySuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('success-message');
    messageDiv.innerHTML = message;
    
    document.body.prepend(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Example validation for form submission (for profile or report forms)
function validateForm() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
    
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            input.style.border = "2px solid red";
            isFormValid = false;
        } else {
            input.style.border = "1px solid #ccc";
        }
    });

    if (!isFormValid) {
        alert("Please fill out all required fields.");
        return false;
    }

    return true;
}

// Example event listener for generating reports (optional feature)
document.querySelector('#generate-report-btn')?.addEventListener('click', () => {
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    window.location.href = `/attendance/report?startDate=${startDate}&endDate=${endDate}`;
});
