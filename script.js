// ==========================================
// QuizLab - JavaScript
// Interactive Quiz Application
// ==========================================

// ==========================================
// Global Variables
// ==========================================
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let studentAnswers = [];
let studentName = '';
let timerInterval = null;
let timeRemaining = 0;
let questionCount = 0;
let selectedAnswerIndex = null;

// ==========================================
// Mode Selection Functions
// ==========================================

/**
 * Select mode (teacher or student) and display appropriate interface
 */
function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    if (mode === 'teacher') {
        document.getElementById('teacherInterface').classList.add('active');
    } else {
        document.getElementById('studentInterface').classList.add('active');
    }
}

/**
 * Go back to home screen
 */
function goBack() {
    document.getElementById('modeSelection').style.display = 'grid';
    document.getElementById('teacherInterface').classList.remove('active');
    document.getElementById('studentInterface').classList.remove('active');
    resetInterfaces();
}

/**
 * Reset all interfaces to initial state
 */
function resetInterfaces() {
    // Reset teacher interface
    document.getElementById('teacherDashboard').classList.remove('hidden');
    document.getElementById('createQuizForm').classList.add('hidden');
    document.getElementById('myQuizzesList').classList.add('hidden');
    document.getElementById('quizLinkSection').classList.add('hidden');
    
    // Reset student interface
    document.getElementById('joinQuizForm').classList.remove('hidden');
    document.getElementById('studentQuizView').classList.add('hidden');
    
    clearTimer();
}

// ==========================================
// Teacher Functions - Quiz Creation
// ==========================================

/**
 * Show the create quiz form
 */
function showCreateQuiz() {
    document.getElementById('teacherDashboard').classList.add('hidden');
    document.getElementById('createQuizForm').classList.remove('hidden');
    addQuestion(); // Add first question automatically
}

/**
 * Cancel quiz creation and return to dashboard
 */
function cancelCreateQuiz() {
    document.getElementById('createQuizForm').classList.add('hidden');
    document.getElementById('teacherDashboard').classList.remove('hidden');
    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;
}

/**
 * Navigate back to teacher dashboard
 */
function backToTeacherDashboard() {
    document.getElementById('myQuizzesList').classList.add('hidden');
    document.getElementById('quizLinkSection').classList.add('hidden');
    document.getElementById('teacherDashboard').classList.remove('hidden');
}

/**
 * Add a new question to the quiz form
 */
