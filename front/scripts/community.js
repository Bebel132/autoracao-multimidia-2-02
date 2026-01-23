import api from "./apiHelper.js";

const listContainer = document.querySelector(".communityList");

await api.get("/usuarios").then(res => {
    res.forEach(item => {
        const h1 = document.createElement("h1");
        h1.textContent = item.nome;

        const p = document.createElement("p");
        p.textContent = item.email;

        const img1 = document.createElement("img");
        img1.classList.add("profilePic");
        
        const img2 = document.createElement("img");
        img2.classList.add("add")

        img1.src = item.foto
            ? `http://localhost:5000/${item.foto}`
            : "assets/account-circle.png";
        img2.src = "assets/person-add.png";
        
        const communityItem = document.createElement("div");
        communityItem.classList.add("communityItem");

        const itemTexts = document.createElement("div");
        itemTexts.classList.add("itemTexts");

        communityItem.appendChild(img1);

        itemTexts.appendChild(h1);
        itemTexts.appendChild(p);

        communityItem.appendChild(itemTexts);
        communityItem.appendChild(img2);

        communityItem.dataset.userId = item.id;

        listContainer.appendChild(communityItem)
    });
});

document.querySelectorAll(".add").forEach(btn => {
  btn.addEventListener("click", async e => {
    const paraId = e.target.parentElement.dataset.userId;

    try {
      await api.post(`/amizade/pedir/${paraId}`);
      alert("Pedido de amizade enviado!");
      window.location.reload();
    } catch (err) {
      const codigo = err?.data?.codigo;

      if (codigo === "JA_SAO_AMIGOS") {
        alert("Vocês já são amigos 🙂");
      } else if (codigo === "PEDIDO_EXISTENTE") {
        alert("Já existe um pedido pendente");
      } else {
        alert(err?.data?.erro || "Erro ao enviar pedido");
      }
    }
  });
});
