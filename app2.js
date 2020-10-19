/*
 * Front end Logic for the Application
 *
 */

// Container for the frontend application
const app = {}

// Config
app.config = {
	sessionToken: false,
}

// AJAX Client (for the result API)
app.client = {}

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {

	// Set defaults
	headers = typeof headers == 'object' && headers !== null ? headers : {}
	path = typeof path == 'string' ? path : '/'
	method = typeof method == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET'
	queryStringObject = typeof queryStringObject == 'object' && queryStringObject !== null ? queryStringObject : {}
	payload = typeof payload == 'object' && payload !== null ? payload : {}
	callback = typeof callback == 'function' ? callback : false

	// For each query string parameter sent, add it to the path
	let requestUrl = path + '?'
	let counter = 0
	for (const queryKey in queryStringObject) {
		if (queryStringObject.hasOwnProperty(queryKey)) {
			counter++
			// If at least one query string parameter has already been added, prepend new ones with an ampersant
			if (counter > 1) {
				requestUrl += '&'
			}

			// Add the key and the value
			requestUrl += queryKey + '=' + queryStringObject[queryKey]
		}
	}

	// Form the http request as a JSON type
	const xhr = new XMLHttpRequest()
	xhr.open(method, requestUrl, true)
	xhr.setRequestHeader('Content-Type', 'application/json')

	// For each header sent, add it to the request
	for (const headerKey in headers) {
		if (headers.hasOwnProperty(headerKey)) {
			xhr.setRequestHeader(headerKey, headers[headerKey])
		}
	}

	// If there is a current session token set, add that as a header
	if (app.config.sessionToken) {
		xhr.setRequestHeader('token', app.config.sessionToken.id)
	}

	// When the request comes back, handle the response
	xhr.onreadystatechange = () => {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			const statusCode = xhr.status
			const responseReturned = xhr.responseText

			// Callback if requested
			if (callback) {
				try {
					const parsedResponse = JSON.parse(responseReturned)
					callback(statusCode, parsedResponse)
				} catch (e) {
					callback(statusCode, false)
				}
			}
		}
	}

	// Send the payload as JSON
	const payloadString = JSON.stringify(payload)
	xhr.send(payloadString)
}

// Bind the logout button
app.bindLogoutButton = () => {
	document
		.getElementById('logoutButton')
		.addEventListener('click', (e) => {
			// Stop it from redirecting anywhere
			e.preventDefault()

			// Log the user out
			app.logUserOut()
		})
}

// Log the user out then redirect them
app.logUserOut = (redirectUser) => {
	// Set redirectUser to default to true
	redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true

	// Get the current token id
	const tokenId =
		typeof app.config.sessionToken.id == 'string'
			? app.config.sessionToken.id
			: false

	// Send the current token to the tokens endpoint to delete it
	const queryStringObject = {
		id: tokenId,
	}
	app.client.request(
		undefined,
		'api/tokens',
		'DELETE',
		queryStringObject,
		undefined,
		(statusCode, responsePayload) => {
			// Set the app.config token as false
			app.setSessionToken(false)

			// Send the user to the logged out page
			if (redirectUser) {
				window.location = '/session/deleted'
			}
		}
	)
}

