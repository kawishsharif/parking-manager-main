var w, h;
var parklock = false;
var parklist = [];
var queueitems = 0; // initially its 0
var rows = 2; // Default number of rows (can be modified)
var slotsPerRow = 5; // Default slots per row
var totalSlots = rows * slotsPerRow;

function setupparkingmanager() {
    w = document.getElementById('parkingspace').offsetWidth;
    h = document.getElementById('parkingspace').offsetHeight;

    // Initialize parking slots list based on totalSlots
    parklist = new Array(totalSlots).fill(0);
    
    // Generate the parking slots layout based on number of rows
    generateParkingLayout(rows, slotsPerRow);
}

function generateParkingLayout(numRows, slotsPerRow) {
    const parkingContainer = document.getElementById('parkingspace');
    // Clear existing parking layout
    while (parkingContainer.firstChild) {
        parkingContainer.removeChild(parkingContainer.firstChild);
    }
    
    // Create slot management UI
    const slotManagement = document.querySelector('.new-car-entry');
    slotManagement.innerHTML = '';
    
    // Create slots for management panel
    for (let i = 0; i < totalSlots; i++) {
        const div = document.createElement('div');
        div.id = 'slot' + (i + 1).toString();
        div.textContent = (i + 1).toString();
        div.onclick = function() { carenter(i); };
        slotManagement.appendChild(div);
    }
    
    // Calculate optimal row height based on number of rows
    const optimalHeight = 85 / (numRows * 2 - 1); // Account for slots and ways
    
    // Create parking layout with specified number of rows
    for (let row = 0; row < numRows; row++) {
        // Create row of parking slots
        const slotsHolder = document.createElement('div');
        slotsHolder.className = 'parking-slots-holder';
        slotsHolder.style.height = optimalHeight + '%';
        
        // Create slots for this row
        for (let slot = 0; slot < slotsPerRow; slot++) {
            const slotNumber = row * slotsPerRow + slot;
            const slotDiv = document.createElement('div');
            slotDiv.className = 'parking-slot';
            slotDiv.id = 'slot-' + (slotNumber + 1).toString();
            slotDiv.textContent = (slotNumber + 1).toString();
            slotsHolder.appendChild(slotDiv);
        }
        
        parkingContainer.appendChild(slotsHolder);
        
        // Add way/path between rows of slots
        if (row < numRows) {
            const wayDiv = document.createElement('div');
            wayDiv.className = 'parking-way';
            wayDiv.id = 'entry-way-' + row;
            wayDiv.style.height = (optimalHeight / 3) + '%'; // Make paths narrower
            parkingContainer.appendChild(wayDiv);
            
            // Create entrance for each row
            const entrance = document.createElement('div');
            entrance.className = 'entrance';
            entrance.id = 'entrance-' + row;
            entrance.textContent = 'Entrance ' + (row + 1);
            wayDiv.appendChild(entrance);
        }
    }
}

function updatequeue() {
    for (i = 1; i <= 5; i++) {
        if (i <= queueitems) {
            document.getElementById('queue' + i.toString()).src = 'car.png';
        } else {
            document.getElementById('queue' + i.toString()).src = 'carfaded.png';
        }
    }
}

function addtoqueue() {
    var freeslotflag = 0;
    for (j = 0; j < totalSlots; j++) {
        if (parklist[j] != 1) {
            freeslotflag = 1;
            alert("Free slots available");
            break;
        }
    }
    if (freeslotflag != 1) {
        queueitems = queueitems + 1;
        if (queueitems > 5)
            alert("Queue Limit Reached");
        else
            updatequeue();
    }
}

function queuecheck(slot) {
    if (queueitems > 0) {
        queueitems = queueitems - 1;
        updatequeue();
        carenter(slot);
    }
}

function generatenewcar(slot, slotWidth, slotHeight) {
    var space = document.getElementById('parkingspace');
    let img = document.createElement('img');
    img.src = 'car.png';
    img.className = 'new-car-origin';
    img.id = 'car' + slot.toString();
    
    // Make car size proportional to slot size
    if (slotWidth && slotHeight) {
        // Adjust size to be smaller to fit better in the slot
        // Using 70% of width instead of 90% to avoid overcrowding
        const carWidth = slotWidth * 0.7; 
        img.style.width = carWidth + 'px';
        img.style.height = slotHeight*0.9 + 'px'; // Auto height to maintain aspect ratio
        
        // Add data attribute to store intended dimensions
        img.dataset.intendedWidth = carWidth;
    } else {
        // Fallback sizing
        img.style.width = '70px';
        img.style.height = 'auto';
    }
    
    space.appendChild(img);
    return img;
}

