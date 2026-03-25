import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

export default function App() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);

  const [testemunhos, setTestemunhos] = useState([]);
  const [nomeFeedback, setNomeFeedback] = useState("");
  const [servicoFeedback, setServicoFeedback] = useState("");
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [enviandoFeedback, setEnviandoFeedback] = useState(false);

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

  const fechaFormateada = fecha.toLocaleDateString("pt-BR");

  useEffect(() => {
    const carregarHorarios = async () => {
      try {
        const q = query(
          collection(db, "citas"),
          where("fecha", "==", fecha.toLocaleDateString("pt-BR"))
        );

        const snapshot = await getDocs(q);
        const ocupados = snapshot.docs.map((doc) => doc.data().hora);

        setHorariosOcupados(ocupados);

        if (ocupados.includes(hora)) {
          setHora("");
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };

    carregarHorarios();
  }, [fecha, hora]);

  useEffect(() => {
    const carregarTestemunhos = async () => {
      try {
        const q = query(
          collection(db, "testemunhos"),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setTestemunhos(lista);
      } catch (error) {
        console.error("Erro ao carregar testemunhos:", error);
      }
    };

    carregarTestemunhos();
  }, []);

  const horariosDisponiveis = horarios.filter(
    (item) => !horariosOcupados.includes(item)
  );

  const enviarWhatsApp = async () => {
    if (!nome || !tipo || !hora) {
      alert("Preencha todos os campos");
      return;
    }

    if (horariosOcupados.includes(hora)) {
      alert("Este horário já foi reservado. Escolha outro.");
      return;
    }

    if (enviando) return;

    setEnviando(true);

    const modalidade =
      tipo === "presencial" ? "Consulta Presencial" : "Consulta Online";

    const mensagem = `Olá, já realizei o pagamento via PIX.

Nome: ${nome}
Tipo de consulta: ${modalidade}
Data: ${fechaFormateada}
Hora: ${hora}

Estou enviando o comprovante agora.`;

    const urlWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    const whatsappTab = window.open("", "_blank");

    try {
      await addDoc(collection(db, "citas"), {
        nome,
        tipo,
        fecha: fechaFormateada,
        hora,
        createdAt: new Date().toISOString()
      });

      if (whatsappTab) {
        whatsappTab.location.href = urlWhatsApp;
      } else {
        window.location.href = urlWhatsApp;
      }
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      alert("Não foi possível salvar no sistema, mas o WhatsApp será aberto.");

      if (whatsappTab) {
        whatsappTab.location.href = urlWhatsApp;
      } else {
        window.location.href = urlWhatsApp;
      }
    } finally {
      setEnviando(false);
    }
  };

  const enviarFeedback = async () => {
    if (!nomeFeedback || !servicoFeedback || !mensagemFeedback) {
      alert("Preencha todos os campos do testemunho.");
      return;
    }

    if (enviandoFeedback) return;

    setEnviandoFeedback(true);

    try {
      const novo = {
        nome: nomeFeedback,
        servico: servicoFeedback,
        mensagem: mensagemFeedback,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "testemunhos"), novo);

      setTestemunhos((prev) => [
        { id: crypto.randomUUID(), ...novo },
        ...prev
      ].slice(0, 6));

      setNomeFeedback("");
      setServicoFeedback("");
      setMensagemFeedback("");

      alert("Seu testemunho foi enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar testemunho:", error);
      alert("Não foi possível enviar o testemunho.");
    } finally {
      setEnviandoFeedback(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #2a1a06 0%, #120d06 35%, #050505 100%)",
        color: "#f5e6c8",
        fontFamily: "Georgia, serif"
      }}
    >
      <section
        style={{
          padding: "60px 20px 30px",
          textAlign: "center",
          borderBottom: "1px solid rgba(212,175,55,0.18)"
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 18px",
              border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: "999px",
              color: "#d4af37",
              marginBottom: "20px",
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              background: "rgba(212,175,55,0.08)"
            }}
          >
            Consulta espiritual ancestral
          </div>

          <img
            src="/logo.png"
            alt="Logo El Eterno Briyumba Congo"
            style={{
              width: "180px",
              maxWidth: "90%",
              marginBottom: "22px",
              filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.45))"
            }}
          />

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 68px)",
              margin: "0 0 18px",
              color: "#f7e7b6",
              lineHeight: "1.05"
            }}
          >
            El Eterno Briyumba Congo
          </h1>

          <p
            style={{
              maxWidth: "850px",
              margin: "0 auto",
              color: "#d7c7a0",
              fontSize: "18px",
              lineHeight: "1.8"
            }}
          >
            Atendimentos espirituais com fundamento em{" "}
            <strong style={{ color: "#f2d47a" }}>Santería Afrocubana</strong> e{" "}
            <strong style={{ color: "#f2d47a" }}>Palo Mayombe</strong>, com
            orientação espiritual séria, leitura de caminhos, abertura espiritual
            e sabedoria ancestral.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            <a
              href="#agendamento"
              style={{
                background: "linear-gradient(135deg, #d4af37, #8b6a11)",
                color: "#111",
                padding: "14px 26px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 10px 30px rgba(212,175,55,0.25)"
              }}
            >
              Agendar consulta
            </a>

            <a
              href="#servicos"
              style={{
                border: "1px solid rgba(212,175,55,0.35)",
                color: "#f7e7b6",
                padding: "14px 26px",
                borderRadius: "10px",
                textDecoration: "none",
                background: "rgba(255,255,255,0.03)"
              }}
            >
              Conhecer serviços
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 20px 20px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px"
          }}
        >
          <div style={cardStyle}>
            <h2 style={cardTitle}>Trabalho espiritual com fundamento</h2>
            <p style={cardText}>
              Atendimento voltado para orientação espiritual, leitura de caminhos,
              equilíbrio energético e esclarecimento de situações da vida afetiva,
              profissional, familiar e espiritual.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitle}>Seriedade e respeito às tradições</h2>
            <p style={cardText}>
              Cada consulta é conduzida com responsabilidade, ética e profundo
              respeito às tradições ancestrais, preservando o valor espiritual de
              cada atendimento.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitle}>Atendimento presencial e online</h2>
            <p style={cardText}>
              Escolha a modalidade ideal para você e agende o melhor horário
              disponível de forma prática, rápida e segura.
            </p>
          </div>
        </div>
      </section>

      <section id="servicos" style={{ padding: "30px 20px 20px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "34px",
              color: "#f7e7b6",
              marginBottom: "30px"
            }}
          >
            Serviços Espirituais
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px"
            }}
          >
            <div style={serviceCard}>
              <h3 style={serviceTitle}>Limpezas Espirituais</h3>
              <p style={serviceText}>
                Trabalhos de limpeza energética para remover cargas negativas,
                abrir caminhos e equilibrar a vida espiritual.
              </p>
            </div>

            <div style={serviceCard}>
              <h3 style={serviceTitle}>Amarrações</h3>
              <p style={serviceText}>
                Trabalhos espirituais voltados para união de caminhos amorosos,
                realizados com responsabilidade e fundamento.
              </p>
            </div>

            <div style={serviceCard}>
              <h3 style={serviceTitle}>Trabalhos Amorosos</h3>
              <p style={serviceText}>
                Orientação e trabalhos voltados para questões afetivas,
                reconciliação e fortalecimento de relações.
              </p>
            </div>

            <div style={serviceCard}>
              <h3 style={serviceTitle}>Iniciação na Regra de Osha</h3>
              <p style={serviceText}>
                Processo espiritual com fundamento na Santería Afrocubana,
                conduzido com respeito, tradição e responsabilidade.
              </p>
            </div>

            <div style={serviceCard}>
              <h3 style={serviceTitle}>Iniciação em Palo Mayombe</h3>
              <p style={serviceText}>
                Caminho espiritual dentro do Palo Mayombe, com orientação séria,
                fundamento ancestral e acompanhamento responsável.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "50px 20px 20px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "34px",
              color: "#f7e7b6",
              marginBottom: "30px"
            }}
          >
            Testemunhos de clientes
          </h2>

          {testemunhos.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#d7c7a0",
                marginBottom: "30px"
              }}
            >
              Ainda não há testemunhos publicados.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "40px"
              }}
            >
              {testemunhos.map((item, index) => (
                <div key={item.id || index} style={testimonialCard}>
                  <div
                    style={{
                      color: "#d4af37",
                      fontSize: "22px",
                      marginBottom: "10px"
                    }}
                  >
                    ★★★★★
                  </div>

                  <p
                    style={{
                      color: "#f5e6c8",
                      lineHeight: "1.8",
                      marginBottom: "18px"
                    }}
                  >
                    “{item.mensagem}”
                  </p>

                  <p
                    style={{
                      color: "#f2d47a",
                      fontWeight: "bold",
                      margin: 0
                    }}
                  >
                    {item.nome}
                  </p>

                  <p
                    style={{
                      color: "#cdbb8d",
                      marginTop: "8px",
                      marginBottom: 0,
                      fontSize: "14px"
                    }}
                  >
                    {item.servico}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div style={feedbackBox}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "18px",
                color: "#111",
                fontSize: "28px"
              }}
            >
              Deixe seu testemunho
            </h3>

            <input
              placeholder="Seu nome"
              value={nomeFeedback}
              onChange={(e) => setNomeFeedback(e.target.value)}
              style={inputStyle}
            />

            <select
              value={servicoFeedback}
              onChange={(e) => setServicoFeedback(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione o serviço</option>
              <option value="Consulta Presencial">Consulta Presencial</option>
              <option value="Consulta Online">Consulta Online</option>
              <option value="Limpeza Espiritual">Limpeza Espiritual</option>
              <option value="Amarração">Amarração</option>
              <option value="Trabalho Amoroso">Trabalho Amoroso</option>
              <option value="Iniciação na Regra de Osha">
                Iniciação na Regra de Osha
              </option>
              <option value="Iniciação em Palo Mayombe">
                Iniciação em Palo Mayombe
              </option>
            </select>

            <textarea
              placeholder="Escreva aqui seu feedback sobre o atendimento ou trabalho..."
              value={mensagemFeedback}
              onChange={(e) => setMensagemFeedback(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: "140px",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />

            <button
              onClick={enviarFeedback}
              disabled={enviandoFeedback}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: enviandoFeedback
                  ? "#777"
                  : "linear-gradient(135deg, #111, #2d2d2d)",
                color: "#fff",
                fontWeight: "bold",
                cursor: enviandoFeedback ? "not-allowed" : "pointer",
                fontSize: "15px"
              }}
            >
              {enviandoFeedback ? "Enviando..." : "Enviar testemunho"}
            </button>
          </div>
        </div>
      </section>

      <section id="agendamento" style={{ padding: "50px 20px 80px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            alignItems: "start"
          }}
        >
          <div style={leftPanel}>
            <h2 style={{ fontSize: "34px", marginBottom: "18px", color: "#f7e7b6" }}>
              Agende seu atendimento
            </h2>

            <p style={leftText}>
              Escolha a modalidade da consulta, selecione a data e o horário
              disponível e finalize com o pagamento via PIX. Em seguida, envie
              seu comprovante pelo WhatsApp para confirmação.
            </p>

            <div style={highlightBox}>
              <p style={{ margin: 0, color: "#f2d47a", fontWeight: "bold" }}>
                Chave PIX:
              </p>
              <p style={{ margin: "8px 0 0", color: "#fff" }}>
                sefirxd18@gmail.com
              </p>
            </div>

            <div style={{ marginTop: "18px", color: "#d7c7a0", lineHeight: "1.8" }}>
              <div>✔ Consulta presencial: R$ 600</div>
              <div>✔ Consulta online: R$ 300</div>
              <div>✔ Horários organizados automaticamente</div>
              <div>✔ Confirmação prática por WhatsApp</div>
            </div>
          </div>

          <div style={formCard}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: "90px",
                  maxWidth: "100%"
                }}
              />
            </div>

            <h3
              style={{
                marginTop: 0,
                marginBottom: "18px",
                color: "#111",
                fontSize: "28px"
              }}
            >
              Formulário de agendamento
            </h3>

            <input
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={inputStyle}
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione a modalidade</option>
              <option value="presencial">Consulta Presencial - R$ 600</option>
              <option value="online">Consulta Online - R$ 300</option>
            </select>

            <div style={{ marginBottom: "14px" }}>
              <DatePicker
                selected={fecha}
                onChange={(date) => setFecha(date)}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Escolha a data"
                className="date-picker-input"
              />
            </div>

            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              style={inputStyle}
            >
              <option value="">Horários disponíveis</option>
              {horariosDisponiveis.map((h, i) => (
                <option key={i} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {horariosDisponiveis.length === 0 && (
              <p
                style={{
                  color: "#b42318",
                  fontSize: "14px",
                  marginTop: "6px",
                  marginBottom: "14px"
                }}
              >
                Não há horários disponíveis para esta data.
              </p>
            )}

            {tipo && hora && (
              <div style={paymentCard}>
                <h4
                  style={{
                    margin: "0 0 10px",
                    color: "#111",
                    fontSize: "20px"
                  }}
                >
                  Pagamento via PIX
                </h4>

                <p style={{ margin: "0 0 8px", color: "#444" }}>
                  Chave PIX: <strong>sefirxd18@gmail.com</strong>
                </p>

                <p
                  style={{
                    margin: "0 0 18px",
                    fontWeight: "bold",
                    color: "#111",
                    fontSize: "20px"
                  }}
                >
                  Valor: R$ {precos[tipo]}
                </p>

                <button
                  onClick={enviarWhatsApp}
                  disabled={enviando}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "none",
                    borderRadius: "10px",
                    background: enviando
                      ? "#777"
                      : "linear-gradient(135deg, #111, #2d2d2d)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: enviando ? "not-allowed" : "pointer",
                    fontSize: "15px"
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar comprovante no WhatsApp"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
};

const cardTitle = {
  marginTop: 0,
  color: "#f2d47a",
  fontSize: "22px",
  marginBottom: "12px"
};

const cardText = {
  margin: 0,
  color: "#d7c7a0",
  lineHeight: "1.8"
};

const serviceCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.18)",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
};

const serviceTitle = {
  marginTop: 0,
  marginBottom: "12px",
  color: "#f7e7b6",
  fontSize: "26px"
};

const serviceText = {
  color: "#d7c7a0",
  lineHeight: "1.8",
  marginBottom: 0
};

const testimonialCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
};

const feedbackBox = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.20)",
  maxWidth: "760px",
  margin: "0 auto"
};

const leftPanel = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "22px",
  padding: "28px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
};

const leftText = {
  color: "#d7c7a0",
  lineHeight: "1.9",
  fontSize: "16px"
};

const highlightBox = {
  marginTop: "22px",
  background: "rgba(212,175,55,0.10)",
  border: "1px solid rgba(212,175,55,0.18)",
  borderRadius: "14px",
  padding: "18px"
};

const formCard = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.20)"
};

const paymentCard = {
  marginTop: "16px",
  background: "#f8f8f8",
  borderRadius: "16px",
  padding: "18px",
  border: "1px solid #e6e6e6"
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #d9d9d9",
  boxSizing: "border-box",
  fontSize: "15px",
  background: "#fff",
  color: "#111"
};