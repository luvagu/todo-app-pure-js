// CONSTANTS
let CURRENT_USER = ''
let USER_FIRST_INITIAL = ''
let USER_OBJECT = {}
let USER_TODOS = []
let SELECTED_TODO_LIST_ID = null
const LS_SESSION_NAME = 'todos.sessionToken'
const LS_USERS_PREFIX = 'todos.user_'
const LS_USER_TODO_LISTS = 'todoLists'
const LS_USER_SELECTED_LIST_ID = 'selectedListId'
const SESSION = JSON.parse(localStorage.getItem(LS_SESSION_NAME)) || null

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

const userFirstInitialDisplay = document.querySelector('[data-user-name]')
const todosContainer = document.querySelector('[data-todos]')
const newTodoForm = document.querySelector('[data-new-todo-form]')
const newTodoInput = document.querySelector('[data-new-todo-input]')
const deleteTodoBtn = document.querySelector('[data-delete-todo-button]')
const todosListDisplayContainer = document.querySelector('[data-todo-display-container]')
const todosListTitle = document.querySelector('[data-todo-title]')
const saveListNameBtn = document.querySelector('[data-save-list-name]')
const todosListCounter = document.querySelector('[data-todo-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const taskTemplate = document.getElementById('task-template')
const clearCompletedTasksBtn = document.querySelector('[data-clear-complete-tasks-button]')

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

    // Hide messages if previously shown
    document.querySelector(`#account-form > #errMsg`).classList.add('hidden')
    document.querySelector(`#account-form > #successMsg`).classList.add('hidden')

    // Get the user object and load data accordingly
    const user = JSON.parse(localStorage.getItem(LS_USERS_PREFIX + CURRENT_USER)) || null
    document.querySelector('#account-form #email').value = user.email
    document.querySelector('#account-form #firstName').value = user.firstName
    document.querySelector('#account-form #lastName').value = user.lastName

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

// --> FORMS LOGIC

function formsHandler(e) {
    // Prevent the form from submiting
    e.preventDefault()

    // Get the form ID
    const formId = e.target.id

    // Select the forms error and account susccess elements
    const errMsg = document.querySelector(`#${formId} > #errMsg`)
    const successMsg = document.querySelector(`#account-form > #successMsg`)

    // Hide them by default
    errMsg.classList.add('hidden')
    successMsg.classList.add('hidden')

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

    // Validate payload & throw err accordingly
    if (!validatePayload(payload, formId)) {
        // Throw error message to user
        errMsg.classList.remove('hidden')
        errMsg.innerText = 'Missing or invalid field(s) supplied' 
        // console.log(formId, 'Missing or invalid field(s) supplied')
        return
    }

    // Assign the current user
    CURRENT_USER = payload.email

    // Sign Up Form 
    if (formId == 'signup-form') {

        // Check if the user is unique
        if (!isUserUnique(CURRENT_USER)) {
            errMsg.classList.remove('hidden')
            errMsg.innerText = 'A user with that email address already exists'
            return
        }

        // Hash the user's password
        payload.password = hashedPassword(payload.password)

        // Create the user's todos defaults
        payload.todoLists = []
        payload.selectedListId = null

        // Store the payload
        localStorage.setItem(LS_USERS_PREFIX + CURRENT_USER, JSON.stringify(payload))

        // Set the USER_OBJECT, USER_TODOS and SELECTED_TODO_LIST_ID
        USER_OBJECT = payload
        USER_TODOS = USER_OBJECT[LS_USER_TODO_LISTS]
        SELECTED_TODO_LIST_ID = USER_OBJECT[LS_USER_SELECTED_LIST_ID]

        // Assign the user first initial
        USER_FIRST_INITIAL = payload.firstName

        // Create a session
        const sessionData = {
            id: Date.now(),
            user: CURRENT_USER
        }
        localStorage.setItem(LS_SESSION_NAME, JSON.stringify(sessionData))

        // Log the user in and redirect
        logUserIn()

        // console.log('signup-form >>>', 'All good')
    }

    // Log In Form
    if (formId == 'login-form') {

        // Set the USER_OBJECT, USER_TODOS and SELECTED_TODO_LIST_ID
        USER_OBJECT = localStorage.getItem(LS_USERS_PREFIX + CURRENT_USER) !== null ? JSON.parse(localStorage.getItem(LS_USERS_PREFIX + CURRENT_USER)) : {}
        USER_TODOS = USER_OBJECT[LS_USER_TODO_LISTS] !== undefined ? USER_OBJECT[LS_USER_TODO_LISTS] : []
        SELECTED_TODO_LIST_ID = USER_OBJECT[LS_USER_SELECTED_LIST_ID] !== undefined ? USER_OBJECT[LS_USER_SELECTED_LIST_ID] : null

        // Assign the user first initial
        USER_FIRST_INITIAL = USER_OBJECT.firstName

        // Get the hashed password from the user's object or default to an empty string
        const hash = USER_OBJECT.password !== undefined ? USER_OBJECT.password : ''

        // Verify the user's password and continue or throw an error
        if (verifyPassword(payload.password, hash)) {

            // Create a session
            const sessionData = {
                id: Date.now(),
                user: CURRENT_USER
            }
            localStorage.setItem(LS_SESSION_NAME, JSON.stringify(sessionData))

            // Log the user in and redirect
            logUserIn()

            // console.log('login-form >>>', 'All good')
        } else {

            // console.log('login-form >>>', 'Incorrect password or the user may not exists')
            errMsg.classList.remove('hidden')
            errMsg.innerText = 'Incorrect email and/or password' 
            return
        }
    }

    // Account Form 
    if (formId == 'account-form') {

        // Update the user accordingly
        USER_OBJECT.firstName = payload.firstName
        USER_OBJECT.lastName = payload.lastName

        // Assign the user first initial and re-render if changed
        USER_FIRST_INITIAL = payload.firstName
        renderUserFirstInitial()

        // Hash the user's password if a new one was supplied (or keep it unchanged)
        if (payload.password !== '') {
            USER_OBJECT.password = hashedPassword(payload.password)
        }

        // Store the update
        localStorage.setItem(LS_USERS_PREFIX + CURRENT_USER, JSON.stringify(USER_OBJECT))

        // Show a success message
        successMsg.classList.remove('hidden')
        successMsg.innerText = 'Update successful'

        // Reset the password field
        document.querySelector('#account-form #password').value = ''

        // console.log('account-form >>>', 'All good')
    }

    // Reset SignUp and Login forms specifically
    signUpForm.reset()
    logInForm.reset()
    errMsg.classList.add('hidden')
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
            (typeof(payload['password']) == 'string' && (payload['password'] == '' || payload['password'].length >= 4))
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
    return localStorage[LS_USERS_PREFIX + user] == undefined
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

function renderUserFirstInitial() {
    // Set userFirstInitialDisplay
    userFirstInitialDisplay.innerText = `${USER_FIRST_INITIAL.split('')[0].toUpperCase()}'s To-Do's`
}

function logUserIn() {
    loggedOutNavLinks.forEach(section => section.classList.add('hidden'))
    loggedInNavLinks.forEach(section => section.classList.remove('hidden'))

    // Render user first initial display
    renderUserFirstInitial()

    // Hide all sections
    hideAllSections()

    // Show the dashboard
    showDashboardSection()

    // Activate Nav dashboard button
    activeNavBtn('dashboard')

    // Render User's todos
    renderTodos()
}

function logUserOut() {
    loggedOutNavLinks.forEach(section => section.classList.remove('hidden'))
    loggedInNavLinks.forEach(section => section.classList.add('hidden'))

    // Hide all sections
    hideAllSections()

    // Show the home section
    showHomeSection()

    // Reset Nav 'active' class
    activeNavBtn(undefined)

    // Delete the current session token
    localStorage.removeItem(LS_SESSION_NAME)

    // Reset the USER_OBJECT, USER_TODOS and SELECTED_TODO_LIST_ID to their defaults
    USER_OBJECT = {}
    USER_TODOS = []
    SELECTED_TODO_LIST_ID = null
}

// --> TODOS LOGIC

newTodoForm.addEventListener('submit', e => {
    e.preventDefault()
    const todoName = newTodoInput.value.trim()
    if (todoName == null || todoName === '' || USER_TODOS.some(todo => todo.name == todoName)) return
    const todo = createTodo(todoName)
    newTodoInput.value = null
    USER_TODOS.push(todo)
    SELECTED_TODO_LIST_ID = todo.id
    saveAndRender()
})

todosContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        SELECTED_TODO_LIST_ID = e.target.dataset.todoId
        saveAndRender()
    }
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault()
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedTodo = USER_TODOS.find(list => list.id === SELECTED_TODO_LIST_ID)
    selectedTodo.tasks.push(task)
    saveAndRender()
})

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedTodo = USER_TODOS.find(todo => todo.id === SELECTED_TODO_LIST_ID)
        const selectedTask = selectedTodo.tasks.find(task => task.id === e.target.id)
        selectedTask.completed = e.target.checked
        saveTodos()
        renderTodoTasksCount(selectedTodo)
    }
})