function carenter(slot) {
    if (!document.getElementById('car' + (slot).toString()) && !parklock) {
        parklist[slot] = 1;
        console.log(parklist);
        parklock = true;
        document.getElementById('slot' + (slot + 1).toString()).style.background = 'rgb(146,18,18)';
        
        // Calculate which row and column position this slot is in
        const row = Math.floor(slot / slotsPerRow);
        const col = slot % slotsPerRow;
        
        // Get the actual slot element to position the car correctly
        const slotElement = document.getElementById('slot-' + (slot + 1).toString());
        if (!slotElement) {
            console.error('Slot element not found:', 'slot-' + (slot + 1).toString());
            parklock = false;
            return;
        }
        
        const slotRect = slotElement.getBoundingClientRect();
        const parkingRect = document.getElementById('parkingspace').getBoundingClientRect();
        
        // Hide the slot number to prevent overlap
        slotElement.style.color = 'transparent';
        
        // Calculate the slot center position relative to parking container
        const slotCenterX = slotRect.left + (slotRect.width / 2) - parkingRect.left;
        const slotCenterY = slotRect.top + (slotRect.height / 2) - parkingRect.top;
        
        // Get the way element for this row to position the car in the center of the path
        const wayElement = document.getElementById('entry-way-' + row);
        let wayCenterY;
        
        if (wayElement) {
            const wayRect = wayElement.getBoundingClientRect();
            wayCenterY = wayRect.top + (wayRect.height / 2) - parkingRect.top;
        } else {
            // Fallback if way element not found
            wayCenterY = (row === 0) ? 
                slotCenterY + slotRect.height : 
                slotCenterY - slotRect.height;
        }
        
        // Generate car with appropriate size based on slot
        const img = generatenewcar(slot, slotRect.width, slotRect.height);
        
        // Get entrance element
        const entranceElement = document.getElementById('entrance-' + row);
        if (!entranceElement) {
            console.error('Entrance element not found:', 'entrance-' + row);
            img.style.display = 'none'; // Hide car if animation can't be performed
            setTimeout(() => { parklock = false; }, 100);
            return;
        }
        
        const entranceRect = entranceElement.getBoundingClientRect();
        
        // Position car initially at the entrance - vertical orientation
        img.style.position = 'absolute';
        img.style.zIndex = '100';
        img.style.left = (entranceRect.left - parkingRect.left) + 'px';
        img.style.top = (wayCenterY - img.offsetHeight/2) + 'px'; // Center on the yellow line
        img.style.transform = 'rotate(270deg)'; // Car facing left at entrance
        
        // Flash entrance to indicate car entry
        entranceElement.style.background = 'rgb(67,148,193)';
        setTimeout(() => {
            entranceElement.style.background = 'rgb(33,74,113)';
        }, 500);
        
        // Calculate car dimensions for accurate positioning
        setTimeout(() => {
            const carWidth = img.offsetWidth || parseFloat(img.dataset.intendedWidth) || 80;
            const carHeight = img.offsetHeight || 140;
            
            // Create and play animation
            const keyframes = [
                // Start at entrance, centered on yellow line
                { 
                    left: (entranceRect.left - parkingRect.left) + 'px', 
                    top: (wayCenterY - carHeight/2) + 'px', 
                    transform: 'rotate(270deg)' 
                },
                // Move into row, staying centered on yellow line
                { 
                    left: (slotCenterX) + 'px', 
                    top: (wayCenterY - carHeight/2) + 'px', 
                    transform: 'rotate(270deg)' 
                },
                // Turn and move into slot
                { 
                    left: (slotCenterX - carWidth/2) + 'px', 
                    top: (slotCenterY - carHeight/2) + 'px', 
                    transform: 'rotate(0deg)' 
                }
            ];
            
            const timing = {
                duration: 2000,
                easing: 'ease-in-out',
                fill: 'forwards'
            };
            
            img.animate(keyframes, timing);
        }, 50);
        
        setTimeout(() => { parklock = false; }, 2000);
    } else {
        carexit(slot);
    }
}