function addQuestion() {
    questionCount++;
    const container = document.getElementById('questionsContainer');
    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionCount}</span>
            <button class="remove-question" onclick="removeQuestion(this)">Remove</button>
        </div>
        <div class="input-group">
            <label>Question Text</label>
            <input type="text" class="question-text-input" placeholder="Enter your question">
        </div>
        <div class="input-group">
            <label>Answer Options</label>
            <div class="options-grid">
                <div class="option-input">
                    <input type="radio" name="correct-${questionCount}" value="0" checked>
                    <input type="text" class="option-input-text" placeholder="Option A">
                </div>
                <div class="option-input">
                    <input type="radio" name="correct-${questionCount}" value="1">
                    <input type="text" class="option-input-text" placeholder="Option B">
                </div>
                <div class="option-input">
                    <input type="radio" name="correct-${questionCount}" value="2">
                    <input type="text" class="option-input-text" placeholder="Option C">
                </div>
                <div class="option-input">
                    <input type="radio" name="correct-${questionCount}" value="3">
                    <input type="text" class="option-input-text" placeholder="Option D">
                </div>
            </div>
            <small style="color: #666; margin-top: 0.5rem; display: block;">Select the correct answer by clicking the radio button</small>
        </div>
    `;
    container.appendChild(questionBlock);
}

/**
 * Remove a question from the quiz form
 */
function removeQuestion(button) {
    button.closest('.question-block').remove();
    updateQuestionNumbers();
}

/**
 * Update question numbers after deletion
 */
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-block');
    questionCount = questions.length;
    questions.forEach((q, index) => {
        q.querySelector('.question-number').textContent = `Question ${index + 1}`;
    });
}

/**
 * Save the quiz and generate shareable link
 */
function saveQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();
    const timeLimit = parseInt(document.getElementById('quizTime').value);

    // Validation
    if (!title) {
        alert('Please enter a quiz title');
        return;
    }

    const questionBlocks = document.querySelectorAll('.question-block');
    if (questionBlocks.length === 0) {
        alert('Please add at least one question');
        return;
    }

    const questions = [];
    let isValid = true;

    // Collect all questions and validate
    questionBlocks.forEach((block, index) => {
        const questionText = block.querySelector('.question-text-input').value.trim();
        const options = Array.from(block.querySelectorAll('.option-input-text')).map(input => input.value.trim());
        const correctIndex = parseInt(block.querySelector('input[type="radio"]:checked').value);

        if (!questionText || options.some(opt => !opt)) {
            alert(`Please fill in all fields for Question ${index + 1}`);
            isValid = false;
            return;
        }

        questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctIndex
        });
    });

    if (!isValid) return;

    // Create quiz object
    const quiz = {
        id: Date.now().toString(),
        code: generateQuizCode(),
        title: title,
        description: description,
        timeLimit: timeLimit,
        questions: questions,
        createdAt: new Date().toISOString(),
        participants: []
    };

    // Save to localStorage
    quizzes.push(quiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));

    // Show quiz link
    showQuizLink(quiz);
}

/**
 * Generate a random 6-digit quiz code
 */
function generateQuizCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Display the quiz link and code after creation
 */
function showQuizLink(quiz) {
    document.getElementById('createQuizForm').classList.add('hidden');
    const linkSection = document.getElementById('quizLinkSection');
    linkSection.classList.remove('hidden');
    
    const quizURL = `${window.location.href.split('?')[0]}?quiz=${quiz.code}`;
    
    linkSection.innerHTML = `
        <div class="quiz-link-container">
            <h3>🎉 Quiz Created Successfully!</h3>
            <p style="margin-bottom: 1rem;">Share this link or code with your students:</p>
            <div class="link-display">${quizURL}</div>
            <div class="link-display" style="margin-bottom: 1.5rem; font-size: 2rem; font-family: 'Righteous', cursive;">
                Code: ${quiz.code}
            </div>
            <button class="btn copy-btn" onclick="copyToClipboard('${quizURL}')">
                📋 Copy Link
            </button>
            <button class="btn btn-secondary" onclick="backToTeacherDashboard(); resetQuizForm();">
                ✅ Done
            </button>
        </div>
    `;
}

/**
 * Reset the quiz form
 */
function resetQuizForm() {
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('quizTime').value = '15';
    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;
    document.getElementById('quizLinkSection').classList.add('hidden');
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Link copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy. Please copy the link manually.');
    });
}

// ==========================================
// Teacher Functions - Quiz Management
// ==========================================

/**
 * Show list of all created quizzes
 */
function showMyQuizzes() {
    document.getElementById('teacherDashboard').classList.add('hidden');
    document.getElementById('myQuizzesList').classList.remove('hidden');
    displayQuizzes();
}

/**
 * Display all quizzes in the list
 */
function displayQuizzes() {
    const container = document.getElementById('quizzesList');
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No quizzes yet</h3>
                <p>Create your first quiz to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = quizzes.map(quiz => `
        <div class="quiz-card" onclick="viewQuizDetails('${quiz.id}')">
            <h3>${quiz.title}</h3>
            <p style="color: #666; margin-bottom: 0.5rem;">${quiz.description || 'No description'}</p>
            <p style="color: var(--primary); font-weight: 600;">
                📊 ${quiz.questions.length} questions • ⏱️ ${quiz.timeLimit} minutes
            </p>
            <p style="margin-top: 0.5rem; font-size: 1.2rem; font-family: monospace; color: var(--secondary);">
                Code: <strong>${quiz.code}</strong>
            </p>
            <span class="participants-count">👥 ${quiz.participants.length} participants</span>
        </div>
    `).join('');
}

/**
 * View detailed information about a specific quiz
 */
function viewQuizDetails(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const quizURL = `${window.location.href.split('?')[0]}?quiz=${quiz.code}`;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 3rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <h2 style="font-family: 'Righteous', cursive; color: var(--secondary); margin-bottom: 1rem;">${quiz.title}</h2>
            <p style="color: #666; margin-bottom: 2rem;">${quiz.description || 'No description'}</p>
            
            <div style="background: #F8F9FA; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <p><strong>Questions:</strong> ${quiz.questions.length}</p>
                <p><strong>Time Limit:</strong> ${quiz.timeLimit} minutes</p>
                <p><strong>Quiz Code:</strong> <span style="font-size: 1.5rem; color: var(--primary); font-family: monospace;">${quiz.code}</span></p>
                <p><strong>Participants:</strong> ${quiz.participants.length}</p>
            </div>

            <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 1.5rem; border-radius: 12px; color: white; margin-bottom: 1.5rem;">
                <p style="margin-bottom: 0.5rem; font-weight: 600;">Share this link:</p>
                <div style="background: white; color: var(--dark); padding: 0.8rem; border-radius: 8px; word-break: break-all; font-size: 0.9rem;">
                    ${quizURL}
                </div>
            </div>

            ${quiz.participants.length > 0 ? `
                <div class="leaderboard">
                    <h3 style="font-family: 'Righteous', cursive; color: var(--secondary); margin-bottom: 1rem;">🏆 Leaderboard</h3>
                    ${quiz.participants.sort((a, b) => b.score - a.score).map((p, i) => `
                        <div class="leaderboard-item">
                            <span class="rank">#${i + 1}</span>
                            <span class="participant-name">${p.name}</span>
                            <span class="participant-score">${p.score}/${quiz.questions.length}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn copy-btn" onclick="copyToClipboard('${quizURL}')">📋 Copy Link</button>
                <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// ==========================================
// Student Functions - Join Quiz
// ==========================================

/**
 * Join a quiz using code
 */
function joinQuiz() {
    const name = document.getElementById('studentName').value.trim();
    const code = document.getElementById('quizCode').value.trim();

    if (!name) {
        alert('Please enter your name');
        return;
    }

    if (!code) {
        alert('Please enter quiz code');
        return;
    }

    const quiz = quizzes.find(q => q.code === code);
    if (!quiz) {
        alert('Invalid quiz code. Please check and try again.');
        return;
    }

    studentName = name;
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    studentAnswers = [];
    timeRemaining = quiz.timeLimit * 60;

    document.getElementById('joinQuizForm').classList.add('hidden');
    startQuiz();
}

/**
 * Start the quiz
 */
function startQuiz() {
    displayQuestion();
    startTimer();
}

// ==========================================
// Student Functions - Take Quiz
// ==========================================

/**
 * Display current question
 */
function displayQuestion() {
    const container = document.getElementById('studentQuizView');
    container.classList.remove('hidden');
    
    const question = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;

    container.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        
        <div class="question-display">
            <p style="color: var(--primary); font-weight: 600; margin-bottom: 1rem;">
                Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}
            </p>
            <h3 class="question-text">${question.question}</h3>
            <div>
                ${question.options.map((option, index) => `
                    <div class="answer-option" onclick="selectAnswer(${index})">
                        <span style="font-weight: 700; font-size: 1.2rem; color: var(--primary);">
                            ${String.fromCharCode(65 + index)}
                        </span>
                        <span style="flex: 1;">${option}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <button class="btn" onclick="submitAnswer()" style="width: 100%;">
            ${currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question →' : 'Submit Quiz ✅'}
        </button>
    `;
}

/**
 * Select an answer option
 */
function selectAnswer(index) {
    selectedAnswerIndex = index;
    document.querySelectorAll('.answer-option').forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
}

/**
 * Submit current answer and move to next question
 */
function submitAnswer() {
    if (selectedAnswerIndex === null) {
        alert('Please select an answer');
        return;
    }

    studentAnswers.push(selectedAnswerIndex);
    selectedAnswerIndex = null;

    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

/**
 * Finish the quiz and calculate score
 */
function finishQuiz() {
    clearTimer();
    
    let score = 0;
    currentQuiz.questions.forEach((q, index) => {
        if (studentAnswers[index] === q.correctAnswer) {
            score++;
        }
    });

    // Save participant data
    const participant = {
        name: studentName,
        score: score,
        completedAt: new Date().toISOString()
    };

    const quiz = quizzes.find(q => q.id === currentQuiz.id);
    if (quiz) {
        quiz.participants.push(participant);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
    }

    displayResults(score);
}

/**
 * Display quiz results
 */
function displayResults(score) {
    const container = document.getElementById('studentQuizView');
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    container.innerHTML = `
        <div class="score-display">
            <h2>🎉 Quiz Completed!</h2>
            <div class="score-number">${score}/${currentQuiz.questions.length}</div>
            <p style="font-size: 1.5rem; margin-bottom: 2rem;">${percentage}% Correct</p>
            <p style="font-size: 1.2rem;">Great job, ${studentName}! 🌟</p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 2rem; margin-top: 2rem;">
            <h3 style="font-family: 'Righteous', cursive; color: var(--secondary); margin-bottom: 1.5rem;">
                📝 Review Your Answers
            </h3>
            ${currentQuiz.questions.map((q, index) => {
                const isCorrect = studentAnswers[index] === q.correctAnswer;
                return `
                    <div style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #E0E0E0;">
                        <p style="font-weight: 600; color: var(--secondary); margin-bottom: 0.8rem;">
                            ${index + 1}. ${q.question}
                        </p>
                        <div style="margin-left: 1.5rem;">
                            ${q.options.map((opt, optIndex) => {
                                let className = '';
                                let icon = '';
                                if (optIndex === q.correctAnswer) {
                                    className = 'correct';
                                    icon = '✅ ';
                                } else if (optIndex === studentAnswers[index] && !isCorrect) {
                                    className = 'incorrect';
                                    icon = '❌ ';
                                }
                                return `
                                    <div class="answer-option ${className}" style="cursor: default; margin-bottom: 0.5rem;">
                                        <span>${icon}${String.fromCharCode(65 + optIndex)}. ${opt}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <button class="btn" onclick="goBack()" style="width: 100%; margin-top: 2rem;">
            🏠 Back to Home
        </button>
    `;
}

// ==========================================
// Timer Functions
// ==========================================

/**
 * Start the quiz timer
 */
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearTimer();
            alert('Time\'s up! Submitting your quiz...');
            finishQuiz();
        }
    }, 1000);
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    let timerEl = document.querySelector('.timer');
    if (!timerEl) {
        timerEl = document.createElement('div');
        timerEl.className = 'timer';
        document.body.appendChild(timerEl);
    }
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    timerEl.innerHTML = `
        <div class="timer-label">Time Remaining</div>
        <div class="timer-value">${minutes}:${seconds.toString().padStart(2, '0')}</div>
    `;

    // Change color when time is running out
    if (timeRemaining <= 60) {
        timerEl.style.background = 'linear-gradient(135deg, #EF476F, #f5576c)';
        timerEl.style.color = 'white';
    }
}

/**
 * Clear the timer
 */
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    const timerEl = document.querySelector('.timer');
    if (timerEl) {
        timerEl.remove();
    }
}

// ==========================================
// Initialization
// ==========================================

/**
 * Check for quiz code in URL on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizCode = urlParams.get('quiz');
    
    if (quizCode) {
        selectMode('student');
        document.getElementById('quizCode').value = quizCode;
    }
});
