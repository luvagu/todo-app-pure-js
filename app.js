// Constants
let _CURRENT_USER
const LS_SESSION_NAME = 'todos.sessionToken'
const LS_USERS_PREFIX = 'todos.user_'
const _SESSION = JSON.parse(localStorage.getItem(LS_SESSION_NAME)) || null

// Selectors
const navLiElems =  document.querySelectorAll('nav ul li a')
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
        activeNavBtn('signup')
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
        activeNavBtn('login')
    })
})

// LogOut button
logOutBtnNav.addEventListener('click', (e) => {
    e.preventDefault()

    // Log the user out
    logUserOut()
})

// Dashboard button
dashboardBtnNav.addEventListener('click', (e) => {
    e.preventDefault()

    // Hide all sections
    hideAllSections()

    // Load the sectionLogIn
    showDashboardSection()

    // Set the 'active' class
    activeNavBtn('dashboard')
})

// Account button
accountBtnNav.addEventListener('click', (e) => {
    e.preventDefault()

    // Hide all sections
    hideAllSections()

    // Load the sectionLogIn
    showAccountSection()

    // Set the 'active' class
    activeNavBtn('account')
})

// SignUp form
signUpForm.addEventListener('submit', formsHandler)

// logInForm form
logInForm.addEventListener('submit', formsHandler)

// accountForm form
accountForm.addEventListener('submit', formsHandler)

// Forms handler
function formsHandler(e) {
    // Prevent the form from submiting
    e.preventDefault()

    // Get the form ID
    const formId = e.target.id

    // Turn the inputs into a payload
    const payload = {}

    // Define the inputs object
    const inputs = e.target.elements

    // Start bulding the payload
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.type !== 'submit') {
            // Build the payload
            payload[input.name] = input.type == 'checkbox' ? input.checked : input.value.trim()
        }
    }

    // @TODO
    // Validate payload & throw err accordingly
    if (!validatePayload(payload, formId)) {
        // @TODO - Throw error message to user
        console.log(formId, 'Missing or invalid field(s) supplied')
        return
    }

    // Assign the current user
    _CURRENT_USER = payload.email

    // Sign Up Form: Check if the user is unique
    if (formId == 'signup-form' && isUserUnique(_CURRENT_USER)) {
        // Hash the user's password
        payload.password = hashedPassword(payload.password)

        // Store the payload
        localStorage.setItem(LS_USERS_PREFIX + _CURRENT_USER, JSON.stringify(payload))

        // Create a session
        const sessionData = {
            id: Date.now(),
            user: _CURRENT_USER
        }
        localStorage.setItem(LS_SESSION_NAME, JSON.stringify(sessionData))

        // Log the user in and redirect
        logUserIn()

        // Activate nav dashboard link
        activeNavBtn('dashboard')

        // TODO - remove log
        console.log('signup-form >>>', 'All good')
    }

    // Log In Form
    if (formId == 'login-form') {

        // Get the user object
        const user = JSON.parse(localStorage.getItem(LS_USERS_PREFIX + _CURRENT_USER)) || null

        // Get the hashed password from the user's object or default to an empty string
        const hash = typeof(user) == 'object' && user !== null ? user.password : ''

        // Verify the user's password and continue or throw an error
        if (verifyPassword(payload.password, hash)) {

            // Create a session
            const sessionData = {
                id: Date.now(),
                user: _CURRENT_USER
            }
            localStorage.setItem(LS_SESSION_NAME, JSON.stringify(sessionData))

            // Log the user in and redirect
            logUserIn()

            // Activate nav dashboard link
            activeNavBtn('dashboard')

            // TODO - remove log
            console.log('login-form >>>', 'All good')
        } else {

            // TODO - remove log
            console.log('login-form >>>', 'Incorrect password or the user may not exists')
        }
    }

    // @TODO - Reset the form
    e.target.reset()
}

