from datetime import date, timedelta

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse

from .models import Instituicao, Curso, Aluno, Recrutador, Representante, Oportunidade, Candidatura, Favorito, TipoOportunidade


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


class CurriculoDoAlunoTests(BaseTarefasSprint11):

    def test_aluno_ve_o_proprio_curriculo(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.aluno.id]))
        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Monitora de Cálculo.")

    def test_aluno_nao_ve_curriculo_de_outro_aluno(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.calouro.id]))
        self.assertRedirects(resposta, reverse("tela_perfil"))

    def test_recrutador_ve_curriculo_de_quem_se_candidatou(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.aluno.id]))
        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Estágio em Dados")

    def test_recrutador_nao_ve_curriculo_de_quem_nao_se_candidatou(self):
        # a Ana desligou "aparecer em buscas", então só quem recebeu candidatura dela vê o currículo
        self.aluno.aparecer_em_buscas = False
        self.aluno.save()
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.aluno.id]))
        self.assertRedirects(resposta, reverse("tela_candidaturas_recebidas"), fetch_redirect_response=False)


class StatusDaCandidaturaTests(BaseTarefasSprint11):

    def mudar(self, status):
        return self.client.post(reverse("mudar_status", args=[self.candidatura.id]), {"status": status})

    def test_recrutador_dono_muda_o_status(self):
        self.entrar("carla@example.com")
        self.mudar("entrevista")
        self.candidatura.refresh_from_db()
        self.assertEqual(self.candidatura.status, "entrevista")

    def test_aluno_ve_o_status_novo_na_aba_dele(self):
        self.entrar("carla@example.com")
        self.mudar("aprovada")
        self.client.logout()
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_historico"))
        self.assertContains(resposta, "Aprovada")

    def test_outro_recrutador_nao_muda_o_status(self):
        self.entrar("rafael@example.com")
        self.mudar("recusada")
        self.candidatura.refresh_from_db()
        self.assertEqual(self.candidatura.status, "inscrita")

    def test_aluno_nao_muda_o_status(self):
        self.entrar("ana@example.com")
        self.mudar("aprovada")
        self.candidatura.refresh_from_db()
        self.assertEqual(self.candidatura.status, "inscrita")

    def test_status_invalido_ou_desistiu_nao_salva(self):
        self.entrar("carla@example.com")
        self.mudar("qualquer-coisa")
        self.mudar("desistiu")
        self.candidatura.refresh_from_db()
        self.assertEqual(self.candidatura.status, "inscrita")

    def test_candidatura_desistida_nao_muda_mais(self):
        self.candidatura.status = "desistiu"
        self.candidatura.save()
        self.entrar("carla@example.com")
        self.mudar("aprovada")
        self.candidatura.refresh_from_db()
        self.assertEqual(self.candidatura.status, "desistiu")

    def test_mudar_status_so_aceita_post(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("mudar_status", args=[self.candidatura.id]))
        self.assertEqual(resposta.status_code, 405)


