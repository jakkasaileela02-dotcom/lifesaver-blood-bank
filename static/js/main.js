/**
 * LifeSaver Blood Bank – Donor and Inventory Management System
 * Client-Side JavaScript: static/js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // Auto-dismiss alerts after 6 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 6000);
    });

    // Client-side age validation for donor registration
    const donorAgeInput = document.querySelector('input[name="age"]');
    if (donorAgeInput) {
        donorAgeInput.addEventListener('change', (e) => {
            const age = parseInt(e.target.value, 10);
            if (age < 18 || age > 65) {
                alert('Donors must be between 18 and 65 years of age according to National Blood Transfusion guidelines.');
                e.target.classList.add('is-invalid');
            } else {
                e.target.classList.remove('is-invalid');
            }
        });
    }

    // Units required validation for blood requests
    const unitsInput = document.querySelector('input[name="units_required"]');
    if (unitsInput) {
        unitsInput.addEventListener('change', (e) => {
            const units = parseInt(e.target.value, 10);
            if (units < 1) {
                e.target.value = 1;
            } else if (units > 10) {
                alert('For requisitions exceeding 10 units, please contact Chief Hematologist directly at 1-800-543-3728.');
            }
        });
    }

    console.log('[LifeSaver Blood Bank] Client interface initialized successfully.');
});
