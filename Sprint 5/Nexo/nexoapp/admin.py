from django.contrib import admin
from .models import Instituicao, Curso, Aluno, Oportunidade, Candidatura, Favorito

admin.site.register(Instituicao)
admin.site.register(Candidatura)
admin.site.register(Aluno)
admin.site.register(Curso)
admin.site.register(Oportunidade)
admin.site.register(Favorito)