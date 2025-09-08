document.addEventListener('DOMContentLoaded', function () {
    const feedback = document.querySelector('#feedback');
    const deleteAllBtn = document.querySelector('#deleteAll');

    // Function to show feedback messages
    function showFeedback(message, type = 'success') {
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `feedback ${type}`;
            setTimeout(() => {
                feedback.textContent = '';
                feedback.className = '';
            }, 3000);
        }
    }

    // Function to send AJAX request
    function sendRequest(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }

    // Handle completing tasks (moving from current to completed)
    function handleTaskCompletion() {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    const task = this.getAttribute('data-task');
                    
                    sendRequest('/complete_task', { task: task })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Remove from current tasks
                                this.closest('li').remove();
                                showFeedback(`Task completed: ${task}`);
                                
                                // Refresh page to show updated lists
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                this.checked = false;
                                showFeedback('Failed to complete task', 'error');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            this.checked = false;
                            showFeedback('Error completing task', 'error');
                        });
                }
            });
        });
    }

    // Handle uncompleting tasks (moving from completed back to current)
    function handleTaskUncompletion() {
        const completedCheckboxes = document.querySelectorAll('.completed-checkbox');
        completedCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    const task = this.getAttribute('data-task');
                    
                    sendRequest('/uncomplete_task', { task: task })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Remove from completed tasks
                                this.closest('li').remove();
                                showFeedback(`Task moved back to current: ${task}`);
                                
                                // Refresh page to show updated lists
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                this.checked = true;
                                showFeedback('Failed to uncomplete task', 'error');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            this.checked = true;
                            showFeedback('Error uncompleting task', 'error');
                        });
                }
            });
        });
    }

    // Handle delete all tasks
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
                sendRequest('/delete_all', {})
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showFeedback('All tasks deleted');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            showFeedback('Failed to delete tasks', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showFeedback('Error deleting tasks', 'error');
                    });
            }
        });
    }

    // Initialize event listeners
    handleTaskCompletion();
    handleTaskUncompletion();

    // Show success message when task is added via form
    const urlParams = new URLSearchParams(window.location.search);
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        const taskInput = document.querySelector('input[name="task"]');
        if (taskInput && taskInput.value === '') {
            // Task was likely just added, show feedback
            showFeedback('Task added successfully!');
        }
    }
});