from datetime import date


from django import forms
from django.contrib.auth.models import User
from .models import Instituicao, Curso, Oportunidade, Aluno


TIPOS_INSTITUICAO_REPRESENTANTE = [
    tipo for tipo in Instituicao.TIPOS if tipo[0] != "empresa"
]


class CadastroRecrutadorForm(forms.Form):
    nome = forms.CharField(
        label="Nome completo",
        max_length=100
    )

    email = forms.EmailField(
        label="E-mail corporativo"
    )

    cargo = forms.CharField(
        label="Cargo ou função",
        max_length=100
    )

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(
            attrs={"placeholder": "Mínimo de 8 caracteres"}
        )
    )

    empresa = forms.ChoiceField(
        label="Empresa",
        choices=[("", "Selecione")]
    )

    nova_empresa = forms.CharField(
        label="Nome da nova empresa",
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite o nome da empresa",
        }),
    )

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Já existe uma conta com este e-mail.")
        return email

    def clean_nova_empresa(self):
        nome = self.cleaned_data["nova_empresa"].strip()
        if self.cleaned_data.get("empresa") == "outro" and not nome:
            raise forms.ValidationError("Informe o nome da empresa.")
        return nome


class CadastroRepresentanteForm(forms.Form):
    nome = forms.CharField(
        label="Nome completo",
        max_length=100
    )

    email = forms.EmailField(
        label="E-mail corporativo"
    )

    cargo = forms.CharField(
        label="Cargo ou função",
        max_length=100
    )

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(
            attrs={"placeholder": "Mínimo de 8 caracteres"}
        )
    )

    empresa = forms.ChoiceField(
        label="Empresa",
        choices=[("", "Selecione")]
    )

    nova_instituicao = forms.CharField(
        label="Nome da nova instituição",
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite o nome da instituição",
        }),
    )

    tipo_nova_instituicao = forms.ChoiceField(
        label="Tipo da instituição",
        choices=[("", "Selecione")] + TIPOS_INSTITUICAO_REPRESENTANTE,
        required=False,
    )

    sede_nova_instituicao = forms.CharField(
        label="Sede",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            "placeholder": "Cidade ou localidade",
        }),
    )

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Já existe uma conta com este e-mail.")
        return email

    def clean_nova_instituicao(self):
        nome = self.cleaned_data["nova_instituicao"].strip()
        if self.cleaned_data.get("empresa") == "outro" and not nome:
            raise forms.ValidationError("Informe o nome da instituição.")
        return nome

    def clean_tipo_nova_instituicao(self):
        tipo = self.cleaned_data["tipo_nova_instituicao"]
        if self.cleaned_data.get("empresa") == "outro" and not tipo:
            raise forms.ValidationError("Selecione o tipo da instituição.")
        return tipo

    def clean_sede_nova_instituicao(self):
        sede = self.cleaned_data["sede_nova_instituicao"].strip()
        if self.cleaned_data.get("empresa") == "outro" and not sede:
            raise forms.ValidationError("Informe a sede da instituição.")
        return sede


class CadastroAlunoForm(forms.Form):
    nome_completo = forms.CharField(
        label="Nome completo",
        max_length=150,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite seu nome completo",
            "class": "form-control",
        })
    )

    email_academico = forms.EmailField(
        label="E-mail acadêmico",
        widget=forms.EmailInput(attrs={
            "placeholder": "seu.email@aluno.universidade.br",
            "class": "form-control",
        })
    )

    def clean_email_academico(self):
        email = self.cleaned_data["email_academico"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Já existe uma conta com este e-mail.")
        return email

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(attrs={
            "placeholder": "Mínimo de 8 caracteres",
            "class": "form-control",
        })
    )

    matricula = forms.CharField(
        label="Matrícula",
        max_length=20,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite sua matrícula",
            "class": "form-control",
        })
    )

    # as opções vêm do banco: o aluno escolhe uma universidade e um curso que já existem
    universidade = forms.ModelChoiceField(
        label="Universidade",
        queryset=Instituicao.objects.filter(tipo="faculdade").order_by("nome"),
        empty_label="Selecione",
        widget=forms.Select(attrs={"class": "form-control"})
    )

    curso = forms.ModelChoiceField(
        label="Curso",
        queryset=Curso.objects.order_by("nome"),
        empty_label="Selecione",
        widget=forms.Select(attrs={"class": "form-control"})
    )

    PERIODOS = [
        ("1", "1º período"),
        ("2", "2º período"),
        ("3", "3º período"),
        ("4", "4º período"),
        ("5", "5º período"),
        ("6", "6º período"),
        ("7", "7º período"),
        ("8", "8º período"),
        ("9", "9º período"),
        ("10", "10º período"),
        ("11", "11º período"),
        ("12", "12º período"),
    ]

    periodo_atual = forms.ChoiceField(
        label="Período atual",
        choices=PERIODOS,
        widget=forms.Select(attrs={"class": "form-control"})
    )

    cr = forms.DecimalField(
        label="CR (opcional)",
        required=False,
        min_value=0,
        max_value=10,
        max_digits=3,
        decimal_places=1,
        widget=forms.NumberInput(attrs={
            "placeholder": "Ex.: 8,4",
            "class": "form-control",
            "step": "0.1",
        })
    )

    aparecer_em_buscas = forms.BooleanField(
        label="Quero aparecer em buscas de recrutadores",
        required=False,
        initial=True,
    )

    aceitar_termos = forms.BooleanField(
        label="Aceito os termos de uso e a política de privacidade",
        required=True,
    )


