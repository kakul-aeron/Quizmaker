# QuizLab - Interactive Learning Platform 🎓

A modern, feature-rich quiz application designed for both teachers and students. Create engaging quizzes, share them instantly, and track student performance in real-time.

![Quiz App](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🌟 Features

### For Teachers 👨‍🏫
- **Create Custom Quizzes**: Build quizzes with multiple-choice questions
- **Time Management**: Set custom time limits for each quiz
- **Easy Sharing**: Generate unique 6-digit codes and shareable links
- **Dashboard**: View all created quizzes in one place
- **Performance Tracking**: Monitor student participation and scores
- **Leaderboard**: See top performers for each quiz

### For Students 👨‍🎓
- **Quick Join**: Enter quiz using code or direct link
- **Timed Tests**: Complete quizzes within set time limits
- **Real-time Timer**: Visual countdown keeps you on track
- **Progress Tracking**: See how far you've progressed through the quiz
- **Instant Results**: Get your score immediately after completion
- **Answer Review**: Review all questions with correct/incorrect answers highlighted

## 🎨 Design Highlights

- **Vibrant UI**: Eye-catching gradient backgrounds and animations
- **Smooth Animations**: Professional transitions and hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Custom Typography**: Unique font combinations for better readability
- **Intuitive Interface**: Easy to navigate for both teachers and students

## 🚀 Live Demo

[View Live Demo]((https://kakul-aeron.github.io/Quizmaker/))

*(Replace YOUR-USERNAME with your GitHub username)*

## 📸 Screenshots

### Home Page
Choose between Teacher Mode and Student Mode

### Teacher Dashboard
Create and manage your quizzes

### Student Quiz Interface
Take quizzes with real-time timer and progress tracking

### Results Page
View detailed results with answer review

## 🛠️ Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Advanced styling with animations and gradients
- **JavaScript**: Dynamic functionality and quiz logic
- **LocalStorage**: Client-side data persistence
- **Google Fonts**: Righteous and DM Sans typography

## 📦 Installation & Setup

### Quick Start (No Installation Required)
1. Download the `index.html` file
2. Open it in any modern web browser
3. Start creating or taking quizzes!

### For Development
```bash
# Clone the repository
git clone https://github.com/kakul-aeron/Quizmaker.git

# Navigate to the directory
cd quiz-app

# Open in browser
# Simply double-click index.html or use a local server
```

## 📖 How to Use

### Teacher Mode

1. **Select Teacher Mode** from the home page
2. **Create New Quiz**
   - Enter quiz title and description
   - Set time limit
   - Add questions with 4 options each
   - Mark the correct answer
3. **Save Quiz**
   - Get a unique 6-digit code
   - Get a shareable link
4. **View My Quizzes**
   - See all created quizzes
   - View participant count
   - Check leaderboard

### Student Mode

1. **Select Student Mode** from the home page
2. **Enter Your Name**
3. **Enter Quiz Code** (6-digit code from teacher)
4. **Take the Quiz**
   - Read each question carefully
   - Select your answer
   - Click "Next Question"
5. **View Results**
   - See your score
   - Review all answers
   - Check correct answers

## 🎯 Key Functionalities

### Quiz Creation
- Unlimited questions per quiz
- 4 options per question
- Customizable time limits
- Unique quiz codes generation

### Quiz Taking
- Real-time countdown timer
- Progress bar showing completion
- Answer selection with visual feedback
- Auto-submit when time expires

### Results & Analytics
- Immediate score calculation
- Percentage display
- Detailed answer review
- Leaderboard rankings

### Data Management
- Browser LocalStorage for persistence
- No backend required
- Works offline after first load
- Shareable quiz links

## 🔧 Customization

### Changing Colors
Edit the CSS variables in the `<style>` section:
```css
:root {
    --primary: #FF6B35;      /* Main accent color */
    --secondary: #004E89;    /* Secondary color */
    --accent: #FFD23F;       /* Highlight color */
    --success: #06D6A0;      /* Success messages */
    --danger: #EF476F;       /* Error messages */
}
```

### Adjusting Timer
Default time limit is 15 minutes. Change in the HTML:
```html
<input type="number" id="quizTime" min="1" max="180" value="15">
```

### Modifying Animations
Find and edit animation keyframes in the CSS:
```css
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 📱 Mobile Responsive

Fully responsive design works on:
- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 🐛 Known Limitations

- Data stored in browser LocalStorage (cleared when browser data is cleared)
- No real-time synchronization between teacher and students
- Maximum storage depends on browser limits (~5-10MB)
- No user authentication system

## 🚀 Future Enhancements

Potential features to add:
- [ ] Backend integration for persistent storage
- [ ] Real-time quiz sessions with WebSockets
- [ ] Export results to PDF/CSV
- [ ] Image support in questions
- [ ] Multiple question types (True/False, Fill-in-the-blank)
- [ ] Question bank and quiz templates
- [ ] User authentication and profiles
- [ ] Analytics dashboard for teachers
- [ ] Dark mode toggle
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - feel free to use it for educational purposes, modify it, and distribute it.

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 👨‍💻 Author

Kakul Aeron
- GitHub: [@YOUR-USERNAME](https://github.com/kakul-aeron)


## 🙏 Acknowledgments

- Fonts from [Google Fonts](https://fonts.google.com/)
- Inspiration from modern educational platforms
- Built as an engineering student project

## 📞 Support

If you encounter any issues or have questions:
1. Open an issue on GitHub
2. Contact the developer

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ for education**

*Last Updated: January 2026*