class PeriodoMinimoTests(BaseTarefasSprint11):

    def test_aluno_abaixo_do_periodo_minimo_nao_se_candidata(self):
        self.entrar("bia@example.com")  # 2º período, vaga a partir do 5º
        self.client.post(reverse("candidatar", args=[self.vaga_visagio.id]))
        self.assertFalse(Candidatura.objects.filter(aluno=self.calouro, oportunidade=self.vaga_visagio).exists())

    def test_tela_da_vaga_avisa_o_periodo_minimo(self):
        self.entrar("bia@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[self.vaga_visagio.id]))
        self.assertContains(resposta, "A partir do 5º período")
        self.assertNotContains(resposta, "Candidatar-se")

    def test_aluno_no_periodo_certo_se_candidata(self):
        self.entrar("bia@example.com")  # monitoria a partir do 2º
        self.client.post(reverse("candidatar", args=[self.vaga_puc.id]))
        self.assertTrue(Candidatura.objects.filter(aluno=self.calouro, oportunidade=self.vaga_puc).exists())


class StatusNaTelaDeCandidaturasTests(BaseTarefasSprint11):

    def test_recrutador_ve_o_seletor_de_status(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_candidaturas_recebidas"))
        self.assertContains(resposta, reverse("mudar_status", args=[self.candidatura.id]))
        self.assertContains(resposta, '<option value="entrevista"')

    def test_desistiu_nao_aparece_como_opcao(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_candidaturas_recebidas"))
        html = resposta.content.decode()
        # o filtro de status do topo tem "Desistiu"; aqui só importa o seletor da candidatura
        seletor = html[html.index('class="form-status"'):]
        seletor = seletor[:seletor.index("</form>")]
        self.assertNotIn('value="desistiu"', seletor)

    def test_candidatura_desistida_mostra_so_o_texto(self):
        self.candidatura.status = "desistiu"
        self.candidatura.save()
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_candidaturas_recebidas"))
        self.assertNotContains(resposta, reverse("mudar_status", args=[self.candidatura.id]))
        self.assertContains(resposta, "Desistiu")

    def test_volta_para_a_lista_com_os_filtros_e_mostra_a_mensagem(self):
        self.entrar("carla@example.com")
        lista_filtrada = reverse("tela_candidaturas_recebidas") + "?status=inscrita"
        resposta = self.client.post(
            reverse("mudar_status", args=[self.candidatura.id]),
            {"status": "entrevista", "voltar": lista_filtrada},
            follow=True,
        )
        self.assertRedirects(resposta, lista_filtrada)
        self.assertContains(resposta, "mudado para Entrevista")

    def test_voltar_para_fora_do_site_e_ignorado(self):
        self.entrar("carla@example.com")
        resposta = self.client.post(
            reverse("mudar_status", args=[self.candidatura.id]),
            {"status": "entrevista", "voltar": "https://outro-site.com/"},
        )
        self.assertEqual(resposta["Location"], reverse("tela_candidaturas_recebidas"))


class FiltrosComTextoTests(BaseTarefasSprint11):

    def test_filtro_com_texto_nao_da_erro(self):
        self.entrar("carla@example.com")
        url = reverse("tela_candidaturas_recebidas")
        resposta = self.client.get(url + "?periodo=abc&universidade=abc&curso=abc&oportunidade=abc&cr=abc")
        self.assertEqual(resposta.status_code, 200)
        # o filtro com texto é ignorado, então a candidatura da Ana continua aparecendo
        self.assertContains(resposta, "Ana")


class BotoesDaTelaDaVagaTests(BaseTarefasSprint11):

    def test_aluno_ve_candidatar_e_salvar(self):
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[self.vaga_puc.id]))
        self.assertContains(resposta, "Candidatar-se")
        self.assertContains(resposta, "Salvar para depois")

    def test_dono_ve_editar_e_nao_ve_candidatar(self):
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[self.vaga_visagio.id]))
        self.assertContains(resposta, "Editar oportunidade")
        self.assertNotContains(resposta, "Candidatar-se")
        self.assertNotContains(resposta, "Salvar para depois")

    def test_outro_recrutador_nao_ve_candidatar(self):
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[self.vaga_visagio.id]))
        self.assertNotContains(resposta, "Candidatar-se")
        self.assertNotContains(resposta, "Editar oportunidade")
        self.assertContains(resposta, "Só estudantes se candidatam")

    def test_link_externo_respeita_periodo_minimo(self):
        self.vaga_visagio.link_externo = "https://example.com/vaga"
        self.vaga_visagio.save()
        # a Bia está no 2º período e a vaga é a partir do 5º
        self.entrar("bia@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[self.vaga_visagio.id]))
        self.assertNotContains(resposta, "Inscrever-se no site da instituição")
        self.assertContains(resposta, "A partir do 5º período")


class ListagensSoParaAlunoTests(BaseTarefasSprint11):
    listagens = ["tela_estagio", "tela_iniciacao_cientifica", "tela_liga_academica",
                 "tela_monitoria", "tela_equipe_competicao", "tela_busca"]

    def test_visitante_vai_para_o_login(self):
        for nome in self.listagens:
            resposta = self.client.get(reverse(nome))
            self.assertRedirects(resposta, reverse("login") + "?next=" + reverse(nome), fetch_redirect_response=False)

    def test_recrutador_volta_para_o_painel(self):
        self.entrar("carla@example.com")
        for nome in self.listagens:
            resposta = self.client.get(reverse(nome))
            self.assertRedirects(resposta, reverse("tela_painel"), fetch_redirect_response=False)

    def test_aluno_abre_as_listagens(self):
        self.entrar("ana@example.com")
        for nome in self.listagens:
            resposta = self.client.get(reverse(nome))
            self.assertEqual(resposta.status_code, 200)


class LoginVoltaParaPaginaTests(BaseTarefasSprint11):

    def test_login_volta_para_a_vaga(self):
        url_vaga = reverse("tela_oportunidade", args=[self.vaga_puc.id])
        resposta = self.client.get(url_vaga)
        self.assertRedirects(resposta, reverse("login") + "?next=" + url_vaga, fetch_redirect_response=False)
        resposta = self.client.post(reverse("login") + "?next=" + url_vaga,
                                    {"email": "ana@example.com", "senha": "senha-segura-123", "next": url_vaga})
        self.assertRedirects(resposta, url_vaga, fetch_redirect_response=False)

    def test_login_nao_manda_para_outro_site(self):
        resposta = self.client.post(reverse("login"),
                                    {"email": "ana@example.com", "senha": "senha-segura-123", "next": "https://site-falso.com/"})
        self.assertRedirects(resposta, reverse("inicio"), fetch_redirect_response=False)

    def test_sem_next_continua_indo_para_a_tela_do_papel(self):
        resposta = self.client.post(reverse("login"), {"email": "carla@example.com", "senha": "senha-segura-123"})
        self.assertRedirects(resposta, reverse("tela_painel"), fetch_redirect_response=False)


class BuscarCandidatosTests(BaseTarefasSprint11):

    def setUp(self):
        super().setUp()
        self.uff = Instituicao.objects.create(tipo="faculdade", nome="UFF", sede="Niterói")
        self.direito = Curso.objects.create(nome="Direito")
        usuario = User.objects.create_user(username="caio@example.com", email="caio@example.com", first_name="Caio",
                                           password="senha-segura-123")
        self.caio = Aluno.objects.create(user=usuario, instituicao=self.uff, curso=self.direito, matricula="999",
                                         periodo=8, curriculo="Sabe Python.", cr=7)

    def test_recrutador_ve_quem_quer_aparecer(self):
        self.calouro.aparecer_em_buscas = False
        self.calouro.save()
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_banco_talentos"))
        nomes = [aluno.user.first_name for aluno in resposta.context["candidatos"]]
        self.assertIn("Ana", nomes)
        self.assertIn("Caio", nomes)
        self.assertNotIn("Bia", nomes)

    def test_filtros_vem_do_banco(self):
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_banco_talentos"))
        self.assertContains(resposta, ">UFF<")
        self.assertContains(resposta, ">Direito<")
        resposta = self.client.get(reverse("tela_banco_talentos") + "?curso=" + str(self.direito.id))
        self.assertEqual([aluno.user.first_name for aluno in resposta.context["candidatos"]], ["Caio"])

    def test_busca_por_habilidade_e_filtro_com_texto(self):
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_banco_talentos") + "?nome=python&periodo=abc&curso=abc")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual([aluno.user.first_name for aluno in resposta.context["candidatos"]], ["Caio"])

    def test_recrutador_abre_curriculo_de_quem_esta_no_banco(self):
        self.entrar("rafael@example.com")
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.caio.id]))
        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Sabe Python.")

    def test_representante_ve_so_alunos_da_sua_universidade(self):
        self.entrar("lucas@example.com")
        resposta = self.client.get(reverse("tela_banco_talentos"))
        nomes = [aluno.user.first_name for aluno in resposta.context["candidatos"]]
        self.assertIn("Ana", nomes)
        self.assertNotIn("Caio", nomes)
        resposta = self.client.get(reverse("tela_curriculo_aluno", args=[self.caio.id]))
        self.assertEqual(resposta.status_code, 302)

    def test_aluno_liga_e_desliga_no_perfil(self):
        self.entrar("ana@example.com")
        self.client.post(reverse("tela_perfil"), {"periodo": "6", "cr": "8", "curriculo": "x"})
        self.aluno.refresh_from_db()
        self.assertFalse(self.aluno.aparecer_em_buscas)
        self.client.post(reverse("tela_perfil"), {"periodo": "6", "cr": "8", "curriculo": "x", "aparecer_em_buscas": "on"})
        self.aluno.refresh_from_db()
        self.assertTrue(self.aluno.aparecer_em_buscas)