// Bind the forms
app.bindForms = () => {
	if (document.querySelector('form')) {
		const allForms = document.querySelectorAll('form')
		for (let i = 0; i < allForms.length; i++) {
			allForms[i].addEventListener('submit', function(e) {
				// Stop it from submitting
				e.preventDefault()
				const formId = this.id
				const path = this.action
				let method = this.method.toUpperCase()

				// Hide the error message (if it's currently shown due to a previous error)
				document.querySelector('#' + formId + ' .formError').style.display = 'none'

				// Hide the success message (if it's currently shown due to a previous error)
				if (document.querySelector('#' + formId + ' .formSuccess')) {
					document.querySelector('#' + formId + ' .formSuccess').style.display = 'none'
				}

				// Turn the inputs into a payload
				const payload = {}
				const elements = this.elements
				for (let i = 0; i < elements.length; i++) {
					if (elements[i].type !== 'submit') {
						// Determine class of element and set value accordingly
						const classOfElement =
							typeof elements[i].classList.value == 'string' &&
							elements[i].classList.value.length > 0
								? elements[i].classList.value
								: ''
						const valueOfElement =
							elements[i].type == 'checkbox' &&
							classOfElement.indexOf('multiselect') == -1
								? elements[i].checked
								: classOfElement.indexOf('intval') == -1
								? elements[i].value
								: parseInt(elements[i].value)
						const elementIsChecked = elements[i].checked
						// Override the method of the form if the input's name is _method
						let nameOfElement = elements[i].name
						if (nameOfElement == '_method') {
							method = valueOfElement
						} else {
							// Create an payload field named "method" if the elements name is actually httpmethod
							if (nameOfElement == 'httpmethod') {
								nameOfElement = 'method'
							}
							// Create an payload field named "id" if the elements name is actually uid
							if (nameOfElement == 'uid') {
								nameOfElement = 'id'
							}
							// If the element has the class "multiselect" add its value(s) as array elements
							if (classOfElement.indexOf('multiselect') > -1) {
								if (elementIsChecked) {
									payload[nameOfElement] =
										typeof payload[nameOfElement] == 'object' &&
										payload[nameOfElement] instanceof Array
											? payload[nameOfElement]
											: []
									payload[nameOfElement].push(valueOfElement)
								}
							} else {
								payload[nameOfElement] = valueOfElement
							}
						}
					}
				}

				// If the method is DELETE, the payload should be a queryStringObject instead
				const queryStringObject = method == 'DELETE' ? payload : {}

				// Call the API
				app.client.request(
					undefined,
					path,
					method,
					queryStringObject,
					payload,
					(statusCode, responsePayload) => {
						// Display an error on the form if needed
						if (statusCode !== 200) {
							if (statusCode == 403) {
								// log the user out
								app.logUserOut()
							} else {
								// Try to get the error from the api, or set a default error message
								const error =
									typeof responsePayload.Error == 'string'
										? responsePayload.Error
										: 'An error has occured, please try again'

								// Set the formError field with the error text
								document.querySelector('#' + formId + ' .formError').innerHTML = formId.includes('addToCart') ? '❌' : error

								// Show (unhide) the form error field on the form
								document.querySelector('#' + formId + ' .formError').style.display = 'block'

								// Cart page specific
								if (formId == 'placeOrder') {
									// Hide payment form loader in case we got an error
									document.getElementById('activateLoader').style.display = 'none'
								}
							}
						} else {
							// If successful, send to form response processor
							app.formResponseProcessor(formId, payload, responsePayload)
						}
					}
				)
			})
		}
	}
}

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
	
	// If account creation was successful, try to immediately log the user in
	if (formId == 'accountCreate') {
		// Take the email and password, and use it to log the user in
		const newPayload = {
			email: requestPayload.email,
			password: requestPayload.password,
		}

		app.client.request(
			undefined,
			'api/tokens',
			'POST',
			undefined,
			newPayload,
			(newStatusCode, newResponsePayload) => {
				// Display an error on the form if needed
				if (newStatusCode !== 200) {
					// Set the formError field with the error text
					document.querySelector('#' + formId + ' .formError').innerHTML = 'Sorry, an error has occured. Please try again.'

					// Show (unhide) the form error field on the form
					document.querySelector('#' + formId + ' .formError').style.display = 'block'
				} else {
					// If successful, set the token and redirect the user
					app.setSessionToken(newResponsePayload)
					window.location = '/menu'
				}
			}
		)
	}

	// If login was successful, set the token in localstorage and redirect the user
	if (formId == 'sessionCreate') {
		app.setSessionToken(responsePayload)
		window.location = '/menu'
	}

	// If forms saved successfully and they have success messages, show them
	const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2']
	if (formsWithSuccessMessages.indexOf(formId) > -1 || formId.includes('addToCart')) {
		document.querySelector('#' + formId + ' .formSuccess').style.display ='block'
	}

	// If Cart Payment form is submited
	if (formId == 'placeOrder') {
		//window.location = '/checkout/success'

		// Hide payment form loader, activate success message and order confirmation box
		document.getElementById('activateLoader').style.display = 'none'
		document.getElementById('activateSuccessMessage').style.display = 'flex'
		document.getElementById('paymentConfirmationShow').style.display = 'flex'

		// Remove the delete buttons from the cart items to avoid api calls errors
		document.querySelectorAll('#deleteBtn').forEach(button => button.remove())

		// Show the payment confirmation details
		document.querySelector('[data-confirmation-order-id]').innerText = responsePayload.orderId
		document.querySelector('[data-confirmation-order-date]').innerText = responsePayload.orderDate
		document.querySelector('[data-confirmation-amount]').innerText = Number(responsePayload.orderTotal).toFixed(2)
		document.querySelector('[data-confirmation-payment-id]').innerText = responsePayload.stripePaymentId
		document.querySelector('[data-confirmation-payment-status]').innerText = responsePayload.stripePaymentStatus
		document.querySelector('[data-confirmation-street-address]').innerText = responsePayload.streetAddress
	}

	// If the user just deleted their account, redirect them to the account-delete page
	if (formId == 'accountEdit3') {
		app.logUserOut(false)
		window.location = '/account/deleted'
	}
}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = () => {
	const tokenString = localStorage.getItem('token')
	if (typeof tokenString == 'string') {
		try {
			const token = JSON.parse(tokenString)
			app.config.sessionToken = token
			if (typeof token == 'object') {
				app.setLoggedInClass(true)
			} else {
				app.setLoggedInClass(false)
			}
		} catch (e) {
			app.config.sessionToken = false
			app.setLoggedInClass(false)
		}
	}
}

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = (add) => {
	const target = document.querySelector('body')
	if (add) {
		target.classList.add('loggedIn')
	} else {
		target.classList.remove('loggedIn')
	}
}

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token) => {
	app.config.sessionToken = token
	const tokenString = JSON.stringify(token)
	localStorage.setItem('token', tokenString)
	if (typeof token == 'object') {
		app.setLoggedInClass(true)
	} else {
		app.setLoggedInClass(false)
	}
}

