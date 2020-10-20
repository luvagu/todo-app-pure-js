const todosContainer = document.querySelector('[data-todos]')
const newTodoForm = document.querySelector('[data-new-todo-form]')
const newTodoInput = document.querySelector('[data-new-todo-input]')
const deleteTodoBtn = document.querySelector('[data-delete-todo-button]')
const todosListDisplayContainer = document.querySelector('[data-todo-display-container]')
const todosListTitle = document.querySelector('[data-todo-title]')
const todosListCounter = document.querySelector('[data-todo-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const taskTemplate = document.getElementById('task-template')
const clearCompletedTasksBtn = document.querySelector('[data-clear-complete-tasks-button]')

const LS_TODO_LIST_KEY = 'todos.lists'
const LS_TODO_SELECTED_LIST_ID_KEY = 'todos.selectedListId'

let todos = JSON.parse(localStorage.getItem(LS_TODO_LIST_KEY)) || []
let selectedTodoListId = localStorage.getItem(LS_TODO_SELECTED_LIST_ID_KEY)

todosContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedTodoListId = e.target.dataset.todoId
        saveAndRender()
    }
})

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedTodo = todos.find(todo => todo.id === selectedTodoListId)
        const selectedTask = selectedTodo.tasks.find(task => task.id === e.target.id)
        selectedTask.completed = e.target.checked
        saveTodos()
        renderTodoTasksCount(selectedTodo)
    }
})

deleteTodoBtn.addEventListener('click', () => {
    todos = todos.filter(todo => todo.id !== selectedTodoListId)
    selectedTodoListId = null
    saveAndRender()
})

newTodoForm.addEventListener('submit', e => {
    e.preventDefault()
    const todoName = newTodoInput.value
    if (todoName == null || todoName === '') return
    const todo = createTodo(todoName)
    newTodoInput.value = null
    todos.push(todo)
    saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault()
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedTodo = todos.find(list => list.id === selectedTodoListId)
    selectedTodo.tasks.push(task)
    saveAndRender()
})

clearCompletedTasksBtn.addEventListener('click', () => {
    const selectedTodo = todos.find(todo => todo.id === selectedTodoListId)
    selectedTodo.tasks = selectedTodo.tasks.filter(task => !task.completed)
    saveAndRender()
})

function createTodo(name) {
    return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name) {
    return { id: Date.now().toString(), name: name, completed: false }
}

function saveAndRender() {
    saveTodos()
    renderTodos()
}

function saveTodos() {
    localStorage.setItem(LS_TODO_LIST_KEY, JSON.stringify(todos))
    localStorage.setItem(LS_TODO_SELECTED_LIST_ID_KEY, selectedTodoListId)
}

function renderTodos() {
    clearElement(todosContainer)
    renderTodosList()

    const selectedTodoList = todos.find(list => list.id === selectedTodoListId)
    if (selectedTodoListId == null || todos.length < 1) {
        todosListDisplayContainer.style.display = 'none'
    } else {
        todosListDisplayContainer.style.display = ''
        todosListTitle.innerText = selectedTodoList.name !== undefined ? selectedTodoList.name : ''
        renderTodoTasksCount(selectedTodoList)
        clearElement(tasksContainer)
        renderTodoTasks(selectedTodoList)
    }
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

function renderTodoTasksCount(selectedTodo) {
    const incompleteTasksCount = selectedTodo.tasks.filter(task => !task.completed).length
    const taskString = incompleteTasksCount === 1 ? 'task' : 'tasks'
    todosListCounter.innerText = `${incompleteTasksCount} ${taskString} remaining`
}

function renderTodosList() {
    todos.forEach(todo => {
        const todoElement = document.createElement('li')
        todoElement.dataset.todoId = todo.id
        todoElement.classList.add('list-name')
        todoElement.innerText = todo.name
        if (todoElement.dataset.todoId === selectedTodoListId) {
            todoElement.classList.add('active-list')
        }
        todosContainer.appendChild(todoElement)
    })
}

function clearElement(elem) {
    while(elem.firstChild) {
        elem.removeChild(elem.firstChild)
    }
}

saveAndRender()