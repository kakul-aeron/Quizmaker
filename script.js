// ==========================================
// QuizLab - JavaScript with Firebase Support
// Multi-Device Real-Time Quiz Application
// ==========================================

// ==========================================
// Global Variables
// ==========================================
let currentQuiz = null;
let currentQuestionIndex = 0;
let studentAnswers = [];
let studentName = '';
let timerInterval = null;
let timeRemaining = 0;
let questionCount = 0;
let selectedAnswerIndex = null;
let quizzesListener = null;

// ==========================================
// Firebase Helper Functions
// ==========================================

/**
 * Check if Firebase is initialized and configured
 */
function isFirebaseEnabled() {
    return window.firebaseInitialized && window.firebaseDB !== null;
}

/**
 * Save quiz to Firebase
 */
async function saveQuizToFirebase(quiz) {
    if (!isFirebaseEnabled()) {
        console.warn('Firebase not available, using localStorage');
        return saveQuizToLocalStorage(quiz);
    }

    try {
        const { ref, set } = window.firebaseRefs;
        const quizRef = ref(window.firebaseDB, 'quizzes/' + quiz.id);
        await set(quizRef, quiz);
        console.log('✅ Quiz saved to Firebase');
        return true;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        return saveQuizToLocalStorage(quiz);
    }
}

/**
 * Get all quizzes from Firebase
 */
async function getQuizzesFromFirebase() {
    if (!isFirebaseEnabled()) {
        return getQuizzesFromLocalStorage();
    }

    try {
        const { ref, get } = window.firebaseRefs;
        const quizzesRef = ref(window.firebaseDB, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        if (snapshot.exists()) {
            const quizzesObj = snapshot.val();
            return Object.values(quizzesObj);
        }
        return [];
    } catch (error) {
        console.error('Error getting quizzes from Firebase:', error);
        return getQuizzesFromLocalStorage();
    }
}

/**
 * Get quiz by code from Firebase
 */
async function getQuizByCode(code) {
    if (!isFirebaseEnabled()) {
        return getQuizByCodeFromLocalStorage(code);
    }

    try {
        const quizzes = await getQuizzesFromFirebase();
        return quizzes.find(q => q.code === code);
    } catch (error) {
        console.error('Error getting quiz:', error);
        return getQuizByCodeFromLocalStorage(code);
    }
}

/**
 * Save participant result to Firebase
 */
async function saveParticipantResult(quizId, participant) {
    if (!isFirebaseEnabled()) {
        return saveParticipantToLocalStorage(quizId, participant);
    }

    try {
        const { ref, push } = window.firebaseRefs;
        const participantsRef = ref(window.firebaseDB, 'quizzes/' + quizId + '/participants');
        await push(participantsRef, participant);
        console.log('✅ Participant result saved to Firebase');
        return true;
    } catch (error) {
        console.error('Error saving participant:', error);
        return saveParticipantToLocalStorage(quizId, participant);
    }
}

/**
 * Listen for real-time updates to quizzes
 */
function listenToQuizUpdates(callback) {
    if (!isFirebaseEnabled()) {
        return;
    }

    try {
        const { ref, onValue } = window.firebaseRefs;
        const quizzesRef = ref(window.firebaseDB, 'quizzes');
        
        quizzesListener = onValue(quizzesRef, (snapshot) => {
            if (snapshot.exists()) {
                const quizzesObj = snapshot.val();
                const quizzes = Object.values(quizzesObj);
                callback(quizzes);
            } else {
                callback([]);
            }
        });
    } catch (error) {
        console.error('Error setting up real-time listener:', error);
    }
}

/**
 * Stop listening to quiz updates
 */
function stopListeningToQuizUpdates() {
    if (quizzesListener) {
        quizzesListener();
        quizzesListener = null;
    }
}

// ==========================================
// LocalStorage Fallback Functions
// ==========================================

function saveQuizToLocalStorage(quiz) {
    let quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    quizzes.push(quiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    return true;
}

function getQuizzesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('quizzes') || '[]');
}

function getQuizByCodeFromLocalStorage(code) {
    const quizzes = getQuizzesFromLocalStorage();
    return quizzes.find(q => q.code === code);
}

function saveParticipantToLocalStorage(quizId, participant) {
    let quizzes = getQuizzesFromLocalStorage();
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
        if (!quiz.participants) quiz.participants = [];
        quiz.participants.push(participant);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        return true;
    }
    return false;
}

// ==========================================
// Mode Selection Functions
// ==========================================