// Renew the token
app.renewToken = (callback) => {
	const currentToken = typeof app.config.sessionToken == 'object' ? app.config.sessionToken : false
	if (currentToken) {
		// Update the token with a new expiration
		const payload = {
			id: currentToken.id,
			extend: true,
		}
		app.client.request(
			undefined,
			'api/tokens',
			'PUT',
			undefined,
			payload,
			(statusCode, responsePayload) => {
				// Display an error on the form if needed
				if (statusCode == 200) {
					// Get the new token details
					const queryStringObject = { id: currentToken.id }
					app.client.request(
						undefined,
						'api/tokens',
						'GET',
						queryStringObject,
						undefined,
						(statusCode, responsePayload) => {
							// Display an error on the form if needed
							if (statusCode == 200) {
								app.setSessionToken(responsePayload)
								callback(false)
							} else {
								app.setSessionToken(false)
								callback(true)
							}
						}
					)
				} else {
					app.setSessionToken(false)
					callback(true)
				}
			}
		)
	} else {
		app.setSessionToken(false)
		callback(true)
	}
}

// Load data on the page
app.loadDataOnPage = () => {
	// Get the current page from the body class
	const bodyClasses = document.querySelector('body').classList
	const primaryClass = typeof bodyClasses[0] == 'string' ? bodyClasses[0] : false

	// Logic for account settings page
	if (primaryClass == 'accountEdit') {
		app.loadAccountEditPage()
	}

	// Logic for menu page
	if (primaryClass == 'menutView') {
		app.loadMenutPage()
	}

	// Logic for cart page
	if (primaryClass == 'cartView') {
		app.loadShoppingCartPage()
	}

	// Logic for orders page
	if (primaryClass == 'ordersView') {
		app.loadOrderstPage()
	}
}