class LoginForm(forms.Form):
    email = forms.EmailField(
        label="E-mail",
        widget=forms.EmailInput(attrs={
            "placeholder": "seu.email@universidade.br",
            "autocomplete": "email",
            "class": "com-icone",
        })
    )

    senha = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={
            "placeholder": "Sua senha",
            "autocomplete": "current-password",
        })
    )


class OportunidadeForm(forms.ModelForm):
    universidades_alvo = forms.ModelMultipleChoiceField(
        queryset=Instituicao.objects.filter(tipo="faculdade").order_by("nome"),
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label="Universidades que podem ver (só estágio; nenhuma marcada = todas)",
    )

    class Meta:
        model = Oportunidade
        fields = [
            "tipo",
            "titulo",
            "descricao",
            "requisitos",
            "curso",
            "periodo_minimo",
            "carga_horaria",
            "prazo_inscricao",
            "remuneracao",
            "modalidade",
            "link_externo",
            "universidades_alvo",
        ]
        widgets = {
            "descricao": forms.Textarea(attrs={"rows": 4}),
            "requisitos": forms.Textarea(attrs={"rows": 3}),
            "prazo_inscricao": forms.DateInput(attrs={"type": "date"}),
        }

    def clean_prazo_inscricao(self):
        prazo = self.cleaned_data["prazo_inscricao"]
        # só na criação: na edição de uma oportunidade antiga o prazo pode já ter passado
        if self.instance.pk is None and prazo < date.today():
            raise forms.ValidationError("O prazo não pode ser anterior a hoje.")
        return prazo

    def clean_carga_horaria(self):
        carga = self.cleaned_data["carga_horaria"]
        if carga < 1 or carga > 44:
            raise forms.ValidationError("A carga horária deve ficar entre 1 e 44 horas por semana.")
        return carga

    def clean_remuneracao(self):
        remuneracao = self.cleaned_data["remuneracao"]
        if remuneracao < 0:
            raise forms.ValidationError("A remuneração não pode ser negativa. Use 0 para voluntária.")
        return remuneracao

    def clean_periodo_minimo(self):
        periodo = self.cleaned_data["periodo_minimo"]
        if periodo < 1 or periodo > 12:
            raise forms.ValidationError("O período mínimo deve ficar entre 1 e 12.")
        return periodo

    def clean(self):
        dados = super().clean()
        # universidades-alvo só valem para estágio; nos outros tipos a lista fica vazia
        if dados.get("tipo") != "estagio":
            dados["universidades_alvo"] = Instituicao.objects.none()
        return dados


class InstituicaoForm(forms.ModelForm):
    class Meta:
        model = Instituicao
        fields = ["descricao", "site"]
        labels = {"descricao": "Descrição", "site": "Site"}
        widgets = {"descricao": forms.Textarea(attrs={"rows": 4})}


class PerfilAlunoForm(forms.ModelForm):
    # Só os campos que o aluno pode mudar. Universidade, curso e matrícula vêm do cadastro e não se editam.
    class Meta:
        model = Aluno
        fields = ["periodo", "cr", "curriculo"]
        labels = {
            "periodo": "Período",
            "cr": "CR",
            "curriculo": "Currículo",
        }
        widgets = {
            "periodo": forms.NumberInput(attrs={"min": 1, "max": 12}),
            "cr": forms.NumberInput(attrs={"min": 0, "max": 10, "step": "0.1"}),
            "curriculo": forms.Textarea(attrs={
                "rows": 10,
                "placeholder": "Resumo, áreas de interesse, habilidades e experiências (monitoria, liga, estágio, projetos...)",
            }),
        }

    def clean_periodo(self):
        periodo = self.cleaned_data["periodo"]
        if periodo < 1 or periodo > 12:
            raise forms.ValidationError("O período tem que ser de 1 a 12.")
        return periodo

    def clean_cr(self):
        cr = self.cleaned_data["cr"]
        if cr is not None and (cr < 0 or cr > 10):
            raise forms.ValidationError("O CR tem que ser de 0 a 10.")
        return cr