todosListTitle.addEventListener('click', e => {
    saveListNameBtn.classList.remove('hidden')
    e.target.style.backgroundColor = 'white'
    e.target.style.padding = '0 5px'
})

todosListTitle.addEventListener('input', e => {
    e.preventDefault()

    let id = e.target.dataset.todoId
    let name = e.target.textContent.replace('\n', '').trim()
    if (name.length >= 1 && !USER_TODOS.some(todo => todo.name == name)) {
        changeTodoListName(id, name)
    }
})

saveListNameBtn.addEventListener('click', () => {
    todosListTitle.style.backgroundColor = 'transparent'
    todosListTitle.style.padding = '0'
    todosListTitle.blur()
    saveListNameBtn.classList.add('hidden')
    saveAndRender()
})

clearCompletedTasksBtn.addEventListener('click', () => {
    const selectedTodo = USER_TODOS.find(todo => todo.id === SELECTED_TODO_LIST_ID)
    selectedTodo.tasks = selectedTodo.tasks.filter(task => !task.completed)
    saveAndRender()
})

deleteTodoBtn.addEventListener('click', () => {
    USER_TODOS = USER_TODOS.filter(todo => todo.id !== SELECTED_TODO_LIST_ID)
    SELECTED_TODO_LIST_ID = null
    saveAndRender()
})