class LigaNovaComUniversidadeTests(BaseTarefasSprint11):

    def dados(self, tipo, universidade=""):
        return {
            "nome": "Rep Novo", "email": "repnovo@example.com", "cargo": "Presidente", "senha": "senha-segura-123",
            "empresa": "outro", "nova_instituicao": "Liga de Robótica", "tipo_nova_instituicao": tipo,
            "sede_nova_instituicao": "Gávea", "universidade_nova_instituicao": universidade, "aceita_termos": "on",
        }

    def test_liga_nova_pede_universidade(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_representante.html",
                                    self.dados("liga"))
        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Selecione a universidade da instituição.")
        self.assertFalse(Instituicao.objects.filter(nome="Liga de Robótica").exists())

    def test_liga_nova_fica_com_a_universidade_e_aparece_para_o_aluno(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_representante.html",
                                    self.dados("liga", str(self.puc.id)))
        self.assertEqual(resposta.status_code, 302)
        liga = Instituicao.objects.get(nome="Liga de Robótica")
        self.assertEqual(liga.universidade, self.puc)
        vaga = Oportunidade.objects.create(
            instituicao=liga, curso=self.curso, tipo="liga", titulo="Processo da Liga de Robótica",
            descricao="x", requisitos="x", carga_horaria=4, prazo_inscricao=date.today() + timedelta(days=5),
            modalidade="presencial",
        )
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_oportunidade", args=[vaga.id]))
        self.assertEqual(resposta.status_code, 200)

    def test_faculdade_nova_nao_precisa_de_universidade(self):
        dados = self.dados("faculdade")
        dados["nova_instituicao"] = "UNIRIO"
        resposta = self.client.post("/templates/PROJETOtela_informacoes_representante.html", dados)
        self.assertEqual(resposta.status_code, 302)
        self.assertIsNone(Instituicao.objects.get(nome="UNIRIO").universidade)


class ExcluirComCandidaturasTests(BaseTarefasSprint11):

    def test_nao_exclui_vaga_com_candidatura(self):
        self.entrar("carla@example.com")
        self.client.post(reverse("encerrar_oportunidade", args=[self.vaga_visagio.id]))
        resposta = self.client.post(reverse("excluir_oportunidade", args=[self.vaga_visagio.id]), follow=True)
        self.assertContains(resposta, "não pode ser excluída")
        self.assertTrue(Oportunidade.objects.filter(id=self.vaga_visagio.id).exists())
        self.assertTrue(Candidatura.objects.filter(id=self.candidatura.id).exists())
        # o botão de excluir nem aparece para essa vaga
        self.assertNotContains(resposta, reverse("excluir_oportunidade", args=[self.vaga_visagio.id]))

    def test_exclui_vaga_sem_candidatura(self):
        self.candidatura.delete()
        self.entrar("carla@example.com")
        self.client.post(reverse("encerrar_oportunidade", args=[self.vaga_visagio.id]))
        resposta = self.client.get(reverse("tela_painel_encerradas"))
        self.assertContains(resposta, "Excluir")
        self.client.post(reverse("excluir_oportunidade", args=[self.vaga_visagio.id]))
        self.assertFalse(Oportunidade.objects.filter(id=self.vaga_visagio.id).exists())


class FavoritarSoOQueVeTests(BaseTarefasSprint11):

    def test_aluno_nao_favorita_rascunho(self):
        self.vaga_visagio.rascunho = True
        self.vaga_visagio.save()
        self.entrar("ana@example.com")
        self.client.post(reverse("favoritar", args=[self.vaga_visagio.id]))
        self.assertFalse(Favorito.objects.filter(aluno=self.aluno, oportunidade=self.vaga_visagio).exists())

    def test_aluno_nao_favorita_vaga_de_outra_universidade(self):
        uff = Instituicao.objects.create(tipo="faculdade", nome="UFF", sede="Niterói")
        vaga_uff = Oportunidade.objects.create(
            instituicao=uff, curso=self.curso, tipo="monitoria", titulo="Monitoria na UFF", descricao="x",
            requisitos="x", carga_horaria=6, prazo_inscricao=date.today() + timedelta(days=5), modalidade="presencial",
        )
        self.entrar("ana@example.com")
        self.client.post(reverse("favoritar", args=[vaga_uff.id]))
        self.assertFalse(Favorito.objects.filter(aluno=self.aluno, oportunidade=vaga_uff).exists())

    def test_aluno_favorita_e_desfavorita_o_que_ve(self):
        self.entrar("ana@example.com")
        self.client.post(reverse("favoritar", args=[self.vaga_puc.id]))
        self.assertTrue(Favorito.objects.filter(aluno=self.aluno, oportunidade=self.vaga_puc).exists())
        self.client.post(reverse("favoritar", args=[self.vaga_puc.id]))
        self.assertFalse(Favorito.objects.filter(aluno=self.aluno, oportunidade=self.vaga_puc).exists())

    def test_nao_volta_para_outro_site(self):
        self.entrar("ana@example.com")
        resposta = self.client.post(reverse("favoritar", args=[self.vaga_puc.id]), HTTP_REFERER="https://site-falso.com/")
        self.assertRedirects(resposta, reverse("inicio"), fetch_redirect_response=False)


