class DraggableWindow {
    constructor(x, y) {
        this.windowCounter = DraggableWindow.windowCount++;
        this.createWindow(x, y);
        this.setupDragging();
        this.setupTitleEditing();
    }

    createWindow(x, y) {
        // Create window element
        this.element = document.createElement('div');
        this.element.className = 'draggable-window bg-gray-50';
        this.element.style.width = "20vh";
        this.element.style.height = "20vh";
        this.element.style.left = `${x || Math.random() * (window.innerWidth - 350)}px`;
        this.element.style.top = `${y || Math.random() * (window.innerHeight - 300)}px`;

        // Create header
        const header = document.createElement('div');
        header.className = 'window-header flex justify-center items-center';
        header.style.background = "gray";

        // Create title
        const title = document.createElement('h3');
        title.className = 'window-title';
        title.textContent = `List ${this.windowCounter}`;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn w-6 h-6 rounded text-red';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close());

        // Create content
        const content = document.createElement('div');
        content.className = 'window-content';
        content.textContent = 'Window content goes here';

        // Assemble elements
        header.appendChild(title);
        header.appendChild(closeBtn);
        this.element.appendChild(header);
        this.element.appendChild(content);

        // Store references
        this.headerEl = header;
        this.titleEl = title;

        // Add to document
        document.body.appendChild(this.element);
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
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
            }
        };

        const dragEnd = () => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                this.element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        };

        this.headerEl.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);
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
        this.element.remove();
    }

    static windowCount = 1;
}

// Create window button functionality
document.getElementById('create-window-btn').addEventListener('click', () => {
    new DraggableWindow();
});