function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    if (mode === 'teacher') {
        document.getElementById('teacherInterface').classList.add('active');
    } else {
        document.getElementById('studentInterface').classList.add('active');
    }
}

function goBack() {
    document.getElementById('modeSelection').style.display = 'grid';
    document.getElementById('teacherInterface').classList.remove('active');
    document.getElementById('studentInterface').classList.remove('active');
    resetInterfaces();
    stopListeningToQuizUpdates();
}

function resetInterfaces() {
    document.getElementById('teacherDashboard').classList.remove('hidden');
    document.getElementById('createQuizForm').classList.add('hidden');
    document.getElementById('myQuizzesList').classList.add('hidden');
    document.getElementById('quizLinkSection').classList.add('hidden');
    
    document.getElementById('joinQuizForm').classList.remove('hidden');
    document.getElementById('studentQuizView').classList.add('hidden');
    
    clearTimer();
}

// ==========================================
// Teacher Functions - Quiz Creation
// ==========================================

function showCreateQuiz() {
    document.getElementById('teacherDashboard').classList.add('hidden');
    document.getElementById('createQuizForm').classList.remove('hidden');
    addQuestion();
}

function cancelCreateQuiz() {
    document.getElementById('createQuizForm').classList.add('hidden');
    document.getElementById('teacherDashboard').classList.remove('hidden');
    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;
}

function backToTeacherDashboard() {
    document.getElementById('myQuizzesList').classList.add('hidden');
    document.getElementById('quizLinkSection').classList.add('hidden');
    document.getElementById('teacherDashboard').classList.remove('hidden');
    stopListeningToQuizUpdates();
}

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
            <small style="color: #666; margin-top: 0.5rem; display: block;">Select the correct answer</small>
        </div>
    `;
    container.appendChild(questionBlock);
}

function removeQuestion(button) {
    button.closest('.question-block').remove();
    updateQuestionNumbers();
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-block');
    questionCount = questions.length;
    questions.forEach((q, index) => {
        q.querySelector('.question-number').textContent = `Question ${index + 1}`;
    });
}

async function saveQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();
    const timeLimit = parseInt(document.getElementById('quizTime').value);

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

    const saved = await saveQuizToFirebase(quiz);
    if (saved) {
        showQuizLink(quiz);
    } else {
        alert('Error saving quiz. Please try again.');
    }
}

function generateQuizCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showQuizLink(quiz) {
    document.getElementById('createQuizForm').classList.add('hidden');
    const linkSection = document.getElementById('quizLinkSection');
    linkSection.classList.remove('hidden');
    
    const quizURL = `${window.location.href.split('?')[0]}?quiz=${quiz.code}`;
    const storageType = isFirebaseEnabled() ? '☁️ Cloud (Works on all devices)' : '💾 Local (Current device only)';
    
    linkSection.innerHTML = `
        <div class="quiz-link-container">
            <h3>🎉 Quiz Created Successfully!</h3>
            <p style="margin-bottom: 0.5rem;">Storage: ${storageType}</p>
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

function resetQuizForm() {
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('quizTime').value = '15';
    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;
    document.getElementById('quizLinkSection').classList.add('hidden');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Link copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy. Please copy manually.');
    });
}

// ==========================================
// Teacher Functions - Quiz Management
// ==========================================

async function showMyQuizzes() {
    document.getElementById('teacherDashboard').classList.add('hidden');
    document.getElementById('myQuizzesList').classList.remove('hidden');
    
    // Show loading
    document.getElementById('quizzesList').innerHTML = '<p style="text-align:center;">Loading quizzes...</p>';
    
    if (isFirebaseEnabled()) {
        // Set up real-time listener for Firebase
        listenToQuizUpdates((quizzes) => {
            displayQuizzes(quizzes);
        });
    } else {
        // Load from localStorage
        const quizzes = await getQuizzesFromFirebase();
        displayQuizzes(quizzes);
    }
}

function displayQuizzes(quizzes) {
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

    container.innerHTML = quizzes.map(quiz => {
        const participantCount = quiz.participants ? 
            (Array.isArray(quiz.participants) ? quiz.participants.length : Object.keys(quiz.participants).length) : 0;
        
        return `
            <div class="quiz-card" onclick="viewQuizDetails('${quiz.id}')">
                <h3>${quiz.title}</h3>
                <p style="color: #666; margin-bottom: 0.5rem;">${quiz.description || 'No description'}</p>
                <p style="color: var(--primary); font-weight: 600;">
                    📊 ${quiz.questions.length} questions • ⏱️ ${quiz.timeLimit} minutes
                </p>
                <p style="margin-top: 0.5rem; font-size: 1.2rem; font-family: monospace; color: var(--secondary);">
                    Code: <strong>${quiz.code}</strong>
                </p>
                <span class="participants-count">👥 ${participantCount} participants</span>
            </div>
        `;
    }).join('');
}

