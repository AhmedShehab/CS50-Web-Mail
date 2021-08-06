document.addEventListener('DOMContentLoaded', function () {
	// Use buttons to toggle between views
	document
		.querySelector('#inbox')
		.addEventListener('click', () => load_mailbox('inbox'));
	document
		.querySelector('#sent')
		.addEventListener('click', () => load_mailbox('sent'));
	document
		.querySelector('#archived')
		.addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// By default, load the inbox
	load_mailbox('inbox');
});

function compose_email(reply, data) {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#view-email').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	if (reply == 'true') {
		document.querySelector('#compose-recipients').value = `${data.sender}`;
		document.querySelector(
			'#compose-body'
		).value = `"On ${data.timestamp} ${data.sender} wrote: ${data.body}"`;
		if (data.subject.substring(0, 3) === 'Re:') {
			console.log('true');
			document.querySelector(
				'#compose-subject'
			).value = `${data.subject}`;
		} else {
			document.querySelector(
				'#compose-subject'
			).value = `Re: ${data.subject}`;
		}
	} else {
		// Clear out composition fields if the email is not a reply
		document.querySelector('#compose-recipients').value = '';
		document.querySelector('#compose-subject').value = '';
		document.querySelector('#compose-body').value = '';
	}

	// Wait for compose form to be submitted
	document.querySelector('#compose-form').onsubmit = () => {
		var recipients = document.querySelector('#compose-recipients').value;
		var subject = document.querySelector('#compose-subject').value;
		var body = document.querySelector('#compose-body').value;
		fetch('/emails', {
			method: 'POST',
			body: JSON.stringify({
				recipients: recipients,
				subject: subject,
				body: body,
			}),
		})
			.then(response => response.json())
			.then(data => console.log(data));
			load_mailbox('inbox')
			return false;
		};
}

function view_email(emailId) {
	// Shows the emails and hides the other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#view-email').style.display = 'block';

	// Get the email header divs
	from = document.querySelector('#from');
	to = document.querySelector('#to');
	subject = document.querySelector('#subject');
	date = document.querySelector('#date');
	body = document.querySelector('#body');
	reply = document.querySelector('#reply');

	// Request email data and append them to the email view
	fetch(`/emails/${emailId}`)
		.then(response => response.json())
		.then(data => {
			from.innerHTML = `<small>${data.sender}</small>`;
			to.innerHTML = `<small>${data.recipients}</small>`;
			subject.innerHTML = `<small>${data.subject}</small>`;
			date.innerHTML = `<small>${data.timestamp}</small>`;
			body.innerHTML = `<small>${data.body}</small>`;
			reply.value = `${data.id}`;
			reply.addEventListener('click', () => {
				compose_email('true', data);
			});
		});
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#view-email').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;
	if (mailbox == 'inbox') {
		fetch('emails/inbox')
			.then(response => response.json())
			.then(data => {
				data.forEach(element => {
					// Creating an div containing each email
					var div = document.createElement('div');
					var emailSpan = document.createElement('span');
					var archiveSpan = document.createElement('span');
					emailSpan.className = 'emailSpan';
					archiveSpan.innerHTML =
						'<button class ="archive-button">Archive</button>';
					archiveSpan.className = 'archiveSpan';
					if (element.read === true) {
						emailSpan.innerHTML = `<span><h6>${element.sender}</h6></span> <span class="email-body">${element.body}</span>`;
						div.className = 'read-email';
					} else {
						emailSpan.innerHTML = `<span><h6>${element.sender}</h6></span> <span class="email-body">${element.body}</span>`;
					}
					div.append(emailSpan);
					div.append(archiveSpan);
					document.querySelector('#emails-view').append(div);

					emailSpan.addEventListener('click', () => {
						// Adding to read list if pressed on the email span
						fetch(`emails/${element.id}`, {
							method: 'PUT',
							body: JSON.stringify({
								read: true,
							}),
						});

						// Take to the view mail view
						view_email(element.id);
					});

					// Archive button to add an email to archived
					archiveSpan.addEventListener('click', () => {
						fetch(`/emails/${element.id}`, {
							method: 'PUT',
							body: JSON.stringify({
								archived: true,
							}),
						});

						// Removing the email form inbox after adding to archived
						div.remove();
					});
				});
			});
	} else if (mailbox == 'sent') {
		fetch('emails/sent')
			.then(response => response.json())
			.then(data => {
				data.forEach(element => {
					var div = document.createElement('div');
					div.innerHTML = `<span><h6>${element.sender}</h6></span> <span> ${element.body}</span>`;
					div.addEventListener('click', () => {});
					document.querySelector('#emails-view').append(div);
				});
			});
	} else {
		fetch('emails/archive')
			.then(response => response.json())
			.then(data => {
				data.forEach(element => {
					var div = document.createElement('div');
					var emailSpan = document.createElement('span');
					var archiveSpan = document.createElement('span');
					emailSpan.innerHTML = `<span><h6>${element.sender}</h6></span> <span> ${element.body}</span>`;
					emailSpan.className = 'emailSpan';
					archiveSpan.innerHTML =
						'<button class ="archive-button">Unarchive</button>';
					archiveSpan.className = 'archiveSpan';
					div.append(emailSpan);
					div.append(archiveSpan);

					// Open the email in read mode
					emailSpan.addEventListener('click', () => {
						view_email(element.id);
					});

					// Remove email from archived mails
					archiveSpan.addEventListener('click', () => {
						fetch(`/emails/${element.id}`, {
							method: 'PUT',
							body: JSON.stringify({
								archived: false,
							}),
						});
						div.remove();
						load_mailbox('inbox');
					});
					document.querySelector('#emails-view').append(div);
				});
			});
	}
}
