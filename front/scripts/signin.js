import api from "./apiHelper.js";
const signin1 = document.querySelector("#signin1");
const signin2 = document.querySelector("#signin2");
const signin3 = document.querySelector("#signin3");

function validarSenhar(senha) {
    return (
        senha.length >= 10 &&
        /[a-zA-Z]/.test(senha) &&
        /\d/.test(senha) &&
        /[*;#]/.test(senha) &&
        !/[^a-zA-Z0-9*;#]/.test(senha)
    );
}

function validarNome(nome) { 
    if (nome.length <= 3 || nome.length > 50) {
        return false;
    }
    return true;
}

function validarEmail(email) {
    return /^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/.test(email);
}

function validarCep(cep) {
    return /^\d{5}-\d{3}$/.test(cep);
}

function validarEndereco(endereco) {
    return endereco.length > 3;
}

function validarCidade(cidade) {
    return cidade.length > 2;
}

function validarEstado(estado) {
    return estado.length == 2;
}

document.querySelector("#cep").addEventListener("input", e => {
  e.target.value = e.target.value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2");
});

document.querySelector("#cep").addEventListener("blur", async e => {
    const cepLimpo = e.target.value.replace(/\D/g, "");

    if(cepLimpo.length !== 8) {
        return;
    }

    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();

    document.querySelector("#endereco").value = data.logradouro || "";
    document.querySelector("#cidade").value = data.localidade || "";
    document.querySelector("#estado").value = data.uf || "";
});

let newUser = {};

// mostra primeira etapa
signin1.style.display = "flex";

signin1.addEventListener("submit", e => {
    e.preventDefault();

    if(validarNome(document.querySelector("#text").value) === false) {
        alert("Nome inválido! O nome deve conter entre 4 e 50 letras.");
        return;
    } else {
        newUser.nome = document.querySelector("#text").value;
    }

    if(validarEmail(document.querySelector("#email").value) === false) {
        alert("Email inválido!");
        return;
    } else {
        newUser.email = document.querySelector("#email").value;
    }

    // mostra segunda etapa
    signin1.style.display = "none";
    signin2.style.display = "flex";
})

signin2.addEventListener("submit", e => {
    e.preventDefault();

    if(validarCep(document.querySelector("#cep").value) === false) {
        alert("CEP inválido! O CEP deve conter 8 dígitos.");
        return;
    } else {
        newUser.cep = document.querySelector("#cep").value;
    }

    if(validarEndereco(document.querySelector("#endereco").value) === false) {
        alert("Endereço inválido! O endereço deve conter no mínimo 4 caracteres.");
        return;
    } else {
        newUser.endereco = document.querySelector("#endereco").value;
    }

    if(validarCidade(document.querySelector("#cidade").value) === false) {
        alert("Cidade inválida! A cidade deve conter no mínimo 3 caracteres.");
        return;
    } else {
        newUser.cidade = document.querySelector("#cidade").value;
    }

    if(validarEstado(document.querySelector("#estado").value) === false) {
        alert("Estado inválido! O estado deve conter 2 caracteres.");
        return;
    } else {
        newUser.estado = document.querySelector("#estado").value;
    }

    // mostra terceira etapa
    signin2.style.display = "none";
    signin3.style.display = "flex";
})


signin3.addEventListener("submit", async e => {
    e.preventDefault();

    newUser.senha = document.querySelector("#senha").value;
    const confirmarSenha = document.querySelector("#confirmarSenha").value;

    if (newUser.senha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
    } else {
        if(!validarSenhar(newUser.senha)) {
            alert("Senha fraca! A senha deve ter no mínimo 10 caracteres, incluindo letras, números e pelo menos um dos seguintes caracteres especiais: * ; #");
            return;
        } else {
            try {
                await api.post("/cadastrar_usuario", newUser);

                alert("Cadastro realizado com sucesso!");
                window.location = "index.html";

            } catch (err) {
                if (err.data.erros) {
                    const erros = err.data.erros.join("\n");

                    if(erros.includes("E-mail já cadastrado") || erros.includes("Nome inválido.")) {
                        alert(erros);
                        // volta para a primeira etapa
                        signin3.style.display = "none";
                        signin2.style.display = "none";
                        signin1.style.display = "flex";
                    }

                    if(erros.includes("CEP inválido")) {
                        alert(erros);
                        // volta para a segunda etapa
                        signin3.style.display = "none";
                        signin2.style.display = "flex";

                        document.querySelector("#cep").focus();
                    }
                } else if (err.data.erro) {
                    alert(err.data.erro);
                    const erro = err.data.erro;

                    if(erro.includes("E-mail já cadastrado") || erro.includes("Nome inválido.")) {
                        alert(erro);
                        // volta para a primeira etapa
                        signin3.style.display = "none";
                        signin2.style.display = "none";
                        signin1.style.display = "flex";
                    }

                    if(erro.includes("CEP inválido")) {
                        alert(erro);
                        // volta para a segunda etapa
                        signin3.style.display = "none";
                        signin2.style.display = "flex";

                        document.querySelector("#cep").focus();
                    }
                } else {
                    alert("Erro inesperado");
                }
            }
        }
    }
})