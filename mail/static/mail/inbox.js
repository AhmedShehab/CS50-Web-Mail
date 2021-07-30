document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
	document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
	document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
	document.querySelector("#compose").addEventListener("click", compose_email);

	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#view-email").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";

	// Wait for compose form to be submitted
	document.querySelector("#compose-form").onsubmit = () => {
		var recipients = document.querySelector("#compose-recipients").value;
		var subject = document.querySelector("#compose-subject").value;
		var body = document.querySelector("#compose-body").value;
		fetch("/emails", {
			method: "POST",
			body: JSON.stringify({
				recipients: recipients,
				subject: subject,
				body: body,
			}),
		})
			.then((response) => response.json())
			.then((data) => console.log(data));
		return false;
	};
}

function view_email() {
	// Shows the emails and hides the other views
	document.querySelector("#email-views").style.display = "none";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#view-email").style.display = "block";
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#view-email").style.display = "none";

	// Show the mailbox name
	document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	if (mailbox == "inbox") {
		fetch("emails/inbox")
			.then((response) => response.json())
			.then((data) => {
				data.forEach((element) => {
					// Creating an div containing each email
					var div = document.createElement("div");
					div.innerHTML = `<span><h6>${element.sender}</h6></span> <span class="email-body">${element.body}</span> <span class="archive"><button id='${element.id}' class="archive-button">Archive</button></span>`;
					document.querySelector("#emails-view").append(div);

					// Adding to read list if pressed on the email div
					div.addEventListener("click", () => {
						fetch(`emails/${element.id}`, {
							method: "PUT",
							body: JSON.stringify({
								read: true,
							}),
						});

						// Chaging background color for read emails
						div.className = "read-email";
					});

					// Archive button to add an email to archived
					document.getElementById(`${element.id}`).addEventListener("click", () => {
						fetch(`/emails/${element.id}`, {
							method: "PUT",
							body: JSON.stringify({
								archived: true,
							}),
						});

						// Removing the email form inbox after adding to archived
						div.remove();
					});
				});
			});
	} else if (mailbox == "sent") {
		fetch("emails/sent")
			.then((response) => response.json())
			.then((data) => {
				data.forEach((element) => {
					var div = document.createElement("div");
					div.innerHTML = `<span><h6>${element.sender}</h6></span> <span> ${element.body}</span>`;
					div.addEventListener("click", () => {});
					document.querySelector("#emails-view").append(div);
				});
			});
	} else {
		fetch("emails/archive")
			.then((response) => response.json())
			.then((data) => {
				data.forEach((element) => {
					var div = document.createElement("div");
					div.innerHTML = `<span><h6>${element.sender}</h6></span> <span> ${element.body}</span>`;
					div.addEventListener("click", () => {});
					document.querySelector("#emails-view").append(div);
				});
			});
	}
}
