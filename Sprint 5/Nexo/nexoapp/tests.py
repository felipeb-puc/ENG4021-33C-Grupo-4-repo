from datetime import date, timedelta

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse

from .models import Instituicao, Curso, Aluno, Recrutador, Representante, Oportunidade, Candidatura


class CadastroEmailDuplicadoTests(TestCase):
    def setUp(self):
        self.empresa = Instituicao.objects.create(
            tipo="empresa",
            nome="Empresa de teste",
            sede="Rio de Janeiro",
        )
        self.faculdade = Instituicao.objects.create(
            tipo="faculdade",
            nome="PUC-Rio",
            sede="Rio de Janeiro",
        )
        self.curso = Curso.objects.create(nome="Engenharia")

    def criar_conta_e_repetir_email(self, url, dados):
        primeira_resposta = self.client.post(url, dados)
        self.assertEqual(primeira_resposta.status_code, 302)

        resposta = self.client.post(url, dados)

        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Já existe uma conta com este e-mail.")
        email = dados.get("email", dados.get("email_academico"))
        self.assertEqual(User.objects.filter(username=email).count(), 1)

    def test_email_duplicado_no_cadastro_de_aluno(self):
        dados = {
            "nome_completo": "Aluno de teste",
            "email_academico": "aluno@example.com",
            "senha": "senha-segura-123",
            "matricula": "123456",
            "universidade": str(self.faculdade.pk),
            "curso": str(self.curso.pk),
            "periodo_atual": "1",
            "cr": "",
            "aceitar_termos": "on",
        }

        self.criar_conta_e_repetir_email(
            "/templates/PROJETOtela_informacoes_estudante.html", 
            dados
        )

    def test_email_duplicado_no_cadastro_de_recrutador(self):
        dados = {
            "nome": "Recrutador de teste",
            "email": "recrutador@example.com",
            "cargo": "Gerente",
            "senha": "senha-segura-123",
            "empresa": str(self.empresa.pk),
            "aceita_termos": "on",
        }

        self.criar_conta_e_repetir_email(
            "/templates/PROJETOtela_informacoes_recrutador.html",
            dados,
        )

    def test_email_duplicado_no_cadastro_de_representante(self):
        dados = {
            "nome": "Representante de teste",
            "email": "representante@example.com",
            "cargo": "Coordenador",
            "senha": "senha-segura-123",
            "empresa": str(self.faculdade.pk),
            "aceita_termos": "on",
        }

        self.criar_conta_e_repetir_email(
            "/templates/PROJETOtela_informacoes_representante.html",
            dados,
        )


class CadastroELoginTests(TestCase):
    def setUp(self):
        self.faculdade = Instituicao.objects.create(tipo="faculdade", nome="PUC-Rio", sede="Rio de Janeiro")
        self.empresa = Instituicao.objects.create(tipo="empresa", nome="Empresa de teste", sede="Rio de Janeiro")
        self.curso = Curso.objects.create(nome="Engenharia")

    def dados_do_aluno(self):
        return {
            "nome_completo": "Joana Teste",
            "email_academico": "joana@example.com",
            "senha": "senha-segura-123",
            "matricula": "2410001",
            "universidade": str(self.faculdade.pk),
            "curso": str(self.curso.pk),
            "periodo_atual": "3",
            "cr": "8.5",
            "aceitar_termos": "on",
        }

    def criar_usuario(self, email, staff=False):
        return User.objects.create_user(username=email, email=email, password="senha-segura-123", is_staff=staff)

    def entrar(self, email, senha):
        return self.client.post(reverse("login"), {"email": email, "senha": senha})

    def test_cadastro_de_estudante_cria_usuario_e_aluno(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_do_aluno())

        self.assertRedirects(resposta, reverse("login"))
        usuario = User.objects.get(username="joana@example.com")
        aluno = Aluno.objects.get(user=usuario)
        self.assertEqual(usuario.first_name, "Joana Teste")
        self.assertEqual(aluno.instituicao, self.faculdade)
        self.assertEqual(aluno.curso, self.curso)
        self.assertEqual(aluno.periodo, 3)

    def test_email_repetido_nao_cria_outro_aluno(self):
        self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_do_aluno())
        resposta = self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_do_aluno())

        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Já existe uma conta com este e-mail.")
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(Aluno.objects.count(), 1)

    def test_login_de_aluno_vai_para_o_inicio(self):
        usuario = self.criar_usuario("aluno@example.com")
        Aluno.objects.create(user=usuario, instituicao=self.faculdade, curso=self.curso, matricula="1", periodo=2, curriculo="")

        resposta = self.entrar("aluno@example.com", "senha-segura-123")

        self.assertRedirects(resposta, reverse("inicio"))

    def test_login_de_recrutador_vai_para_o_painel(self):
        usuario = self.criar_usuario("recrutador@example.com")
        Recrutador.objects.create(user=usuario, empresa=self.empresa, cargo="Gerente")

        resposta = self.entrar("recrutador@example.com", "senha-segura-123")

        self.assertRedirects(resposta, reverse("tela_painel"))

    def test_login_de_representante_vai_para_o_painel(self):
        usuario = self.criar_usuario("representante@example.com")
        Representante.objects.create(user=usuario, instituicao=self.faculdade, cargo="Coordenador")

        resposta = self.entrar("representante@example.com", "senha-segura-123")

        self.assertRedirects(resposta, reverse("tela_painel"))

    def test_login_de_admin_vai_para_a_tela_de_admin(self):
        self.criar_usuario("admin@example.com", staff=True)

        resposta = self.entrar("admin@example.com", "senha-segura-123")

        self.assertRedirects(resposta, reverse("tela_admin"))

    def test_login_com_senha_errada_mostra_mensagem(self):
        self.criar_usuario("aluno@example.com")

        resposta = self.entrar("aluno@example.com", "senha-errada")

        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Login inválido: e-mail ou senha incorretos.")
        self.assertNotIn("_auth_user_id", self.client.session)