class PerfilSemCurriculoTests(BaseTarefasSprint11):

    def test_salva_periodo_com_curriculo_vazio(self):
        self.entrar("ana@example.com")
        resposta = self.client.post(reverse("tela_perfil"), {"periodo": "7", "cr": "8", "curriculo": "", "aparecer_em_buscas": "on"})
        self.assertRedirects(resposta, reverse("tela_perfil"))
        self.aluno.refresh_from_db()
        self.assertEqual(self.aluno.periodo, 7)
        self.assertEqual(self.aluno.curriculo, "")


class RegrasDeSenhaNoCadastroTests(BaseTarefasSprint11):

    def dados_aluno(self, senha):
        return {
            "nome_completo": "Joana Teste", "email_academico": "joana@example.com", "senha": senha,
            "matricula": "2410001", "universidade": str(self.puc.pk), "curso": str(self.curso.pk),
            "periodo_atual": "3", "cr": "", "aceitar_termos": "on",
        }

    def test_aluno_nao_cadastra_senha_so_com_numeros(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_aluno("12345678"))
        self.assertEqual(resposta.status_code, 200)
        self.assertTrue(resposta.context["form"].errors.get("senha"))
        self.assertFalse(User.objects.filter(username="joana@example.com").exists())

    def test_aluno_nao_cadastra_senha_comum(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_aluno("password"))
        self.assertTrue(resposta.context["form"].errors.get("senha"))

    def test_recrutador_nao_cadastra_senha_parecida_com_o_email(self):
        dados = {"nome": "Paulo", "email": "paulosouza@example.com", "cargo": "RH", "senha": "paulosouza",
                 "empresa": str(self.visagio.pk), "aceita_termos": "on"}
        resposta = self.client.post("/templates/PROJETOtela_informacoes_recrutador.html", dados)
        self.assertEqual(resposta.status_code, 200)
        self.assertFalse(User.objects.filter(username="paulosouza@example.com").exists())

    def test_senha_boa_continua_funcionando(self):
        resposta = self.client.post("/templates/PROJETOtela_informacoes_estudante.html", self.dados_aluno("senha-segura-123"))
        self.assertEqual(resposta.status_code, 302)


class AdminRecusarERevogarTests(BaseTarefasSprint11):

    def test_admin_retira_aprovacao(self):
        self.carla.verificado = True
        self.carla.save()
        self.entrar("admin@example.com")
        self.client.post(reverse("revogar_conta", args=[self.carla.user.id]))
        self.carla.refresh_from_db()
        self.assertFalse(self.carla.verificado)
        # sem aprovação, a Carla não publica
        self.client.logout()
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_nova_oportunidade"))
        self.assertRedirects(resposta, reverse("tela_painel"), fetch_redirect_response=False)

    def test_admin_recusa_conta_em_analise(self):
        self.entrar("admin@example.com")
        self.client.post(reverse("recusar_conta", args=[self.rafael.user.id]))
        self.assertFalse(User.objects.filter(username="rafael@example.com").exists())
        self.assertFalse(Recrutador.objects.filter(id=self.rafael.id).exists())

    def test_admin_nao_recusa_conta_aprovada(self):
        self.carla.verificado = True
        self.carla.save()
        self.entrar("admin@example.com")
        self.client.post(reverse("recusar_conta", args=[self.carla.user.id]))
        self.assertTrue(User.objects.filter(username="carla@example.com").exists())

    def test_so_admin_recusa_e_revoga(self):
        self.entrar("carla@example.com")
        self.client.post(reverse("recusar_conta", args=[self.rafael.user.id]))
        self.assertTrue(User.objects.filter(username="rafael@example.com").exists())

    def test_tela_mostra_os_botoes(self):
        self.carla.verificado = True
        self.carla.save()
        self.entrar("admin@example.com")
        resposta = self.client.get(reverse("tela_admin"))
        self.assertContains(resposta, "Retirar aprovação")
        self.assertContains(resposta, "Recusar")


