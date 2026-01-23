import api from "./apiHelper.js";

const list = document.querySelector(".requestsList");

const pedidos = await api.get("/amizade/pedidos");

if (pedidos.length === 0) {
  list.innerHTML = "<p>Nenhum pedido de amizade pendente</p>";
}

pedidos.forEach(p => {
  const item = document.createElement("div");
  item.classList.add("requestItem");

  item.innerHTML = `
    <div class="requestInfo">
      <img src="${p.foto ? `http://localhost:5000/${p.foto}` : 'assets/account-circle.png'}">
      <div>
        <strong>${p.nome}</strong>
        <p>${p.email}</p>
      </div>
      ACEITAR?
    </div>
    <div class="requestActions">
      <img src="assets/check.svg" class="accept">
      <img src="assets/close.svg" class="reject">
    </div>
  `;

  item.querySelector(".accept").addEventListener("click", async () => {
    await api.post(`/amizade/aceitar/${p.pedidoId}`);
    item.remove();
    window.location.reload();
  });

  item.querySelector(".reject").addEventListener("click", async () => {
    await api.post(`/amizade/recusar/${p.pedidoId}`);
    item.remove();
  });

  list.appendChild(item);
});
