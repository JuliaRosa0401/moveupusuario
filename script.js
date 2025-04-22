const baseUrl = "https://api-catraca-weld.vercel.app";
const aleatorio = "/alunos/lista";

const input = document.getElementById("cpfInput");
const buttons = document.querySelectorAll(".btn-num");

// Digitação pelo teclado virtual
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    let current = input.value.replace(/\D/g, "");
    if (current.length < 11) {
      current += btn.textContent;
      input.value = formatarCPF(current);
    }

    verificarCPFCompleto();
  });
});

// Formatar CPF: 000.000.000-00
function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')                 
    .replace(/(\d{3})(\d)/, '$1.$2')    
    .replace(/(\d{3})(\d)/, '$1.$2')    
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Verifica se CPF está completo e ativa efeito no botão
function verificarCPFCompleto() {
  const checkinBtn = document.querySelector(".btn-checkin");
  const cpfCompleto = input.value.replace(/\D/g, '').length === 11;

  if (cpfCompleto) {
    checkinBtn.classList.add("pronto");
  } else {
    checkinBtn.classList.remove("pronto");
  }
}

async function confirmar() {
  const cpfLimpo = input.value.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
    return;
  }

  const aluno = await buscarAlunoPorCpf(cpfLimpo);
  
  // Se não encontrar aluno, cair diretamente para mensagem de "não encontrado"
  if (!aluno || aluno.status === undefined) {
    mostrarResultado({
      nome: "Desconhecido",
      cpf: cpfLimpo,
      status: "não encontrado"
    });
  } else {
    mostrarResultado(aluno);
  }
}

function mostrarResultado(aluno) {
  const msg = document.getElementById("mensagemResultado");
  const box = document.getElementById("boxResultado");
  const resu = document.getElementById("msgresultado");

  document.getElementById("telaCpf").classList.add("hidden");
  document.getElementById("resultado").classList.remove("hidden");

  
  const status = aluno.status === true ? "ativo" : 
  aluno.status === false ? "bloqueado" : "não encontrado";

  switch (status) {
    case "ativo":
      msg.innerText = `Boa sorte ${aluno.nome}! Você é mais forte do que imagina`;
      box.className = "border-2 border-black rounded-xl p-10 text-center text-lg font-semibold mb-6 bg-green-100 text-green-800";
      resu.innerText = `${aluno.nome}, seu CPF: ${aluno.cpf} está Ativo`; 
      break;

    case "bloqueado":
      msg.innerText = `Bloqueado. Por favor, entre em contato com a administração.`;
      box.className = "border-2 border-black rounded-xl p-10 text-center text-lg font-semibold mb-6 bg-red-100 text-red-800";
      resu.innerText = `${aluno.nome}, seu CPF: ${aluno.cpf} está Bloqueado`; 
      break;

    case "não encontrado":
      default:
        msg.innerText = `CPF não cadastrado. Tente novamente.`;
        box.className = "border-2 border-black rounded-xl p-10 text-center text-lg font-semibold mb-6 bg-yellow-500 text-yellow-800";
        resu.innerText = `Você não está cadastrado. Entre em contato com a administração ou tente outro CPF.`; 
        break;
  }
}



function cancelar() {
  input.value = "";
  verificarCPFCompleto();
}

function backspace() {
  let numbersOnly = input.value.replace(/\D/g, '').slice(0, -1);
  input.value = formatarCPF(numbersOnly);
  verificarCPFCompleto();
}

function voltarParaInicio() {
  document.getElementById("resultado").classList.add("hidden");
  document.getElementById("telaCpf").classList.remove("hidden");
  cancelar();
}

async function buscarAlunoPorCpf(cpf) {
  try {
    const response = await fetch(`${baseUrl}${aleatorio}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar alunos");
    }
    const alunos = await response.json();

    const alunoEncontrado = alunos.find(aluno => aluno.cpf.replace(/\D/g, '') === cpf);

    if (alunoEncontrado) {
      return alunoEncontrado;
    } else {
      return {
        nome: "Desconhecido",
        cpf,
        status: "não encontrado"
      };
    }
  } catch (error) {
    console.error(error);
    return {
      nome: "Desconhecido",
      cpf,
      status: "não encontrado"
    };
  }
}