class FiltrosDaBuscaTests(TestCase):
    def setUp(self):
        puc = Instituicao.objects.create(tipo="faculdade", nome="PUC-Rio", sede="Rio de Janeiro")
        empresa = Instituicao.objects.create(tipo="empresa", nome="Empresa X", sede="Rio de Janeiro")
        self.engenharia = Curso.objects.create(nome="Engenharia")
        self.direito = Curso.objects.create(nome="Direito")
        hoje = date.today()

        Oportunidade.objects.create(
            instituicao=puc, curso=self.engenharia, tipo="monitoria", titulo="Monitoria de Python",
            descricao="Ajudar a turma nas listas.", requisitos="Ter feito a disciplina.",
            carga_horaria=10, remuneracao=600, prazo_inscricao=hoje + timedelta(days=10),
            modalidade="presencial", periodo_minimo=2,
        )
        Oportunidade.objects.create(
            instituicao=empresa, curso=self.engenharia, tipo="estagio", titulo="Estágio em Dados",
            descricao="Montar relatórios.", requisitos="Saber Excel.",
            carga_horaria=30, remuneracao=2000, prazo_inscricao=hoje + timedelta(days=20),
            modalidade="hibrido", periodo_minimo=5,
        )
        Oportunidade.objects.create(
            instituicao=puc, curso=self.direito, tipo="ic", titulo="IC em Direito Digital",
            descricao="Pesquisa sobre a LGPD.", requisitos="Interesse na área.",
            carga_horaria=12, remuneracao=0, prazo_inscricao=hoje + timedelta(days=5),
            modalidade="remoto", periodo_minimo=1,
        )
        Oportunidade.objects.create(
            instituicao=puc, curso=self.direito, tipo="liga", titulo="Liga de Mercado",
            descricao="Encontros semanais.", requisitos="Nenhum.",
            carga_horaria=6, remuneracao=0, prazo_inscricao=hoje - timedelta(days=3),
            modalidade="presencial", periodo_minimo=3,
        )

        usuario = User.objects.create_user(username="aluno@example.com", email="aluno@example.com", password="senha-segura-123")
        Aluno.objects.create(user=usuario, instituicao=puc, curso=self.engenharia, matricula="1", periodo=4, curriculo="")
        self.client.login(username="aluno@example.com", password="senha-segura-123")

    def buscar(self, filtros):
        resposta = self.client.get(reverse("tela_busca"), filtros)
        self.assertEqual(resposta.status_code, 200)
        titulos = []
        for oportunidade in resposta.context["oportunidades"]:
            titulos.append(oportunidade.titulo)
        return titulos

    def test_sem_filtro_mostra_todas(self):
        self.assertEqual(len(self.buscar({})), 4)

    def test_filtro_de_texto(self):
        self.assertEqual(self.buscar({"q": "python"}), ["Monitoria de Python"])

    def test_filtro_de_curso(self):
        titulos = self.buscar({"curso": self.direito.id})
        self.assertCountEqual(titulos, ["IC em Direito Digital", "Liga de Mercado"])

    def test_filtro_de_periodo(self):
        titulos = self.buscar({"periodo": "2"})
        self.assertCountEqual(titulos, ["Monitoria de Python", "IC em Direito Digital"])

    def test_filtro_de_uma_modalidade(self):
        self.assertEqual(self.buscar({"modalidade": "remoto"}), ["IC em Direito Digital"])

    def test_filtro_de_varias_modalidades(self):
        titulos = self.buscar({"modalidade": ["remoto", "hibrido"]})
        self.assertCountEqual(titulos, ["IC em Direito Digital", "Estágio em Dados"])

    def test_so_remuneradas(self):
        titulos = self.buscar({"remuneradas": "1"})
        self.assertCountEqual(titulos, ["Monitoria de Python", "Estágio em Dados"])

    def test_so_abertas(self):
        titulos = self.buscar({"abertas": "1"})
        self.assertNotIn("Liga de Mercado", titulos)
        self.assertEqual(len(titulos), 3)

    def test_ordem_encerrando_primeiro(self):
        titulos = self.buscar({"ordem": "encerrando"})
        self.assertEqual(titulos, ["Liga de Mercado", "IC em Direito Digital", "Monitoria de Python", "Estágio em Dados"])

    def test_ordem_mais_recentes(self):
        titulos = self.buscar({"ordem": "recentes"})
        self.assertEqual(titulos, ["Liga de Mercado", "IC em Direito Digital", "Estágio em Dados", "Monitoria de Python"])

    def test_ordem_maior_bolsa(self):
        titulos = self.buscar({"ordem": "maior_bolsa"})
        self.assertEqual(titulos[0], "Estágio em Dados")
        self.assertEqual(titulos[1], "Monitoria de Python")

    def test_filtros_combinados(self):
        titulos = self.buscar({"curso": self.engenharia.id, "remuneradas": "1", "abertas": "1", "modalidade": "presencial"})
        self.assertEqual(titulos, ["Monitoria de Python"])


class BaseTarefasSprint11(TestCase):
    """Dados que os testes das tarefas da Sprint 11 usam: alunos, recrutadores, representante, admin e duas vagas."""

    def setUp(self):
        self.puc = Instituicao.objects.create(tipo="faculdade", nome="PUC-Rio", sede="Rio de Janeiro")
        self.visagio = Instituicao.objects.create(tipo="empresa", nome="Visagio", sede="Rio de Janeiro")
        self.petrobras = Instituicao.objects.create(tipo="empresa", nome="Petrobras", sede="Rio de Janeiro")
        self.curso = Curso.objects.create(nome="Engenharia")
        hoje = date.today()

        self.vaga_visagio = Oportunidade.objects.create(
            instituicao=self.visagio, curso=self.curso, tipo="estagio", titulo="Estágio em Dados",
            descricao="Relatórios.", requisitos="Excel.", carga_horaria=30, remuneracao=2000,
            prazo_inscricao=hoje + timedelta(days=20), modalidade="hibrido", periodo_minimo=5,
        )
        self.vaga_puc = Oportunidade.objects.create(
            instituicao=self.puc, curso=self.curso, tipo="monitoria", titulo="Monitoria de Cálculo",
            descricao="Plantões.", requisitos="Ter feito Cálculo.", carga_horaria=8, remuneracao=600,
            prazo_inscricao=hoje + timedelta(days=10), modalidade="presencial", periodo_minimo=2,
        )

        self.aluno = self.criar_aluno("ana@example.com", "Ana", periodo=6)
        self.calouro = self.criar_aluno("bia@example.com", "Bia", periodo=2)
        self.carla = self.criar_recrutador("carla@example.com", "Carla", self.visagio)
        self.rafael = self.criar_recrutador("rafael@example.com", "Rafael", self.petrobras)
        usuario = User.objects.create_user(username="lucas@example.com", email="lucas@example.com", first_name="Lucas", password="senha-segura-123")
        Representante.objects.create(user=usuario, instituicao=self.puc, cargo="Coordenador")
        User.objects.create_user(username="admin@example.com", email="admin@example.com", password="senha-segura-123", is_staff=True)

        # a Ana se candidatou à vaga da Visagio
        self.candidatura = Candidatura.objects.create(aluno=self.aluno, oportunidade=self.vaga_visagio)

    def criar_aluno(self, email, nome, periodo):
        usuario = User.objects.create_user(username=email, email=email, first_name=nome, password="senha-segura-123")
        return Aluno.objects.create(user=usuario, instituicao=self.puc, curso=self.curso, matricula=email[:3],
                                    periodo=periodo, curriculo="Monitora de Cálculo.", cr=8)

    def criar_recrutador(self, email, nome, empresa):
        usuario = User.objects.create_user(username=email, email=email, first_name=nome, password="senha-segura-123")
        return Recrutador.objects.create(user=usuario, empresa=empresa, cargo="RH")

    def entrar(self, email):
        self.client.login(username=email, password="senha-segura-123")


