from datetime import date, timedelta

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse

from .models import Instituicao, Curso, Aluno, Recrutador, Representante, Oportunidade


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
            "universidade": "PUC-Rio",
            "curso": "Engenharia",
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
            "universidade": "PUC-Rio",
            "curso": "Engenharia",
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
