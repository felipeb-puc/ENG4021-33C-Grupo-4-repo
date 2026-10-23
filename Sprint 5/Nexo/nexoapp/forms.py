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

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )


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

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )