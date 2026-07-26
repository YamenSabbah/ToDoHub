async function checkAuth(redirectUrl) {
    redirectUrl = redirectUrl || '/pages/login.html';
    const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: '{ getUser { id } }' })
    });
    const result = await res.json();
    if (result.errors || !result.data) {
        window.location.href = redirectUrl;
    }
}