async function viewQuizDetails(quizId) {
    const quizzes = await getQuizzesFromFirebase();
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const quizURL = `${window.location.href.split('?')[0]}?quiz=${quiz.code}`;
    
    // Convert participants object to array if needed
    let participantsArray = [];
    if (quiz.participants) {
        participantsArray = Array.isArray(quiz.participants) ? 
            quiz.participants : Object.values(quiz.participants);
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex;
        align-items: center; justify-content: center;
        z-index: 1000; padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 3rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <h2 style="font-family: 'Righteous', cursive; color: var(--secondary); margin-bottom: 1rem;">${quiz.title}</h2>
            <p style="color: #666; margin-bottom: 2rem;">${quiz.description || 'No description'}</p>
            
            <div style="background: #F8F9FA; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <p><strong>Questions:</strong> ${quiz.questions.length}</p>
                <p><strong>Time Limit:</strong> ${quiz.timeLimit} minutes</p>
                <p><strong>Quiz Code:</strong> <span style="font-size: 1.5rem; color: var(--primary); font-family: monospace;">${quiz.code}</span></p>
                <p><strong>Participants:</strong> ${participantsArray.length}</p>
            </div>

            <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 1.5rem; border-radius: 12px; color: white; margin-bottom: 1.5rem;">
                <p style="margin-bottom: 0.5rem; font-weight: 600;">Share this link:</p>
                <div style="background: white; color: var(--dark); padding: 0.8rem; border-radius: 8px; word-break: break-all; font-size: 0.9rem;">
                    ${quizURL}
                </div>
            </div>

            ${participantsArray.length > 0 ? `
                <div class="leaderboard">
                    <h3 style="font-family: 'Righteous', cursive; color: var(--secondary); margin-bottom: 1rem;">🏆 Leaderboard</h3>
                    ${participantsArray.sort((a, b) => b.score - a.score).map((p, i) => `
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
// Student Functions
// ==========================================

async function joinQuiz() {
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

    const quiz = await getQuizByCode(code);
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

function startQuiz() {
    displayQuestion();
    startTimer();
}

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

async function finishQuiz() {
    clearTimer();
    
    let score = 0;
    currentQuiz.questions.forEach((q, index) => {
        if (studentAnswers[index] === q.correctAnswer) {
            score++;
        }
    });

    const participant = {
        name: studentName,
        score: score,
        completedAt: new Date().toISOString()
    };

    await saveParticipantResult(currentQuiz.id, participant);
    displayResults(score);
}

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

    if (timeRemaining <= 60) {
        timerEl.style.background = 'linear-gradient(135deg, #EF476F, #f5576c)';
        timerEl.style.color = 'white';
    }
}

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

window.addEventListener('DOMContentLoaded', () => {
    // Check for quiz code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizCode = urlParams.get('quiz');
    
    if (quizCode) {
        selectMode('student');
        document.getElementById('quizCode').value = quizCode;
    }

    // Display Firebase status
    setTimeout(() => {
        if (isFirebaseEnabled()) {
            console.log('🌐 Multi-device mode: ENABLED (Firebase connected)');
        } else {
            console.log('💾 Single-device mode: localStorage only');
            console.log('To enable multi-device support, configure Firebase in index.html');
        }
    }, 1000);
});

// ==========================================
// Export functions to global scope for HTML onclick handlers
// ==========================================
window.selectMode = selectMode;
window.goBack = goBack;
window.showCreateQuiz = showCreateQuiz;
window.showMyQuizzes = showMyQuizzes;
window.addQuestion = addQuestion;
window.saveQuiz = saveQuiz;
window.cancelCreateQuiz = cancelCreateQuiz;
window.backToTeacherDashboard = backToTeacherDashboard;
window.joinQuiz = joinQuiz;
window.deleteQuiz = deleteQuiz;
window.handleQuestionChange = handleQuestionChange;
window.removeQuestion = removeQuestion;
window.selectAnswer = selectAnswer;
window.submitAnswer = submitAnswer;
window.finishQuiz = finishQuiz;
window.displayResults = displayResults;
window.retakeQuiz = retakeQuiz;