function carexit(slot) {
    if (!parklock) {
        parklist[slot] = 0;
        console.log(parklist);
        parklock = true;
        document.getElementById('slot' + (slot + 1).toString()).style.background = 'rgb(27,118,19)';
        
        // Get the car element
        const carElement = document.getElementById('car' + (slot).toString());
        if (!carElement) {
            parklock = false;
            return;
        }
        
        // Show the slot number again
        const slotElement = document.getElementById('slot-' + (slot + 1).toString());
        if (slotElement) {
            slotElement.style.color = 'rgb(240,240,236)';
        }
        
        // Determine which row this slot belongs to
        const row = Math.floor(slot / slotsPerRow);
        
        // Get the way element for this row to position the car in the center of the path
        const wayElement = document.getElementById('entry-way-' + row);
        const entranceElement = document.getElementById('entrance-' + row);
        
        if (!slotElement || !entranceElement || !wayElement) {
            // Fallback if elements not found
            carElement.style.display = 'none';
            setTimeout(function() {
                carElement.remove();
                parklock = false;
                queuecheck(slot);
            }, 500);
            return;
        }
        
        // Get the bounding rectangles for positioning
        const slotRect = slotElement.getBoundingClientRect();
        const wayRect = wayElement.getBoundingClientRect();
        const entranceRect = entranceElement.getBoundingClientRect();
        const parkingRect = document.getElementById('parkingspace').getBoundingClientRect();
        
        // Calculate the center of the way for the yellow line position
        const wayCenterY = wayRect.top + (wayRect.height / 2) - parkingRect.top;
        const slotCenterX = slotRect.left + (slotRect.width / 2) - parkingRect.left;
        
        // Flash the entrance for this row to indicate car exiting
        entranceElement.style.background = 'rgb(146,18,18)';
        setTimeout(function() {
            entranceElement.style.background = 'rgb(33,74,113)';
        }, 1000);
        
        // Get car dimensions
        const carWidth = carElement.offsetWidth || 70;
        const carHeight = carElement.offsetHeight || 140;
        
        // Get the current computed style of the car to ensure we have its exact current position
        const computedStyle = window.getComputedStyle(carElement);
        const currentLeft = parseFloat(computedStyle.left) || 
                           (slotRect.left + slotRect.width/2 - carWidth/2 - parkingRect.left);
        const currentTop = parseFloat(computedStyle.top) || 
                          (slotRect.top + slotRect.height/2 - carHeight/2 - parkingRect.top);
        
        // Create animation for vertical car orientation - starting from the current position
        const keyframes = [
            // Start from current position (in slot)
            { 
                left: currentLeft + 'px',
                top: currentTop + 'px',
                transform: 'rotate(0deg)'
            },
            // Rotate to face exit
            { 
                left: currentLeft + 'px',
                top: currentTop + 'px',
                transform: 'rotate(270deg)'
            },
            // Move to row path (centered on yellow line)
            { 
                left: (slotCenterX) + 'px',
                top: (wayCenterY - carHeight/2) + 'px',
                transform: 'rotate(270deg)'
            },
            // Exit through entrance (centered on yellow line)
            { 
                left: (entranceRect.right - parkingRect.left + 100) + 'px', 
                top: (wayCenterY - carHeight/2) + 'px', 
                transform: 'rotate(270deg)'
            }
        ];
        
        const timing = {
            duration: 2000,
            easing: 'ease-in-out',
            fill: 'forwards'
        };
        
        // Stop any ongoing animations
        const animations = carElement.getAnimations();
        for (const animation of animations) {
            animation.cancel();
        }
        
        // Apply the new exit animation
        const animation = carElement.animate(keyframes, timing);
        
        animation.onfinish = function() {
            carElement.remove();
            parklock = false;
            queuecheck(slot);
        };
    }
}

// Function to change the number of rows
function changeRowCount(newRows) {
    rows = newRows;
    totalSlots = rows * slotsPerRow;
    setupparkingmanager();
}

// Function to change slots per row
function changeSlotsPerRow(newSlotsPerRow) {
    slotsPerRow = newSlotsPerRow;
    totalSlots = rows * slotsPerRow;
    setupparkingmanager();
}