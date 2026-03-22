import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function Admin() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // 🔐 LOGIN
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");

  const SENHA_CORRETA = "290280"; // 🔥 CAMBIA ESTO

  const entrar = () => {
    if (senha === SENHA_CORRETA) {
      setLogado(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const q = query(collection(db, "citas"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const lista = querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      setAgendamentos(lista);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setCarregando(false);
    }
  };

  const excluirAgendamento = async (id) => {
    const confirmar = window.confirm("Excluir este agendamento?");
    if (!confirmar) return;

    await deleteDoc(doc(db, "citas", id));
    setAgendamentos((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (logado) {
      carregarAgendamentos();
    }
  }, [logado]);

  // 🔐 TELA DE LOGIN
  if (!logado) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5"
      }}>
        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h2>Painel Admin</h2>

          <input
            type="password"
            placeholder="Digite a senha"
            onChange={(e) => setSenha(e.target.value)}
            style={{
              padding: "10px",
              marginTop: "10px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={entrar}
            style={{
              marginTop: "15px",
              padding: "10px",
              width: "100%",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "8px"
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // 🧿 PANEL NORMAL
  return (
    <div style={{ padding: "20px" }}>
      <h1>Painel Admin</h1>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.tipo}</td>
                <td>{item.fecha}</td>
                <td>{item.hora}</td>
                <td>
                  <button onClick={() => excluirAgendamento(item.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}