## SOMA
def calcula_soma(a, b):
    return a + b

## SUBTRAÇAO
def calcula_subtracao(a, b):
    return a - b

## MULTIPLICAÇÃO
def calcula_multiplicacao(a, b):
    return

## DIVISÃO
def calcula_divisao(a, b):
    return

## EXPONENCIACAO
def calcula_exponenciacao(a, b):
    return

## RADICIACAO
def calcula_radiciacao(a, b):
    return 

## DIVISAO INTEIRA
def calcula_divisao_inteira(a, b):
    return

## RESTO DA DIVISAO
def calcula_resto_divisao(a, b):
    return

## PERCENTUAL
def calcula_percentual(a, b):
    return


def exibe_mensagem_inicial():

    print("Escolha uma das opções abaixo:\n\n" \
    "1 - Adição\n" \
    "2 - Subtração\n" \
    "3 - Multiplicação\n" \
    "4 - Divisão\n" \
    "5 - Exponenciação\n" \
    "6 - Radiciação\n" \
    "7 - Divisão inteira\n" \
    "8 - Resto da divisão\n" \
    "9 - Percentual\n" \
    "0 - Sair")

def main():

    print("="*40)
    print(" "*14 + "CALCULADORA")
    print("="*40)
    print()

    while True:
        exibe_mensagem_inicial()
        operacao = int(input("\nOpção: "))

        if operacao == 0:
            print("Saindo...")
            break

        if operacao < 1 or operacao > 9:
            print("Opção inválida.\n")
            continue

        a = float(input("Primeiro número: "))
        b = float(input("Segundo número: "))

        if operacao == 1:
            print("A soma é :", soma(a, b))              
        elif operacao == 2:
            print("A subtração é :", subtracao(a, b))         
        elif operacao == 3:
            print("A multiplicação é :", multiplicacao(a, b))     
        elif operacao == 4:
            print("A divisão é :", divisao(a, b))           
        elif operacao == 5:
            print("A exponenciação é :", exponenciacao(a, b))     
        elif operacao == 6:
            print("A radiciação é :", radiciacao(a, b))        
        elif operacao == 7:
            print("A divisão inteira é :", divisao_inteira(a, b))   
        elif operacao == 8:
            print("O resto da divisão é :", resto_divisao(a, b))     
        elif operacao == 9:
            print("O percentual é :", percentual(a, b))        
        else:
            print("Opção inválida.")

main()