const token = getCookie('token');
if (!token) {
    window.location.href = "login"; // Giriş sayfasının adını buraya yazın
}
function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}



///Ad Değiştirme///

const changeUsernameForm = document.getElementById('change-username-form');
changeUsernameForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const newUsername = document.getElementById('new-username').value;

    try {
        const response = await fetch('http://localhost/api/newname', {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newName: newUsername })
        });

        if (response.ok) {
            // Başarılı işlem sonrası gerekli aksiyonları burada yapabilirsiniz
            //       alert('Username changed successfully!');
            location.reload();

        } else {
            console.error('API Error:', response.status);
            alert('An error occurred. Please try again later.');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('An error occurred. Please try again later.');
    }
});



///Mail Değiştirme///

const changeEmailForm = document.getElementById('change-email-form');
changeEmailForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const newEmail = document.getElementById('new-email').value;

    try {
        const response = await fetch('http://localhost/api/newmail', {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newMail: newEmail })
        });

        if (response.ok) {
            // Başarılı işlem sonrası gerekli aksiyonları burada yapabilirsiniz
            //          alert('Email changed successfully!');
            location.reload();

        } else {
            console.error('API Error:', response.status);
            alert('An error occurred. Please try again later.');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
///Mail Değiştirme///

const changeTelForm = document.getElementById('change-tel-form');
changeTelForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const newtel = document.getElementById('new-tel').value;

    try {
        const response = await fetch('http://localhost/api/newtel', {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newTel: newtel })
        });

        if (response.ok) {
            // Başarılı işlem sonrası gerekli aksiyonları burada yapabilirsiniz
            //            alert('tel changed successfully!');
            location.reload();

        } else {
            console.error('API Error:', response.status);
            alert('An error occurred. Please try again later.');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('An error occurred. Please try again later.');
    }
});

///Link Ekelme///

const addLinkForm = document.getElementById('add-link-form');
addLinkForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const newLinkName = document.getElementById('new-link-name').value;
    const newLink = document.getElementById('new-link').value;

    try {
        const response = await fetch('http://localhost/api/addlink', {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newLinkName: newLinkName, newLink: newLink })
        });

        if (response.ok) {
            // Başarılı işlem sonrası gerekli aksiyonları burada yapabilirsiniz
            //             alert('Link added successfully!');
            location.reload();

        } else {
            console.error('API Error:', response.status);
            alert('An error occurred. Please try again later.');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('An error occurred. Please try again later.');
    }
});