class NovoTipoDeOportunidadeTests(BaseTarefasSprint11):

    def setUp(self):
        super().setUp()
        self.carla.verificado = True
        self.carla.save()

    def dados_vaga(self, tipo, tipo_novo=""):
        return {
            "tipo": tipo, "tipo_novo": tipo_novo, "titulo": "Programa de trainee 2027", "descricao": "x",
            "requisitos": "x", "curso": str(self.curso.id), "periodo_minimo": "6", "carga_horaria": "40",
            "prazo_inscricao": (date.today() + timedelta(days=30)).isoformat(), "remuneracao": "5000",
            "modalidade": "presencial", "link_externo": "",
        }

    def test_sugestao_fica_padronizada_e_em_analise(self):
        self.entrar("carla@example.com")
        self.client.post(reverse("sugerir_tipo"), {"nome": "  PROGRAMA   de TRAINEE "})
        tipo = TipoOportunidade.objects.get()
        self.assertEqual(tipo.nome, "Programa de trainee")
        self.assertFalse(tipo.aprovado)
        self.assertEqual(tipo.sugerido_por, self.carla.user)

    def test_nao_repete_tipo(self):
        self.entrar("carla@example.com")
        self.client.post(reverse("sugerir_tipo"), {"nome": "Programa de trainee"})
        self.client.post(reverse("sugerir_tipo"), {"nome": "programa DE trainee"})
        self.client.post(reverse("sugerir_tipo"), {"nome": "estágio"})
        self.assertEqual(TipoOportunidade.objects.count(), 1)

    def test_conta_em_analise_nao_sugere(self):
        self.entrar("rafael@example.com")
        self.client.post(reverse("sugerir_tipo"), {"nome": "Programa de trainee"})
        self.assertEqual(TipoOportunidade.objects.count(), 0)

    def test_tipo_em_analise_nao_pode_ser_usado(self):
        tipo = TipoOportunidade.objects.create(nome="Programa de trainee", sugerido_por=self.carla.user)
        self.entrar("carla@example.com")
        resposta = self.client.get(reverse("tela_nova_oportunidade"))
        self.assertNotContains(resposta, 'value="outro"')
        self.client.post(reverse("tela_nova_oportunidade"), self.dados_vaga("outro", str(tipo.id)))
        self.assertFalse(Oportunidade.objects.filter(titulo="Programa de trainee 2027").exists())

    def test_admin_aprova_e_tipo_e_usado_na_vaga(self):
        tipo = TipoOportunidade.objects.create(nome="Programa de trainee", sugerido_por=self.carla.user)
        self.entrar("admin@example.com")
        resposta = self.client.get(reverse("tela_admin"))
        self.assertContains(resposta, "Programa de trainee")
        self.client.post(reverse("aprovar_tipo", args=[tipo.id]))
        tipo.refresh_from_db()
        self.assertTrue(tipo.aprovado)
        self.client.logout()

        self.entrar("carla@example.com")
        resposta = self.client.post(reverse("tela_nova_oportunidade"), self.dados_vaga("outro", str(tipo.id)))
        self.assertRedirects(resposta, reverse("tela_painel"), fetch_redirect_response=False)
        vaga = Oportunidade.objects.get(titulo="Programa de trainee 2027")
        self.assertEqual(vaga.tipo, "outro")
        self.assertEqual(vaga.get_tipo_display(), "Programa de trainee")
        self.client.logout()

        # vaga de empresa num tipo novo aparece para o aluno, com o nome do tipo
        self.entrar("ana@example.com")
        resposta = self.client.get(reverse("tela_busca") + "?q=trainee")
        self.assertContains(resposta, "Programa de trainee 2027")

    def test_outro_tipo_exige_escolher_qual(self):
        TipoOportunidade.objects.create(nome="Programa de trainee", aprovado=True)
        self.entrar("carla@example.com")
        resposta = self.client.post(reverse("tela_nova_oportunidade"), self.dados_vaga("outro"))
        self.assertEqual(resposta.status_code, 200)
        self.assertContains(resposta, "Escolha qual é o tipo.")

    def test_admin_recusa_sugestao(self):
        tipo = TipoOportunidade.objects.create(nome="Bootcamp", sugerido_por=self.carla.user)
        self.entrar("admin@example.com")
        self.client.post(reverse("recusar_tipo", args=[tipo.id]))
        self.assertFalse(TipoOportunidade.objects.exists())

    def test_so_admin_aprova(self):
        tipo = TipoOportunidade.objects.create(nome="Bootcamp", sugerido_por=self.carla.user)
        self.entrar("carla@example.com")
        self.client.post(reverse("aprovar_tipo", args=[tipo.id]))
        tipo.refresh_from_db()
        self.assertFalse(tipo.aprovado)
