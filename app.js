// Selectors
const loggedOutSections = document.querySelectorAll('[data-logged-out]')
const loggedInSections = document.querySelectorAll('[data-logged-in]')

const signUpBtnNav = document.getElementById('signup-button-nav')
const logInBtnNav = document.getElementById('login-button-nav')
const dashboardBtnNav = document.getElementById('dashboard-button-nav')
const accountBtnNav = document.getElementById('account-button-nav')
const logOutBtnNav = document.getElementById('logout-button-nav')

const signUpBtnHome = document.getElementById('signup-button-home')
const logInBtnHome = document.getElementById('login-button-home')

const sectionSignUp = document.getElementById('signup-form-section')
const sectionLogIn = document.getElementById('login-form-section')
const sectionAccount = document.getElementById('account-form-section')
const sectionDashboard = document.getElementById('dashboard-section')

const signUpForm = document.getElementById('signup-form')
const logInForm = document.getElementById('login-form')
const accountForm = document.getElementById('account-form')

function logUserIn() {
    loggedOutSections.forEach(section => section.classList.add('hidden'))
    loggedInSections.forEach(section => section.classList.remove('hidden'))
}

function logUserOut() {
    loggedOutSections.forEach(section => section.classList.remove('hidden'))
    loggedInSections.forEach(section => section.classList.add('hidden'))

    // Hide all other sections as well
    sectionSignUp.classList.add('hidden')
    sectionLogIn.classList.add('hidden')
    sectionAccount.classList.add('hidden')
    sectionDashboard.classList.add('hidden')
}


function appInit() {
    // Add all app releate functions
    console.log('All app scripts loaded succesfuly!')
}

window.onload = () => {
    appInit()
}
