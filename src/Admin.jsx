import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function Admin() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

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
      console.error("Erro ao carregar agendamentos:", error);
      alert("Erro ao carregar agendamentos");
    } finally {
      setCarregando(false);
    }
  };

  const excluirAgendamento = async (id) => {
    const confirmar = window.confirm("Deseja excluir este agendamento?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "citas", id));
      setAgendamentos((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir agendamento");
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: "24px"
        }}
      >
        <h1 style={{ marginBottom: "8px", color: "#111" }}>
          Painel Admin - Mundo Ancestral
        </h1>

        <p style={{ color: "#666", marginBottom: "24px" }}>
          Gerencie seus agendamentos
        </p>

        {carregando ? (
          <p>Carregando agendamentos...</p>
        ) : agendamentos.length === 0 ? (
          <p>Nenhum agendamento encontrado.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left"
              }}
            >
              <thead>
                <tr style={{ background: "#111", color: "#fff" }}>
                  <th style={{ padding: "12px" }}>Nome</th>
                  <th style={{ padding: "12px" }}>Consulta</th>
                  <th style={{ padding: "12px" }}>Data</th>
                  <th style={{ padding: "12px" }}>Hora</th>
                  <th style={{ padding: "12px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{item.nome}</td>
                    <td style={{ padding: "12px" }}>{item.tipo}</td>
                    <td style={{ padding: "12px" }}>{item.fecha}</td>
                    <td style={{ padding: "12px" }}>{item.hora}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => excluirAgendamento(item.id)}
                        style={{
                          background: "#c62828",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          cursor: "pointer"
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}