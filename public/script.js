document.addEventListener("DOMContentLoaded", function () {
    const linkForm = document.getElementById("linkForm");

    linkForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const urlInput = document.getElementById("url");
        const linkInput = document.getElementById("link");
        const responseArea = document.getElementById("responseArea");


        let url = urlInput.value;
        let link = linkInput.value;

        if (link == "") {
            link = null;
        }



        fetch("/api/newlink", {
            method: "POST",
            body: JSON.stringify({ url, link }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data:", data);

                responseArea.innerHTML='<h3>The Shorten Link:</h3><h3>https://shortlink.linyit.net/'+data.link+'</h3>'
                urlInput.value = "";
                linkInput.value = "";
            })
            .catch((error) => {
                console.error("Error:", error);

                alert("Error:", error);
            });
    });
});
