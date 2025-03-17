class DraggableWindow {
    constructor(x, y, width, height, titleName, id = null, checklistItems = []) {
        this.id = id || Date.now() + Math.random();
        this.windowCounter = DraggableWindow.windowCount++;
        this.x = x || 20;
        this.y = y || 100;
        this.width = width || '20vh';
        this.height = height || '20vh';
        this.titleName = titleName || 'New Jot';
        this.checklistItems = checklistItems || [];
        this.createWindow(this.x, this.y, this.width, this.height, this.titleName);
        this.renderChecklist();
        this.setupDragging();
        this.setupTitleEditing();
        this.setupResizing();
    }

    createWindow(x, y, width, height, titleName) {
        // Create window element
        this.element = document.createElement('div');
        this.resizerRight = document.createElement('div');
        this.resizerBottom = document.createElement('div');
        this.element.className = 'draggable-window bg-gray-100 absolute';
        this.element.style.width = typeof width === 'string' ? width : `${width}px`;
        this.element.style.height = typeof height === 'string' ? height : `${height}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.dataset.id = this.id; // Add id as data attribute for easier reference

        // Create resizers
        this.resizerRight.className = 'resizer bg-gray-200';
        this.resizerRight.style.width = "1vh";
        this.resizerRight.style.height = "100%";
        this.resizerRight.style.position = "absolute";
        this.resizerRight.style.right = "0";
        this.resizerRight.style.top = "0";
        this.resizerRight.style.cursor = "e-resize";

        this.resizerBottom.className = 'resizer bg-gray-200';
        this.resizerBottom.style.width = "100%";
        this.resizerBottom.style.height = "1vh";
        this.resizerBottom.style.position = "absolute";
        this.resizerBottom.style.right = "0";
        this.resizerBottom.style.bottom = "0";
        this.resizerBottom.style.cursor = "s-resize";

        // Create header
        const header = document.createElement('div');
        header.className = 'window-header flex justify-between items-center p-2';
        header.style.background = "gray";

        // Create title
        const title = document.createElement('h3');
        title.className = 'window-title';
        title.textContent = titleName;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn w-6 h-6 rounded text-red';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close());

        // Create content container with scrolling
        const content = document.createElement('div');
        content.className = 'window-content p-3';
        content.style.height = "calc(100% - 40px)";
        content.style.overflowY = "auto";

        // Create checklist container
        const checklistContainer = document.createElement('div');
        checklistContainer.className = 'checklist-container';
        content.appendChild(checklistContainer);

        // Create add item form
        const addItemForm = document.createElement('form');
        addItemForm.className = 'add-item-form mt-3 flex';
        
        const newItemInput = document.createElement('input');
        newItemInput.type = 'text';
        newItemInput.className = 'flex-grow p-1 border rounded';
        newItemInput.placeholder = 'Add new item...';
        
        const addBtn = document.createElement('button');
        addBtn.type = 'submit';
        addBtn.className = 'ml-2 px-3 py-1 bg-blue-500 text-white rounded';
        addBtn.textContent = '+';
        
        addItemForm.appendChild(newItemInput);
        addItemForm.appendChild(addBtn);
        
        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (newItemInput.value.trim()) {
                this.addChecklistItem(newItemInput.value.trim());
                newItemInput.value = '';
            }
        });
        
        content.appendChild(addItemForm);

        // Assemble elements
        header.appendChild(title);
        header.appendChild(closeBtn);
        this.element.appendChild(header);
        this.element.appendChild(content);
        this.element.appendChild(this.resizerRight);
        this.element.appendChild(this.resizerBottom);

        // Store references
        this.headerEl = header;
        this.titleEl = title;
        this.contentEl = content;
        this.checklistContainerEl = checklistContainer;
        this.newItemInputEl = newItemInput;

        // Add to document
        document.body.appendChild(this.element);
    }

    renderChecklist() {
        // Clear existing checklist
        this.checklistContainerEl.innerHTML = '';
        this.checklistItems.forEach((item, index) => {
            const itemEl = this.createChecklistItemElement(item, index);
            this.checklistContainerEl.appendChild(itemEl);
            });
        }

    createChecklistItemElement(item, index) {
        const itemEl = document.createElement('div');
        itemEl.className = 'checklist-item flex items-center py-1 border-b';
        itemEl.dataset.index = index;
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'mr-2';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', () => {
            this.toggleChecklistItem(index);
        });
        
        // Text container
        const textContainer = document.createElement('div');
        textContainer.className = 'flex-grow';
        
        // Item text
        const text = document.createElement('span');
        text.className = item.completed ? 'line-through text-gray-500' : '';
        text.textContent = item.text;
        text.addEventListener('dblclick', () => {
            this.editChecklistItem(index, textContainer);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'ml-2 text-red-500';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            this.deleteChecklistItem(index);
        });
        
        // Assemble
        textContainer.appendChild(text);
        itemEl.appendChild(checkbox);
        itemEl.appendChild(textContainer);
        itemEl.appendChild(deleteBtn);
        
        return itemEl;
    }

    addChecklistItem(text) {
        this.checklistItems.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        this.renderChecklist();
        this.saveToLocalStorage();
    }

    toggleChecklistItem(index) {
        if (index >= 0 && index < this.checklistItems.length) {
            this.checklistItems[index].completed = !this.checklistItems[index].completed;
            this.renderChecklist();
            this.saveToLocalStorage();
        }
    }

    editChecklistItem(index, container) {
        if (index < 0 || index >= this.checklistItems.length) return;
        
        const item = this.checklistItems[index];
        const currentText = item.text;
        
        // Create edit input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'flex-grow p-1 border rounded';
        input.value = currentText;
        
        // Replace the text with input
        container.innerHTML = '';
        container.appendChild(input);
        input.focus();
        input.select();
        
        const finishEditing = (save) => {
            const newText = input.value.trim();
            if (save && newText) {
                this.checklistItems[index].text = newText;
                this.saveToLocalStorage();
            }
            this.renderChecklist();
        };
        
        input.addEventListener('blur', () => finishEditing(true));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEditing(false);
            }
        });
    }

    deleteChecklistItem(index) {
        if (index >= 0 && index < this.checklistItems.length) {
            this.checklistItems.splice(index, 1);
            this.renderChecklist();
            this.saveToLocalStorage();
        }
    }

    setupDragging() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            // Prevent dragging if editing title
            if (this.titleEl.contentEditable !== 'true') {
                initialX = e.clientX - this.element.getBoundingClientRect().left;
                initialY = e.clientY - this.element.getBoundingClientRect().top;
                isDragging = true;
            }
        };

        const dragEnd = () => {
            this.x = parseInt(this.element.style.left);
            this.y = parseInt(this.element.style.top);
            initialX = this.x;
            initialY = this.y;
            document.body.classList.remove("no-select");
            isDragging = false;
            
            // Save the updated position to localStorage
            this.saveToLocalStorage();
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
            
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                // Get the current size of the window after resizing
                const windowWidth = this.element.offsetWidth;
                const windowHeight = this.element.offsetHeight;

                // Calculate the boundaries for dragging, based on the window's current size
                const minX = 0;
                const minY = 79;
                const maxX = window.innerWidth - windowWidth; // Maximum X position (right edge)
                const maxY = window.innerHeight - windowHeight;

                // Constrain the current position within the boundaries
                currentX = Math.max(minX, Math.min(currentX, maxX));
                currentY = Math.max(minY, Math.min(currentY, maxY));

                xOffset = currentX;
                yOffset = currentY;

                this.element.style.left = `${currentX}px`;
                this.element.style.top = `${currentY}px`;

                document.body.classList.add("no-select");
            }
        };

        this.headerEl.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);
    }

    setupResizing() {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
    
        const resizeStart = (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.element.offsetWidth;
            startHeight = this.element.offsetHeight;
            
            document.body.classList.add("no-select");
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        };
    
        const resize = (e) => {
            if (isResizing) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                // Adjust width and height even if cursor moves outside the resizer
                this.element.style.width = `${startWidth + dx}px`;
                this.element.style.height = `${startHeight + dy}px`;
            }
        };
    
        const stopResize = () => {
            isResizing = false;
            document.body.classList.remove("no-select");
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);

            // Update the stored width and height
            this.width = this.element.style.width;
            this.height = this.element.style.height;
            
            // Save the updated dimensions to localStorage
            this.saveToLocalStorage();
        };
    
        this.resizerRight.addEventListener('mousedown', resizeStart);
        this.resizerBottom.addEventListener('mousedown', resizeStart);
    }

    setupTitleEditing() {
        this.titleEl.addEventListener('dblclick', () => {
            const originalText = this.titleEl.textContent;
            
            this.titleEl.contentEditable = true;
            this.titleEl.classList.add('editing');
            this.titleEl.focus();

            const range = document.createRange();
            range.selectNodeContents(this.titleEl);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            const finishEditing = () => {
                this.titleEl.contentEditable = false;
                this.titleEl.classList.remove('editing');
                
                this.titleEl.textContent = this.titleEl.textContent.trim() || originalText;
                this.titleName = this.titleEl.textContent;
                
                // Save the updated title to localStorage
                this.saveToLocalStorage();
            };

            this.titleEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finishEditing();
                } else if (e.key === 'Escape') {
                    this.titleEl.textContent = originalText;
                    finishEditing();
                }
            });

            this.titleEl.addEventListener('blur', finishEditing);
        });
    }

    close() {
        // Remove from localStorage
        this.removeFromLocalStorage();
        
        // Remove from DOM
        this.element.remove();
    }
    
    // Method to save this instance to localStorage
    saveToLocalStorage() {
        // Get current windows from localStorage
        const storedWindows = DraggableWindow.getAllFromLocalStorage();
        
        // Find if this window already exists
        const existingIndex = storedWindows.findIndex(window => window.id === this.id);
        
        // Data to store
        const windowData = {
            id: this.id,
            x: parseInt(this.element.style.left),
            y: parseInt(this.element.style.top),
            width: this.element.style.width,
            height: this.element.style.height,
            titleName: this.titleName,
            checklistItems: this.checklistItems
        };
        
        // Update or add the window
        if (existingIndex >= 0) {
            storedWindows[existingIndex] = windowData;
        } else {
            storedWindows.push(windowData);
        }
        
        // Save back to localStorage
        localStorage.setItem('draggableWindows', JSON.stringify(storedWindows));
    }
    
    // Method to remove this instance from localStorage
    removeFromLocalStorage() {
        // Get current windows from localStorage
        const storedWindows = DraggableWindow.getAllFromLocalStorage();
        
        // Filter out this window
        const updatedWindows = storedWindows.filter(window => window.id !== this.id);
        
        // Save back to localStorage
        localStorage.setItem('draggableWindows', JSON.stringify(updatedWindows));
    }
    
    // Static method to get all windows from localStorage
    static getAllFromLocalStorage() {
        const stored = localStorage.getItem('draggableWindows');
        return stored ? JSON.parse(stored) : [];
    }
    
    // Static method to create windows from localStorage data
    static loadFromLocalStorage() {
        const storedWindows = DraggableWindow.getAllFromLocalStorage();
        
        // Create window instances from stored data
        return storedWindows.map(windowData => 
            new DraggableWindow(
                windowData.x,
                windowData.y,
                windowData.width,
                windowData.height,
                windowData.titleName,
                windowData.id,
                windowData.checklistItems || []
            )
        );
    }

    static windowCount = 1;
}

// Create window button functionality
document.getElementById('create-window-btn').addEventListener('click', () => {
    // Create new window with default values
    const newWindow = new DraggableWindow();
    
    // Save to localStorage
    newWindow.saveToLocalStorage();
});

// Add some basic styles to the page
const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .draggable-window {
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            min-width: 250px;
            min-height: 200px;
            overflow: hidden;
        }
        
        .window-header {
            padding: 8px;
            cursor: move;
            user-select: none;
        }
        
        .window-title {
            margin: 0;
            flex-grow: 1;
        }
        
        .window-title.editing {
            background: #fff;
            padding: 2px 4px;
            border-radius: 3px;
            outline: none;
        }
        
        .window-content {
            padding: 10px;
            background: #fff;
            flex-grow: 1;
        }
        
        .close-btn {
            border: none;
            background: none;
            cursor: pointer;
            font-size: 18px;
            color: #ff5555;
        }
        
        .checklist-item {
            transition: background-color 0.2s;
        }
        
        .checklist-item:hover {
            background-color: #f8f8f8;
        }
        
        .no-select {
            user-select: none;
        }
    `;
    document.head.appendChild(style);
};

// Load windows when the page loads
window.addEventListener('load', () => {
    addStyles();
    DraggableWindow.loadFromLocalStorage();
});