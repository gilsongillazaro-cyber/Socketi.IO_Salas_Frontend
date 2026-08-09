import "./App.css";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Offline, Online } from "react-detect-offline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import logo from "./assets/ChatGPT Image 9_08_2026, 19_45_44.png";
import offlineLogo from "./assets/ChatGPT Image 9_08_2026, 19_47_26.png";

import "dayjs/locale/pt.js";
dayjs.extend(relativeTime);
dayjs.locale("pt");

function FaviconOnline() {
  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");

    if (favicon) {
      document.title = "socket.Io_Salas";
      favicon.href = logo;
    }
  }, []);

  return null;
}

function FaviconOffline() {
  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");

    if (favicon) {
      document.title = "sem ligação à internet";
      favicon.href = offlineLogo;
    }
  }, []);

  return null;
}

function App() {
  const [salaSele, setSalasele] = useState(() => null);
  const [funcaoSair, setFuncaosair] = useState(() => null);
  const [funcaoEnviar, setFuncaoEnviar] = useState(() => null);
  const [nomeSala, setNomeSala] = useState(null);
  const [salaAtual, setSalaAtual] = useState("");
  const [selecionado, setSelecionado] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [mensagensReact, setMensagensReact] = useState([]);
  const [mensagensNodejs, setMensagensNodejs] = useState([]);
  const [mensagensMongoDb, setMensagensMongoDb] = useState([]);
  const [MeuId, setMeuId] = useState();
  const menagem = useRef();
  const sala = useRef();

  const user = {
    nome: "usuario fake",
  };
  useEffect(() => {
    const socket = io("https://socketi-io-salas-backend.onrender.com");

    socket.on("connect", () => {
      toast.info("conexão estabeliida");
      setMeuId(socket.id);
    });
    socket.on("nome-sala", (nomeSala) => {
      setNomeSala(nomeSala);
      setSalaAtual(nomeSala);
    });
    socket.on("bem-vindo_sala", (bemvindo) => {
      toast.info(bemvindo);
    });
    socket.on("novo-utilizador", (novo) => {
      toast.info(novo);
    });
    socket.on("saiu", (sms) => {
      toast.info(sms);
    });
    socket.on("mensagens", (dados) => {
      if (dados.sala === "react")
        return setMensagensReact((prev) => [...prev, dados]);
      if (dados.sala === "nodejs")
        return setMensagensNodejs((prev) => [...prev, dados]);
      if (dados.sala === "mongoDB")
        return setMensagensMongoDb((prev) => [...prev, dados]);
      setMensagens((prev) => [...prev, dados]);
    });
    function selecionarSala(e) {
      e.preventDefault();
      socket.emit("sala-selecionada", sala.current.value);
      setSelecionado(true);
    }
    function sairSala() {
      setSelecionado(false);
      socket.emit("sala-sair", salaAtual);
      setNomeSala(null);
      sala.current.value = "";
    }
    function enviarMensagem(e) {
      e.preventDefault();
      socket.emit("mensagem", {
        nome: user.nome,
        menagem: menagem.current.value,
      });
      menagem.current.value = "";
    }
    setFuncaoEnviar(() => enviarMensagem);
    setFuncaosair(() => sairSala);
    setSalasele(() => selecionarSala);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [mensagens, mensagensMongoDb, mensagensNodejs, mensagensReact]);
  return (
    <div className="App">

      <Online>
        <FaviconOnline />
      </Online>

      <Offline>
        <FaviconOffline />
        <div className="off">
          <p>
            voce esta offline verifique sua conexão a internet e tente novamente
          </p>
        </div>
      </Offline>
      <h1>socket.io</h1>
      {nomeSala !== null && (
        <>
          <h2>
            sua sala atual <strong> {nomeSala} </strong>
          </h2>
          <button id="sair" onClick={funcaoSair}>
            sair da sala
          </button>
        </>
      )}

      {selecionado == false ? (
        <form onSubmit={salaSele} className="form">
          <select ref={sala}>
            <option value="">selecione a sala</option>
            <option value="react">react</option>
            <option value="nodejs">nodejs</option>
            <option value="mongoDB">mongoDB</option>
          </select>
          <button>entrar</button>
        </form>
      ) : (
        <div className="areaSms">
          <h2>chat da sua sala</h2>
          <ul>
            {nomeSala === "react"
              ? mensagensReact.map((sms) => (
                  <li
                    key={sms.id}
                    className={
                      MeuId && MeuId === sms.id ? "enviada" : "recebida"
                    }
                  >
                    <h3>
                      {sms.nome} <strong>{dayjs(sms.data).fromNow()}</strong>
                    </h3>
                    <p>{sms.mensagem} </p>
                  </li>
                ))
              : nomeSala === "nodejs"
                ? mensagensNodejs.map((sms) => (
                    <li
                      key={sms.id}
                      className={
                        MeuId && MeuId === sms.id ? "enviada" : "recebida"
                      }
                    >
                      <h3>
                        {sms.nome} <strong>{dayjs(sms.data).fromNow()}</strong>
                      </h3>
                      <p>{sms.mensagem} </p>
                    </li>
                  ))
                : nomeSala === "mongoDB" &&
                  mensagensMongoDb.map((sms) => (
                    <li
                      key={sms.id}
                      className={
                        MeuId && MeuId === sms.id ? "enviada" : "recebida"
                      }
                    >
                      <h3>
                        {sms.nome} <strong>{dayjs(sms.data).fromNow()}</strong>
                      </h3>
                      <p>{sms.mensagem} </p>
                    </li>
                  ))}
          </ul>
          <form onSubmit={funcaoEnviar}>
            <input
              type="text"
              ref={menagem}
              placeholder="digite a mensagem..."
            />
            <button>enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