class CabecalhoUnicoTests(BaseTarefasSprint11):

    def test_aluno_ve_o_cabecalho_do_aluno(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("inicio"))
        self.assertContains(resposta, "Minhas oportunidades")
        self.assertNotContains(resposta, "RECRUTADOR")

    def test_recrutador_e_representante_veem_o_papel_certo(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_painel"))
        self.assertContains(resposta, "RECRUTADOR")
        self.assertContains(resposta, "Visagio")
        self.assertNotContains(resposta, "Minhas oportunidades")
        self.client.logout()
        self.entrar("lucas@example.com")
        resposta = self.client.get(reverse("tela_painel"))
        self.assertContains(resposta, "REPRESENTANTE")

    def test_visitante_ve_entrar_e_criar_conta(self):
        resposta = self.client.get(reverse("home"))
        self.assertContains(resposta, "Entrar")
        self.assertContains(resposta, "Criar conta")


class MenuDoPerfilTests(BaseTarefasSprint11):

    def test_menu_do_aluno(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("inicio"))
        self.assertContains(resposta, 'id="menu-perfil"')
        self.assertContains(resposta, "Meu perfil e currículo")
        self.assertContains(resposta, "menu-perfil.js")

    def test_perfil_da_instituicao_so_no_menu_de_quem_publica(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_painel"))
        self.assertContains(resposta, 'id="menu-perfil"')
        self.assertContains(resposta, "Perfil da instituição", count=1)
        self.assertNotContains(resposta, "Meu perfil e currículo")


class TelasPorPapelTests(BaseTarefasSprint11):

    def test_recrutador_nao_abre_telas_do_aluno(self):
        self.entrar("carla@example.com")
        for nome in ["inicio", "tela_perfil", "tela_favoritos", "tela_minha_oportunidades", "tela_historico"]:
            resposta = self.client.get(reverse(nome))
            self.assertRedirects(resposta, reverse("tela_painel"), fetch_redirect_response=False)

    def test_admin_nao_abre_telas_do_aluno(self):
        self.entrar("admin@example.com")
        resposta = self.client.get(reverse("inicio"))
        self.assertRedirects(resposta, reverse("tela_admin"), fetch_redirect_response=False)

    def test_aluno_continua_abrindo_as_telas_dele(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("inicio"))
        self.assertEqual(resposta.status_code, 200)


class PerfilDoAlunoTests(BaseTarefasSprint11):

    def test_aluno_salva_periodo_cr_e_curriculo(self):
        self.entrar("ana@example.com")
        resposta = self.client.post(reverse("tela_perfil"), {"periodo": "7", "cr": "9.1", "curriculo": "Estágio na Exacta."})
        self.assertRedirects(resposta, reverse("tela_perfil"))
        self.aluno.refresh_from_db()
        self.assertEqual(self.aluno.periodo, 7)
        self.assertEqual(str(self.aluno.cr), "9.1")
        self.assertEqual(self.aluno.curriculo, "Estágio na Exacta.")

    def test_perfil_recusa_periodo_e_cr_fora_do_limite(self):
        self.entrar("ana@example.com")
        resposta = self.client.post(reverse("tela_perfil"), {"periodo": "15", "cr": "11", "curriculo": "x"})
        self.assertEqual(resposta.status_code, 200)
        self.assertTrue(resposta.context["form"].errors)
        self.aluno.refresh_from_db()
        self.assertEqual(self.aluno.periodo, 6)
