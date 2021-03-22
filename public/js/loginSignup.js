//Login Form
$("#login").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val();
    const password = $("#password").val();

    //Validation to make sure inputs are not empty
    if (!email) return alert("Email is required");
    if (!password) return alert("Password is required");

    //Adding input values to object
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
            //Redirects to home page on success
            window.location.href = "/";
        } else if (response.status === "failed") {
            //Displays error on failure
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

    //Validation to make sure inputs are not empty
    if (!username) return alert("Username is required");
    if (!email) return alert("Email is required");
    if (!password) return alert("Password is required");

    //Adding input values to object
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
            //Redirects to home page on success
            window.location.href = "/";
        } else if (response.status === "failed") {
            //Displays error on failure
            alert(response.error);
        } else {
            alert("Something went wrong!");
        }
    })
})