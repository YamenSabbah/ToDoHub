document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Show loading spinner
  const btn = document.getElementById("registerBtn");
  const btnText = document.getElementById("registerBtnText");
  const btnSpinner = document.getElementById("registerBtnSpinner");
  btn.disabled = true;
  btnText.textContent = "Creating account...";
  btnSpinner.classList.remove("d-none");

  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation Register($name: String!, $email: String!, $password: String!) {
          register(name: $name, email: $email, password: $password) {
            user {
              username
              email
            }
          }
        }
      `,
      variables: {
        name: username,
        email: email,
        password: password,
      },
    }),
  });
  const result = await res.json();
  // Hide loading spinner
  btn.disabled = false;
  btnText.textContent = "Create Account";
  btnSpinner.classList.add("d-none");

  if (result.errors) {
    const error = document.querySelector(".email-error");
    error.classList.remove("d-none");
    error.textContent = "User Already Exists"
  }
  else {
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    toast.show();
    document.querySelector('form').reset();
    document.querySelectorAll('.is-valid, .is-invalid').forEach(function(el) {
      el.classList.remove('is-valid', 'is-invalid');
    });
  }
});
