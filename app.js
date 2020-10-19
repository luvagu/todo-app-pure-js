// Selectors
const navLiElems =  document.querySelectorAll('nav ul li')
const loggedOutNavLinks = document.querySelectorAll('[data-logged-out]')
const loggedInNavLinks = document.querySelectorAll('[data-logged-in]')

const signUpBtns = document.querySelectorAll('[data-signup-button]')
const logInBtns = document.querySelectorAll('[data-login-button]')

const dashboardBtnNav = document.getElementById('dashboard-button-nav')
const accountBtnNav = document.getElementById('account-button-nav')
const logOutBtnNav = document.getElementById('logout-button-nav')

const sectionHome = document.getElementById('home-section')
const sectionSignUp = document.getElementById('signup-section')
const sectionLogIn = document.getElementById('login-section')
const sectionAccount = document.getElementById('account-section')
const sectionDashboard = document.getElementById('dashboard-section')

const signUpForm = document.getElementById('signup-form')
const logInForm = document.getElementById('login-form')
const accountForm = document.getElementById('account-form')

// SignUp buttons
signUpBtns.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault()
        
        // Hide all sections
        hideAllSections()

        // Load the sectionSignUp
        showSignUpSection()

        // Set the 'active' class
        activeNavBtn(e.target)
    })
})

// LogIn buttons
logInBtns.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault()

        // Hide all sections
        hideAllSections()

        // Load the sectionLogIn
        showLogInSection()

        // Set the 'active' class
        activeNavBtn(e.target)
    })
})

// LogOut button


function activeNavBtn(e) {
    // Reset element current 'active' class 
    navLiElems.forEach(li => li.classList.remove('active'))

    // Add class 'active' to the current elem
    if (e.parentElement.tagName == 'LI') {
        e.parentElement.classList.add('active')
    } else {
        // When on home page
        if (e.textContent == 'Sign Up') {
            navLiElems.forEach(li => li.textContent == 'Sign Up' && li.classList.add('active'))
        }
        if (e.textContent == 'Log In') {
            navLiElems.forEach(li => li.textContent == 'Log In' && li.classList.add('active'))
        }
    }
}

function showHomeSection(add) {
    if (add) {
        sectionHome.classList.add('hidden')
    } else {
        sectionHome.classList.remove('hidden')
    }
}

function showSignUpSection(add) {
    if (add) {
        sectionSignUp.classList.add('hidden')
    } else {
        sectionSignUp.classList.remove('hidden')
    }
}

function showLogInSection(add) {
    if (add) {
        sectionLogIn.classList.add('hidden')
    } else {
        sectionLogIn.classList.remove('hidden')
    }
}

function showAccountSection(add) {
    if (add) {
        sectionAccount.classList.add('hidden')
    } else {
        sectionAccount.classList.remove('hidden')
    }
}

function showDashboardSection(add) {
    if (add) {
        sectionDashboard.classList.add('hidden')
    } else {
        sectionDashboard.classList.remove('hidden')
    }
}

function hideAllSections() {
    sectionHome.classList.add('hidden')
    sectionSignUp.classList.add('hidden')
    sectionLogIn.classList.add('hidden')
    sectionAccount.classList.add('hidden')
    sectionDashboard.classList.add('hidden')
}

function logUserIn() {
    loggedOutNavLinks.forEach(section => section.classList.add('hidden'))
    loggedInNavLinks.forEach(section => section.classList.remove('hidden'))
}

function logUserOut() {
    loggedOutNavLinks.forEach(section => section.classList.remove('hidden'))
    loggedInNavLinks.forEach(section => section.classList.add('hidden'))

    // Hide all other sections as well
    hideAllSections()
}





function appInit() {
    // @TODO
    // Check if the user is logged in and redirect, otherwise log the user out
    console.log('All app scripts loaded succesfuly!')
}

window.onload = () => {
    appInit()
}
