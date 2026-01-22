import api from "./apiHelper.js";

api.get("/me").then(res => {
    document.querySelector("#userName").textContent = res.nome;
    document.querySelector(".userPic").src = 
        res.foto
            ? `http://localhost:5000/${res.foto}`
            : "assets/account-circle.png";
});

const fotoInput = document.querySelector("#fotoInput");

document.querySelector(".userProfilePic").addEventListener("click", () => {
    fotoInput.click();
})

fotoInput.addEventListener("change", async e => {
    const file = fotoInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
        const res = await fetch("http://localhost:5000/me/upload_foto", {
        method: "POST",
        headers: {
            Authorization: localStorage.getItem("token"),
        },
        body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw data;
        }

        // Atualiza a imagem na tela
        document.querySelector(".userProfilePic img").src = data.foto;

        alert("Foto atualizada com sucesso!");
    } catch (err) {
        console.error(err);
        alert(err.erro || "Erro ao enviar foto");
    }
});