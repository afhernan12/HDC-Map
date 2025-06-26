// Function to toggle tooltip visibility
function toggleTooltip(infoIcon) {
	console.log(infoIcon);
	console.log("in toggle tooltip");
    const tooltip = infoIcon.querySelector('.info-text');
    console.log(tooltip);
    console.log(tooltip.getAttribute('value'));
    if (tooltip.style.display === "block") {
        tooltip.style.display = "none";
    } else {
        tooltip.style.display = "block";
    }
}

// Function to close all tooltips
function closeAllTooltips() {
    document.querySelectorAll('.info-icon .info-text').forEach(tooltip => {
        tooltip.style.display = "none";
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const infoIcons = document.querySelectorAll('.info-icon');
    
    infoIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close all other info texts
            infoIcons.forEach(otherIcon => {
                if (otherIcon !== this) {
                    otherIcon.querySelector('.info-text').style.display = 'none';
                }
            });

            // Toggle the clicked info text
            const infoText = this.querySelector('.info-text');
            infoText.style.display = infoText.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Close all info texts when clicking outside
    document.addEventListener('click', function() {
        infoIcons.forEach(icon => {
            icon.querySelector('.info-text').style.display = 'none';
        });
    });
});