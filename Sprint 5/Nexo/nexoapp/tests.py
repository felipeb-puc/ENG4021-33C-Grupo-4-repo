from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse

from .models import Instituicao


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

        self.criar_conta_e_repetir_email(reverse("cadastro_aluno"), dados)

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
