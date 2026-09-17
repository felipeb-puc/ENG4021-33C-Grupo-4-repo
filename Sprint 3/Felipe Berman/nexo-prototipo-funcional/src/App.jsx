import { Navigate, Route, Routes } from "react-router-dom";

import { PAPEL } from "./regras/escopo.js";
import { RotaProtegida, RotaPublica } from "./componentes/RotaProtegida.jsx";
import Header from "./componentes/Header.jsx";

import Landing from "./telas/Landing.jsx";
import Entrar from "./telas/Entrar.jsx";
import EscolherTipoConta from "./telas/EscolherTipoConta.jsx";
import CriarContaAluno from "./telas/CriarContaAluno.jsx";
import CriarContaMembro from "./telas/CriarContaMembro.jsx";
import Inicio from "./telas/Inicio.jsx";
import Busca from "./telas/Busca.jsx";
import Oportunidade from "./telas/Oportunidade.jsx";
import MinhasOportunidades from "./telas/MinhasOportunidades.jsx";
import Painel from "./telas/Painel.jsx";
import EditorOportunidade from "./telas/EditorOportunidade.jsx";
import CandidaturasRecebidas from "./telas/CandidaturasRecebidas.jsx";
import Perfil from "./telas/Perfil.jsx";
import BancoTalentos from "./telas/BancoTalentos.jsx";
import CurriculoAluno from "./telas/CurriculoAluno.jsx";
import Instituicao from "./telas/Instituicao.jsx";
import Admin from "./telas/Admin.jsx";

const PAPEIS_QUE_PUBLICAM = [PAPEL.RECRUTADOR, PAPEL.REPRESENTANTE];

export default function App() {
  return (
    <div className="pagina">
      <Header />

      <Routes>
        {/* Público */}
        <Route
          path="/"
          element={
            <RotaPublica>
              <Landing />
            </RotaPublica>
          }
        />
        <Route
          path="/entrar"
          element={
            <RotaPublica>
              <Entrar />
            </RotaPublica>
          }
        />
        <Route
          path="/criar-conta"
          element={
            <RotaPublica>
              <EscolherTipoConta />
            </RotaPublica>
          }
        />
        <Route
          path="/criar-conta/estudante"
          element={
            <RotaPublica>
              <CriarContaAluno />
            </RotaPublica>
          }
        />
        <Route
          path="/criar-conta/recrutador"
          element={
            <RotaPublica>
              <CriarContaMembro tipoConta="recrutador" />
            </RotaPublica>
          }
        />
        <Route
          path="/criar-conta/academico"
          element={
            <RotaPublica>
              <CriarContaMembro tipoConta="academico" />
            </RotaPublica>
          }
        />

        {/* Estudante */}
        <Route
          path="/inicio"
          element={
            <RotaProtegida papeis={[PAPEL.ALUNO]}>
              <Inicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/busca"
          element={
            <RotaProtegida papeis={[PAPEL.ALUNO]}>
              <Busca />
            </RotaProtegida>
          }
        />
        <Route
          path="/oportunidade/:id"
          element={
            <RotaProtegida papeis={[PAPEL.ALUNO]}>
              <Oportunidade />
            </RotaProtegida>
          }
        />
        <Route
          path="/minhas-oportunidades"
          element={
            <RotaProtegida papeis={[PAPEL.ALUNO]}>
              <MinhasOportunidades />
            </RotaProtegida>
          }
        />
        <Route
          path="/perfil"
          element={
            <RotaProtegida papeis={[PAPEL.ALUNO]}>
              <Perfil />
            </RotaProtegida>
          }
        />

        {/* Quem publica */}
        <Route
          path="/painel"
          element={
            <RotaProtegida papeis={PAPEIS_QUE_PUBLICAM}>
              <Painel />
            </RotaProtegida>
          }
        />
        <Route
          path="/painel/nova-oportunidade"
          element={
            <RotaProtegida papeis={PAPEIS_QUE_PUBLICAM}>
              <EditorOportunidade />
            </RotaProtegida>
          }
        />
        <Route
          path="/painel/oportunidade/:id/editar"
          element={
            <RotaProtegida papeis={PAPEIS_QUE_PUBLICAM}>
              <EditorOportunidade />
            </RotaProtegida>
          }
        />
        <Route
          path="/painel/candidaturas"
          element={
            <RotaProtegida papeis={PAPEIS_QUE_PUBLICAM}>
              <CandidaturasRecebidas />
            </RotaProtegida>
          }
        />
        <Route
          path="/painel/talentos"
          element={
            <RotaProtegida papeis={[PAPEL.RECRUTADOR, PAPEL.REPRESENTANTE]}>
              <BancoTalentos />
            </RotaProtegida>
          }
        />

        <Route
          path="/painel/aluno/:id"
          element={
            <RotaProtegida papeis={PAPEIS_QUE_PUBLICAM}>
              <CurriculoAluno />
            </RotaProtegida>
          }
        />

        {/* Qualquer conta logada; o que cada papel vê é decidido na tela */}
        <Route
          path="/instituicao/:id"
          element={
            <RotaProtegida>
              <Instituicao />
            </RotaProtegida>
          }
        />

        {/* Administração */}
        <Route
          path="/admin"
          element={
            <RotaProtegida papeis={[PAPEL.ADMIN]}>
              <Admin />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