// Load the account edit page specifically
app.loadAccountEditPage = () => {
	// Get the email from the current token, or log the user out if none is there
	const email =
		typeof app.config.sessionToken.email == 'string'
			? app.config.sessionToken.email
			: false
	if (email) {
		// Fetch the user data
		const queryStringObject = {
			email: email,
		}
		app.client.request(
			undefined,
			'api/users',
			'GET',
			queryStringObject,
			undefined,
			(statusCode, responsePayload) => {
				if (statusCode == 200) {
					// Put the data into the forms as values where needed
					document.querySelector('#accountEdit1 .firstNameInput').value =
						responsePayload.firstName
					document.querySelector('#accountEdit1 .lastNameInput').value =
						responsePayload.lastName
					document.querySelector('#accountEdit1 .streetAddressInput').value =
						responsePayload.streetAddress
					document.querySelector('#accountEdit1 .displayEmailInput').value =
						responsePayload.email

					// Put the hidden email field into both forms
					const hiddenEmailInputs = document.querySelectorAll('input.hiddenEmailInput')
					for (let i = 0; i < hiddenEmailInputs.length; i++) {
						hiddenEmailInputs[i].value = responsePayload.email
					}
				} else {
					// If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
					app.logUserOut()
				}
			}
		)
	} else {
		app.logUserOut()
	}
}

// Load the menu page specifically
app.loadMenutPage = () => {
	// Get the email from the current token, or log the user out if none is there
	const email =
		typeof app.config.sessionToken.email == 'string'
			? app.config.sessionToken.email
			: false
	
	// Protected page, user must be logged in to view this page, otherwise logout user
	if (!email) {
		app.logUserOut()
	}
}

// Load the shopping cart page specifically
app.loadShoppingCartPage = () => {
	// Get the email from the current token, or log the user out if none is there
	const email =
		typeof app.config.sessionToken.email == 'string'
			? app.config.sessionToken.email
			: false

	// Protected page, user must be logged in to view this page, otherwise logout user
	if (email) {
		app.client.request(undefined, 'api/cart', 'GET', undefined, undefined, (statusCode, responsePayload) => {
				if (statusCode == 200) {

					// Determine if the menu has content
					const cartArr =
						typeof responsePayload == 'object' &&
						responsePayload instanceof Array &&
						responsePayload.length > 0
							? responsePayload
							: []

					if (cartArr.length > 0) {
						// Activate the cart details pane
						document.getElementById('checkoutDetailsShow').style.display = 'flex'

						// Listen for payment submit form and activate the loader
						const paymentBtn = document.getElementById('paymentBtn')
						paymentBtn.addEventListener('click', e => {
							document.getElementById('activateLoader').style.display = 'flex'
						})
						
						// Total items & amount selectors
						const totalItems = document.querySelector('[data-cart-total-items]')
						const totalAmount = document.querySelector('[data-cart-total-amount]')
						const deliverTo = document.querySelector('[data-cart-delivery-address]')

						// Show each items in the user's cart loop
						cartArr.forEach((cart, pos) => {

							// Items container & template selectors
							const cartItemsContainer = document.querySelector('[data-cart-items]')
							const cartItemsTemplate = document.getElementById('cartItemsTemplate')
							const cartItemElem = document.importNode(cartItemsTemplate.content, true)
							const itemImage = cartItemElem.querySelector('img')
							const itemName = cartItemElem.getElementById('itemName')
							const sizeOption = cartItemElem.getElementById('sizeOption')
							const price = cartItemElem.getElementById('price')
							const quantity = cartItemElem.getElementById('quantity')
							const deleteBtn = cartItemElem.getElementById('deleteBtn')

							if (pos == 0) {
								totalItems.innerText = cart.itemsTotal
								totalAmount.innerText = Number(cart.cartTotal).toFixed(2)
								deliverTo.innerText = cart.streetAddress
							} else {
								itemImage.src = cart.imageSrc
								itemImage.alt = cart.itemName
								itemName.innerText = cart.itemName
								sizeOption.innerText = cart.sizeOption
								price.innerText = cart.price
								quantity.innerText = cart.quantity

								// Add a click listener to delete the current items
								deleteBtn.addEventListener('click', e => {
									e.preventDefault()

									const queryString = {
										cartItmeId: cart.cartItmeId
									}

									app.client.request(
										undefined,
										'api/cart',
										'DELETE',
										queryString,
										undefined,
										(statusCode, responsePayload) => {
											// Reload the page to apply changes or log error
											if (statusCode == 200) {
												window.location = '/cart'
											} else {
												console.log(responsePayload)
											}
										}
									)
								})

								// Render each cart item template
								cartItemsContainer.appendChild(cartItemElem)
							}
						})

					} else {
						// Show 'cart empty' message
						document.getElementById('cartIsEmpty').style.display = 'flex'
					}
				} else {
					// If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
					app.logUserOut()
				}
			}
		)
	} else {
		app.logUserOut()
	}
}

