import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function App() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);

  const telefone = "5519999692649";

  const precos = {
    presencial: 600,
    online: 300
  };

  const horarios = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00"
  ];

  const enviarWhatsApp = async () => {
    if (!nome || !tipo || !hora) {
      alert("Preencha todos os campos");
      return;
    }

    setEnviando(true);

    const mensagem = `Olá, já realizei o pagamento via PIX.

Nome: ${nome}
Tipo: ${tipo}
Data: ${fecha.toLocaleDateString()}
Hora: ${hora}

Estou enviando o comprovante agora.`;

    const urlWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    try {
      await addDoc(collection(db, "citas"), {
        nome,
        tipo,
        fecha: fecha.toLocaleDateString(),
        hora,
        createdAt: new Date().toISOString()
      });

      // Redirección directa: más confiable que window.open en producción
      window.location.href = urlWhatsApp;
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);

      // Igual permite abrir WhatsApp aunque Firebase falle
      alert("Não foi possível salvar no Firebase, mas você será redirecionado ao WhatsApp.");
      window.location.href = urlWhatsApp;
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          width: "350px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "5px",
            color: "#000"
          }}
        >
          Mundo Ancestral
        </h1>

        <p style={{ color: "#666", marginBottom: "20px" }}>
          Agendamento espiritual
        </p>

        <input
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        >
          <option value="">Selecione a consulta</option>
          <option value="presencial">Presencial - R$ 600</option>
          <option value="online">Online - R$ 300</option>
        </select>

        <div style={{ marginBottom: "15px" }}>
          <DatePicker
            selected={fecha}
            onChange={(date) => setFecha(date)}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            className="input"
          />
        </div>

        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        >
          <option value="">Horários disponíveis</option>
          {horarios.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>

        {tipo && hora && (
          <div
            style={{
              background: "#fafafa",
              padding: "15px",
              borderRadius: "10px",
              marginTop: "10px"
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Pagamento via PIX</h3>
            <p style={{ fontSize: "14px" }}>Chave: sefirxd18@gmail.com</p>
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Valor: R$ {precos[tipo]}
            </p>

            <button
              onClick={enviarWhatsApp}
              disabled={enviando}
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background: enviando ? "#666" : "#000",
                color: "#fff",
                fontWeight: "bold",
                cursor: enviando ? "not-allowed" : "pointer"
              }}
            >
              {enviando ? "Enviando..." : "Enviar comprovante"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}