function validatePayload(payload, formId) {
    payload = typeof(payload) == 'object' && payload !== null ? payload : false
    formId = typeof(formId) == 'string' && formId.trim().length > 0 ? formId.trim() : false

    // console.log('validatePayload() -> formId >>>', formId)
    // console.log('validatePayload() -> payload >>>', payload)

    if (payload && formId == 'signup-form') {
        return (typeof(payload['firstName']) == 'string' && payload['firstName'].length > 0) && 
            (typeof(payload['lastName']) == 'string' && payload['lastName'].length > 0) && 
            (typeof(payload['email']) == 'string' && validateEmail(payload['email'])) && 
            (typeof(payload['password']) == 'string' && payload['password'].length >= 4) && 
            (typeof(payload['tosAgreement']) == 'boolean' && payload['tosAgreement'] !== false)
    }
    
    if (payload && formId == 'login-form') {
        return (typeof(payload['email']) == 'string' && validateEmail(payload['email'])) && 
            (typeof(payload['password']) == 'string' && payload['password'].length >= 4)
    }
    
    if (payload && formId == 'account-form') {
        return (typeof(payload['firstName']) == 'string' && payload['firstName'].length > 0) && 
            (typeof(payload['lastName']) == 'string' && payload['lastName'].length > 0) && 
            (typeof(payload['email']) == 'string' && validateEmail(payload['email'])) && 
            (typeof(payload['password']) == 'string' && payload['password'].length >= 4)
    } 

    // Default to false
    return false
    
}

function validateEmail(email) {
    // Validate parameters
    email = typeof(email) == 'string' && email.length >= 6 ? email : false;
    const regEx = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,4})(\]?)$/;

    if (email) {
        return regEx.test(email)
    } else {
        return false
    }
}

function isUserUnique(user) {
    if (localStorage[LS_USERS_PREFIX + user] == undefined) {
        // @TODO - habdle error & remove log
        console.log('signup-form >>>', 'Success: user is unique')
        return true
    }

    // @TODO - habdle error & remove log
    console.log('signup-form >>>', 'Error: A user with that email address already exists')
    return false
} 

function hashedPassword(password) {
    // Require bcrypt
    const bcrypt = dcodeIO.bcrypt;

    // Auto-gen a salt and hash:
    const hash = bcrypt.hashSync(password, 10)

    return hash
}

function verifyPassword(password, hash) {
    // Require bcrypt
    const bcrypt = dcodeIO.bcrypt;

    return bcrypt.compareSync(password, hash)
}

function activeNavBtn(target) {
    // Reset element current 'active' class 
    navLiElems.forEach(link => link.parentElement.classList.remove('active'))

    // Return if e isn't defined
    if (target == undefined || target == null) return

    // Add class 'active' to the parent's target elem
    if (target == 'signup') {
        navLiElems.forEach(link => link.textContent == 'Sign Up' && link.parentElement.classList.add('active'))
    }
    if (target == 'login') {
        navLiElems.forEach(link => link.textContent == 'Log In' && link.parentElement.classList.add('active'))
    }
    if (target == 'dashboard') {
        navLiElems.forEach(link => link.textContent == 'Dashboard' && link.parentElement.classList.add('active'))
    }
    if (target == 'account') {
        navLiElems.forEach(link => link.textContent == 'Account Settings' && link.parentElement.classList.add('active'))
    }
}

function showHomeSection() {
    sectionHome.classList.remove('hidden')
}

function showSignUpSection() {
    sectionSignUp.classList.remove('hidden')
}

function showLogInSection() {
    sectionLogIn.classList.remove('hidden')
}

function showAccountSection() {
    sectionAccount.classList.remove('hidden')
}

function showDashboardSection() {
    sectionDashboard.classList.remove('hidden')
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

    // Hide all sections
    hideAllSections()

    // Show the dashboard
    showDashboardSection()
}

function logUserOut() {
    loggedOutNavLinks.forEach(section => section.classList.remove('hidden'))
    loggedInNavLinks.forEach(section => section.classList.add('hidden'))

    // Hide all other sections as well
    hideAllSections()

    // Show the showHomeSection
    showHomeSection()

    // Reset Nav 'active' class
    activeNavBtn(undefined)
}

function sessionChecker() {
    // @TODO
    // Check for an active session, if so redirect to the dashboard and load their todos, otherwise log the user out if there is an error

    // Laod the user's saved todo's on active session
    // loadUserToDos()
}

function loadUserToDos() {
    // @TODO
}
 
function appInit() {
    // @TODO

    // Check if there's an active session
    // sessionChecker()

    console.log('All app scripts loaded succesfuly!')
}

window.onload = () => {
    appInit()
}