// Load the orders page specifically
app.loadOrderstPage = () => {
	// Get the email from the current token, or log the user out if none is there
	const email =
		typeof app.config.sessionToken.email == 'string'
			? app.config.sessionToken.email
			: false

	// Protected page, user must be logged in to view this page, otherwise logout user
	if (email) {
		app.client.request(undefined, 'api/orders', 'GET', undefined, undefined, (statusCode, responsePayload) => {
				if (statusCode == 200) {

					// Determine if the menu has content
					const ordersArr =
						typeof responsePayload == 'object' &&
						responsePayload instanceof Array &&
						responsePayload.length > 0
							? responsePayload
							: []

					if (ordersArr.length > 0) {

						// Activate the orders List
						document.getElementById('showOrdersList').style.display = 'block'

						// Orders summary selectors
						const totalOrdersPlaced = document.querySelector('[data-orders-total-placed]')
						const totalAmountSpent = document.querySelector('[data-orders-total-amount]')
						const currency = document.querySelector('[data-orders-currency]')

						// Orders container & template selectors
						const ordersListContainer = document.querySelector('[data-orders-list]')

						const orderItemOuterHtml = (data, innerHtmlString) => {
							const html = `
								<div class="order">
									<h2>Order</h2>
									<p class="date">${data.orderDate}</p>
									<p class="orderIdNum">${data.orderId}</p>
									${innerHtmlString}
									<h3>Order Total: $${Number(data.orderTotal).toFixed(2)}</h3>
								</div>`;
							return html
						}

						const orderItemInnerHtml = (data) => {
							const html = `
								<div class="orderItems">
									<div class="image">
										<img src="${data.imageSrc}" alt="${data.itemName}">
									</div>
									<div class="itemInfo">
										<h3>${data.itemName}</h3>
										<p>Size: ${data.sizeOption}</p>
										<p><small>$</small>${Number(data.unitPrice).toFixed(2)} <small>each</small></p>
										<p>Qty: ${data.quantity}</p>
									</div>
								</div>`;
							return html
						}

						// Show each items in the user's order history
						ordersArr.forEach((orders, pos) => {

							if (pos == 0) {
								totalOrdersPlaced.innerText = orders.totalOrdersPlaced
								totalAmountSpent.innerText = Number(orders.totalAmountSpent).toFixed(2)
								currency.innerText = orders.currency
							} else {

								let innerHtml = ''

								if (orders.itemsPurchased.length > 0) {
									// itemsPurchased loop
									orders.itemsPurchased.forEach(item => {
										innerHtml += orderItemInnerHtml(item)
									})
								}

								let combinedHtml = orderItemOuterHtml(orders, innerHtml)

								// Render each order template
								ordersListContainer.insertAdjacentHTML('beforeend', combinedHtml)
							}
						})

					} else {
						// Show 'cart empty' message
						document.getElementById('ordersIsEmpty').style.display = 'flex'
					}
				} else {
					// If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
					app.logUserOut()
				}
			}
		)
	} else {
		app.logUserOut()
	}
}

// Loop to renew token every hour
app.tokenRenewalLoop = () => {
	setInterval(() => {
		app.renewToken((err) => {
			if (!err) {
				console.log('Token renewed successfully @ ' + Date.now())
			}
		})
	}, 1000 * 60)
}

// Init (bootstrapping)
app.init = () => {
	// Bind all form submissions
	app.bindForms()

	// Bind logout logout button
	app.bindLogoutButton()

	// Get the token from localstorage
	app.getSessionToken()

	// Renew token
	app.tokenRenewalLoop()

	// Load data on page
	app.loadDataOnPage()
}

// Call the init processes after the window loads
window.onload = () => {
	app.init()
}
