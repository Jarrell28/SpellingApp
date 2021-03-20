//Login Form
$("#login").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val();
    const password = $("#password").val();

    if (!email) return alert("Email is required");
    if (!password) return alert("Password is required");

    const formData = {
        email,
        password
    }

    $.ajax({
        type: "POST",
        url: "/login",
        data: formData
    }).done(response => {
        if (response.status === "success") {
            window.location.href = "/";
        } else if (response.status === "failed") {
            alert(response.error);
        } else {
            alert("Something went wrong!");
        }
    })
})

//Signup Form

$("#signup").on("submit", function (e) {
    e.preventDefault();

    const username = $("#username").val();
    const email = $("#email").val();
    const password = $("#password").val();

    if (!username) return alert("Username is required");
    if (!email) return alert("Email is required");
    if (!password) return alert("Password is required");

    const formData = {
        username,
        email,
        password
    }

    $.ajax({
        type: "POST",
        url: "/signup",
        data: formData
    }).done(response => {
        if (response.status === "success") {
            window.location.href = "/";
        } else if (response.status === "failed") {
            alert(response.error);
        } else {
            alert("Something went wrong!");
        }
    })
})