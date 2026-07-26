document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch("/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            query: `
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        user {
                            username
                            email
                        }
                    }
                }
            `,
            variables: {
                email: email,
                password: password,
            },
        }),
    });
    const result = await res.json();
    if (result.errors) {
        const error = document.querySelector(".email-error");
        error.classList.remove("d-none");
        error.textContent = "Invalid email or password"
    }
    else {
    
        console.log(result.data.login)
        document.querySelector('form').reset();
        document.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
            el.classList.remove('is-valid', 'is-invalid');
        });
        showToast();
        function showToast() {
            const toast = new bootstrap.Toast(document.getElementById('successToast'));
            toast.show();
            setTimeout(() => {
                toast.hide();
                window.location.href = "/pages/dashboard.html";
            }, 1500);
        }

    }
});