function createTodo(name) {
    return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name) {
    return { id: Date.now().toString(), name: name, completed: false }
}

function renderTodos() {
    clearElement(todosContainer)
    renderTodosList()

    const selectedTodoList = USER_TODOS.find(list => list.id === SELECTED_TODO_LIST_ID)
    if (SELECTED_TODO_LIST_ID == null || USER_TODOS.length < 1) {
        todosListDisplayContainer.style.display = 'none'
    } else {
        todosListDisplayContainer.style.display = ''
        todosListTitle.innerText = selectedTodoList.name !== undefined ? selectedTodoList.name : ''
        todosListTitle.setAttribute('contenteditable', 'true')
        todosListTitle.dataset.todoId = selectedTodoList.id
        renderTodoTasksCount(selectedTodoList)
        clearElement(tasksContainer)
        renderTodoTasks(selectedTodoList)
    }
}

function renderTodosList() {
    USER_TODOS.forEach(todo => {
        const todoElement = document.createElement('li')
        todoElement.dataset.todoId = todo.id
        todoElement.classList.add('list-name')
        todoElement.innerText = todo.name
        if (todoElement.dataset.todoId === SELECTED_TODO_LIST_ID) {
            todoElement.classList.add('active-list')
        }
        todosContainer.appendChild(todoElement)
    })
}

function changeTodoListName(id, name) {
    const selectedTodoList = USER_TODOS.find(list => list.id == id)
    selectedTodoList.name = name
}

function renderTodoTasksCount(selectedTodo) {
    const incompleteTasksCount = selectedTodo.tasks.filter(task => !task.completed).length
    const taskString = incompleteTasksCount === 1 ? 'task' : 'tasks'
    todosListCounter.innerText = `${incompleteTasksCount} ${taskString} remaining`
}

function renderTodoTasks(selectedTodo) {
    selectedTodo.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.completed
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function clearElement(elem) {
    while(elem.firstChild) {
        elem.removeChild(elem.firstChild)
    }
}

function saveTodos() {
    USER_OBJECT[LS_USER_TODO_LISTS] = USER_TODOS
    USER_OBJECT[LS_USER_SELECTED_LIST_ID] = SELECTED_TODO_LIST_ID
    localStorage.setItem(LS_USERS_PREFIX + CURRENT_USER, JSON.stringify(USER_OBJECT))
}

function saveAndRender() {
    saveTodos()
    renderTodos()
}

// --> SESSION AUTO-LOGIN AND APP INIT

function sessionChecker() {
    
    // Check for an active session, if so redirect to the dashboard and load their todos, otherwise log the user out if there is an error
    if (SESSION !== null && SESSION.user !== undefined) {
        // Set the current user
        CURRENT_USER = SESSION.user

        // Set the USER_OBJECT, USER_TODOS and SELECTED_TODO_LIST_ID
        USER_OBJECT = localStorage.getItem(LS_USERS_PREFIX + CURRENT_USER) !== null ? JSON.parse(localStorage.getItem(LS_USERS_PREFIX + CURRENT_USER)) : {}
        USER_TODOS = USER_OBJECT[LS_USER_TODO_LISTS] !== undefined ? USER_OBJECT[LS_USER_TODO_LISTS] : []
        SELECTED_TODO_LIST_ID = USER_OBJECT[LS_USER_SELECTED_LIST_ID] !== undefined ? USER_OBJECT[LS_USER_SELECTED_LIST_ID] : null

        // Set the user first initial
        USER_FIRST_INITIAL = USER_OBJECT.firstName
        
        // Log the User in
        logUserIn()

        // Render User's todos
        renderTodos()

        // console.log('A ssession was found')
    } else {
        showHomeSection()

        // console.log('No session found')
    }
}
 
function appInit() {

    // Check if there's an active session
    sessionChecker()

    // console.log('All app scripts loaded succesfuly!')
}

window.onload = () => {
    appInit()
}
